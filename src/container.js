const { asFunction, asValue, createContainer } = require('awilix');
const pino = require('pino')();
const socketio = require('socket.io');

const constants = require('./constants');
const server = require('./server');
const store = require('./store');
const handlers = require('./handlers');

const container = createContainer();

container.register({
  log: asValue(pino),
  socketio: asValue(socketio),
});

container.register({
  constants: asValue(constants),
  server: asFunction(server),
  store: asFunction(store),
  handlers: asFunction(handlers),
  config: asValue({
    PORT: process.env.PORT || 3000,
    CORS_WHITELIST: process.env.CORS_WHITELIST || '*:*',
  }),
});

module.exports = container.cradle;
