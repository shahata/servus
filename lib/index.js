'use strict';

var url = require('url');
var path = require('path');
var plugins = {
  'connect': require('connect'),
  'connect-xcors': require('connect-xcors')
};

module.exports = function () {
  var config = require(path.join(process.cwd(), '/servus.conf.js')) || {};
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
        plugins[parts[0]] = (plugins[parts[0]] ? plugins[parts[0]] : require(parts[0]));
        func = (parts.length === 1 ? plugins[parts[0]] : plugins[parts[0]][parts[1]]);
        if (typeof(func) !== 'function') {
          throw 'Cannot find function ' + target.plugin;
        }
      }
      app = app.use(alias, func.apply(this, target.args));
    }
  }

  var server = app.listen(config.port, function bound() {
    console.log('Listening on port ' + config.port + '...');
  });
  server.on('error', function (e) {
    if (e.code === 'EADDRINUSE') {
      console.log('Port ' + config.port + ' in use, retrying...');
      setTimeout(function () {
        server.listen(++config.port);
      }, 1000);
    }
  });
};
