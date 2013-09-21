'use strict';

var server = 'localhost';

module.exports = {
  port: 80,
  gzip: true,
  cors: true,
  open: 'http://localhost/',

  aliases: {
    '/': '../../Downloads',
    '/docs/dl': 'http://' + server + '/docs',
    '/docs': ['../../Downloads', '../../Documents']
  }
};