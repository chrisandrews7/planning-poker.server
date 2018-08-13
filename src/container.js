const { asFunction, asValue, createContainer } = require('awilix');
const pino = require('pino')();
const socket = require('socket.io')();

const server = require('./server');
const constants = require('./constants');

const container = createContainer();

container.register({
  log: asValue(pino),
  socket: asValue(socket),
});

container.register({
  constants: asValue(constants),
  server: asFunction(server),
  config: asValue({
    PORT: 3000,
  }),
});

module.exports = container.cradle;
