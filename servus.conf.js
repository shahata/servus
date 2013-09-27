'use strict';

module.exports = {
  port: 9000, //override in command line with --port ###
  gzip: true, //override in command line with --gzip or --no-gzip
  cors: true, //override in command line with --cors or --no-cors
  open: 'http://localhost:<%= port %>', //override in command line with --open URL or --no-open

  //add custom attributes and use them as template attributes throughout your config
  //override in command line using 'servus --stagingServer=sake' (the = is important)
  stagingServer: 'pizza',

  aliases: {
    //default local filesystem server
    '/': '.'

    //remote api server
    // '/_api/': 'http://www.<%= stagingServer %>.wixpress.com/_api/',

    //local 'grunt server'
    // '/_partials/wix-contacts-statics/latest/': 'http://localhost:9000/',

    //local tomcat server
    // '/create/my-account': 'http://localhost:8080/wix-dashboard-ng-webapp/dashboard/',

    //local filesystem
    // '/services/wix-dashboard-ng-static/': '../wix-dashboard-ng-static/src/main/static/'

    //need something special?
    // '/mapped/path/': {plugin: 'some-connect-plugin', args: [arg1, arg2, ...]}

    //or just add you connect function inline
    // '/mapped/path/': {plugin: function() {}, args: [arg1, arg2, ...]}
  }
};