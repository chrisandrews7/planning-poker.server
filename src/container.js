const { asFunction, asValue, createContainer } = require('awilix');
const pino = require('pino')();
const io = require('socket.io')();

const constants = require('./constants');
const server = require('./server');
const store = require('./store');
const handlers = require('./handlers');

const container = createContainer();

container.register({
  log: asValue(pino),
  io: asValue(io),
});

container.register({
  constants: asValue(constants),
  server: asFunction(server),
  store: asFunction(store),
  handlers: asFunction(handlers),
  config: asValue({
    PORT: 3000,
  }),
});

module.exports = container.cradle;
