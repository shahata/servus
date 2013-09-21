'use strict';

var fs = require('fs');
var url = require('url');
var path = require('path');
var open = require('open');
var chalk = require('chalk');
var resolve = require('resolve');
var updateNotifier = require('update-notifier');
var plugins = {
  'connect': require('connect'),
  'connect-xcors': require('connect-xcors')
};

var notifier = updateNotifier({packagePath: '../package.json', callback: function (error, update) {
  if (update && update.current !== update.latest) {
    notifier.update = update;
    notifier.notify();
  }
}});

function findPackage(name) {
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

function persistentListen(app, port, browse) {
  var server = app.listen(port, function bound() {
    console.log('Listening on port ' + chalk.green(port) + '...');
    if (browse) { open(browse); }
  });
  server.on('error', function (e) {
    if (e.code === 'EACCES' && port < 1024) {
      console.log('Port ' + chalk.red(port) + ' needs \'sudo\', trying higher port...');
      port += 9000;
      setTimeout(function () {
        server.listen(port);
      }, 1000);
    } else if (e.code === 'EADDRINUSE') {
      console.log('Port ' + chalk.red(port) + ' in use, retrying...');
      setTimeout(function () {
        server.listen(++port);
      }, 1000);
    }
  });
  return server;
}

function loadConfig(filename, reloadCallback) {
  var config;
  try {
    config = require(filename);
  } catch(e) {
    console.log(chalk.red('Error') + ' parsing config! ignoring new config.');
  }
  fs.watchFile(filename, {persistent: false, interval: 5000}, function () {
    console.log(chalk.yellow('\nReloading') + ' config...');
    fs.unwatchFile(filename);
    delete require.cache[filename];

    var reload = loadConfig(filename, reloadCallback);
    if (reload) {
      module.exports.config = reload;
      reloadCallback();
    }
  });
  return config || null;
}

module.exports.config = null;

module.exports = function startServer() {
  module.exports.config = module.exports.config || loadConfig(path.join(process.cwd(), 'servus.conf.js'), startServer) || {};

  var config = module.exports.config;
  config.aliases = config.aliases || {};

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
        if (target.indexOf('://') > -1) {
          target = {plugin: 'proxy-middleware', args: [url.parse(target)]};
        } else {
          target = {plugin: 'connect.static', args: [target]};
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

  //server is global
  if (module.server) { module.server.close(); }
  module.server = persistentListen(app, config.port, config.open);
};
