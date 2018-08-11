const { asFunction, asValue, createContainer } = require('awilix');
const pino = require('pino')();
const socker = require('socket.io');

const container = createContainer();

container.register({
  logger: asValue(pino),
  socket: asValue(socket),
});

module.exports = container.cradle;
