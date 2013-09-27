'use strict';

var _ = require('lodash');
var fs = require('fs');
var url = require('url');
var path = require('path');
var open = require('open');
var chalk = require('chalk');
var resolve = require('resolve');
var plugins = {
  'connect': require('connect'),
  'connect-xcors': require('connect-xcors')
};

function findPackage (name) {
  try {
    return require(resolve.sync(name, {basedir: __dirname}));
  } catch (e) {
    //noop
  }
  try {
    return require(resolve.sync(name, {basedir: process.cwd()}));
  } catch (e) {
    //noop
  }
  return require(resolve.sync(name, {basedir: path.join(__dirname, '../../..')}));
}

function persistentListen (app, config) {
  config.port = config.port || 9000;
  var server = app.listen(config.port, function onbound () {
    console.log('Listening on port ' + chalk.green(config.port) + '...');
    if (config.open) { open(_.template(config.open, config)); }
  });
  server.on('error', function onerror (e) {
    if (e.code === 'EACCES' && config.port < 1024) {
      console.log('Port ' + chalk.red(config.port) + ' needs \'sudo\', '+chalk.gray('trying higher port...'));
      config.port += 9000;
      setTimeout(function () {
        server.listen(config.port);
      }, 1000);
    } else if (e.code === 'EADDRINUSE') {
      console.log('Port ' + chalk.red(config.port) + ' in use, '+chalk.gray('retrying...'));
      setTimeout(function () {
        server.listen(++config.port);
      }, 1000);
    }
  });
  return server;
}

function findConfig (filename) {
  var configLocation = process.cwd();
  var chdir = true;
  while (!fs.existsSync(path.join(configLocation, filename))) {
    var next = path.resolve(configLocation, '..');
    if (next === configLocation) {
      console.log(chalk.bold(filename)+' '+chalk.yellow('does not exist')+'! '+chalk.gray('Using default config.'));
      configLocation = __dirname;
      chdir = false;
    } else {
      configLocation = next;
    }
  }
  if (chdir) {
    process.chdir(configLocation);
  }
  return path.join(configLocation, filename);
}

function loadConfig (filename, reloadCallback) {
  var config;
  try {
    config = require(filename);
  } catch(e) {
    console.log(chalk.red('Error') + ' parsing config! '+chalk.gray('Ignoring config.'));
  }
  fs.watchFile(filename, {persistent: false, interval: 5000}, function onchange () {
    console.log(chalk.yellow('\nReloading') + ' config...');
    fs.unwatchFile(filename);
    delete require.cache[filename];

    var reload = loadConfig(filename, reloadCallback);
    if (reload) {
      reloadCallback(reload);
    }
  });
  return config || null;
}

module.exports = function startServer (options, reload) {
  var config = reload || loadConfig(findConfig('servus.conf.js'), startServer.bind(undefined, options)) || {};
  config = _.assign(config, options || {});
  config.aliases = config.aliases || {'/': '.'};

  var app = plugins.connect()
    .use(plugins.connect.logger('dev'))
    .use(plugins.connect.favicon(config.favicon));

  app = (config.gzip ? app.use(plugins.connect.compress()) : app);
  app = (config.cors ? app.use(plugins['connect-xcors']()) : app);

  for (var alias in config.aliases) {
    var targets = config.aliases[alias];
    targets = Array.isArray(targets) ? targets : [targets];
    for (var i = 0; i < targets.length; i++) {
      var target = targets[i];
      if (typeof(target) === 'string') {
        target = _.template(target, config);
        if (target.indexOf('://') > -1) {
          target = {plugin: 'proxy-middleware', args: [url.parse(target)]};
        } else {
          target = {plugin: 'connect.static', args: [target === '.' ? process.cwd() : target]};
          targets.push({plugin: 'connect.directory', args: target.args});
        }
      }

      var func = target.plugin;
      if (typeof(func) !== 'function') {
        var parts = target.plugin.split('.');
        plugins[parts[0]] = (plugins[parts[0]] ? plugins[parts[0]] : findPackage(parts[0]));
        func = (parts.length === 1 ? plugins[parts[0]] : plugins[parts[0]][parts[1]]);
        if (typeof(func) !== 'function') {
          throw 'Cannot find function ' + target.plugin;
        }
      }
      app = app.use(alias, func.apply(this, target.args));
    }
  }

  if (module.exports.server) { module.exports.server.close(); }
  module.exports.server = persistentListen(app, config);
};
