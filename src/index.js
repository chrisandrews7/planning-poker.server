const { server } = require('./container');

process.on('SIGINT', () => {
  server.stop();
});

server.start();
