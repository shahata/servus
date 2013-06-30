'use strict';

var url = require('url');
var connect = require('connect');
var reverseProxy = require('proxy-middleware');
var cors = require('connect-xcors');
//var jsonp = require('connect-jsonp');

module.exports = function () {
  var config = require(process.cwd() + '/servus.conf.js');

  var app = connect().use(connect.logger('dev'))
    .use(connect.responseTime())
    .use(connect.favicon());

  if (config.gzip) {
    app = app.use(connect.compress());
  }

  if (config.cors) {
    app = app.use(cors());
  }

  for (var alias in config.aliases) {
    var targets = config.aliases[alias];
    targets = Array.isArray(targets) ? targets : [targets];
    targets.forEach(function (target) {
      if (target.indexOf('://') > -1) {
        app = app.use(alias, reverseProxy(url.parse(target)));
      } else {
        app = app.use(alias, connect.static(target))
            .use(alias, connect.directory(target));
      }
    });
  }

  app.listen(config.port);
  console.log('Listening on port ' + config.port + '...');
};
