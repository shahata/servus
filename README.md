servus
======
**Servus** ([Slovak](http://en.wikipedia.org/wiki/Slovak_language "Slovak language"): _Servus_, [Croatian](http://en.wikipedia.org/wiki/Croatian_language "Croatian language"): _Serbus_ or _Servus_, [Hungarian](http://en.wikipedia.org/wiki/Hungarian_language "Hungarian language"): _Szervusz_, [Polish](http://en.wikipedia.org/wiki/Polish_language "Polish language"): _Serwus_, [Austro-Bavarian](http://en.wikipedia.org/wiki/Austro-Bavarian "Austro-Bavarian"): _Servus_, [Romanian](http://en.wikipedia.org/wiki/Romanian_language "Romanian language"): _Servus_, [Slovene](http://en.wikipedia.org/wiki/Slovene_language "Slovene language"): _Serbus_ or _Servus_, [Czech](http://en.wikipedia.org/wiki/Czech_language "Czech language"): _Servus_, [Ukrainian](http://en.wikipedia.org/wiki/Ukrainian_language "Ukrainian language"): _Сервус_) is a [salutation](http://en.wikipedia.org/wiki/Salute "Salute") used in many parts of [Central](http://en.wikipedia.org/wiki/Central_Europe "Central Europe") and [Eastern Europe](http://en.wikipedia.org/wiki/Eastern_Europe "Eastern Europe"). It is a word of greeting or parting like the Italian "Ciao".

Servus is a simple [connect](http://www.senchalabs.org/connect/) based reverse proxy.

Map urls and filesystem folders to one servus server by simply adding *servus.conf.js* to your project and running **servus**.

```js
module.exports = {
  port: 8000,
  gzip: true,
  cors: true,

  aliases: {
    //remote api server
    '/_api/': 'http://www.pizza.wixpress.com/_api/',
    
    //local 'grunt server'
    '/_partials/wix-contacts-statics/latest/': 'http://localhost:9000/',
    
    //local tomcat server
    '/create/my-account': 'http://localhost:8080/wix-dashboard-ng-webapp/dashboard/',
    
    //local filesystem
    '/services/wix-dashboard-ng-static/': '../wix-dashboard-ng-static/src/main/static/'
  }
};
```
