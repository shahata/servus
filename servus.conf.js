module.exports = {
  port: 80,
  gzip: true,
  cors: true,

  variables: {
    server: 'localhost'
  },

  aliases: {
    '/': '../../Downloads',
    '/docs': ['../../Downloads', '../../Documents'],
    '/docs/dl': 'http://localhost/docs'
    //'/docs/dl': 'http://{{server}}',

    //'/blob': {plugin: 'blob', params: {}}
  }
};