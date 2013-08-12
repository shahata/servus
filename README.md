servus
======
A simple [connect](http://www.senchalabs.org/connect/) based reverse proxy.

Map urls and filesystem folders to one servus server by simply adding servus.conf.js to your project and running 'servus'.

```js
module.exports = {
  port: 8000,
  gzip: true,
  cors: true,

  aliases: {
    '/_api/': 'http://www.pizza.wixpress.com/_api/', //remote api server
    '/_partials/wix-contacts-statics/latest/': 'http://localhost:9000/', //local 'grunt server'
    '/create/my-account': 'http://localhost:8080/wix-dashboard-ng-webapp/dashboard/', //local tomcat server
    '/services/wix-dashboard-ng-static/': '../wix-dashboard-ng-static/src/main/static/', //local filesystem
  }
};
```
