'use strict';

var fs = require('fs');
var url = require('url');
var path = require('path');
var resolve = require('resolve');
var plugins = {
  'connect': require('connect'),
  'connect-xcors': require('connect-xcors')
};

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

function persistentListen(app, port) {
  var server = app.listen(port, function bound() {
    console.log('Listening on port ' + port + '...');
  });
  server.on('error', function (e) {
    if (e.code === 'EADDRINUSE') {
      console.log('Port ' + port + ' in use, retrying...');
      setTimeout(function () {
        server.listen(++port);
      }, 1000);
    }
  });
  return server;
}

function loadConfig(fn, reloadCallback) {
  var config = require(fn) || {};
  fs.watchFile(fn, {persistent: false, interval: 5000}, function () {
    console.log('Reloading config...');
    fs.unwatchFile(fn);
    delete require.cache[fn];
    reloadCallback();
  });
  return config || {};
}

module.exports = function startServer() {
  var config = loadConfig(path.join(process.cwd(), 'servus.conf.js'), startServer);
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
  module.server = persistentListen(app, config.port);
};
