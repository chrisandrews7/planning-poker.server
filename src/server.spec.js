const { expect } = require('chai');
const { stub, spy } = require('sinon');

const serverFactory = require('./server');

describe('server', () => {
  const dependencies = {
    socket: {
      listen: spy(),
      close: stub().yields(),
    },
    config: {
      PORT: 3000,
    },
    log: {
      info: () => {},
    },
  };
  const { start, stop } = serverFactory(dependencies);

  describe('start()', () => {
    it('starts the server', () => {
      start();

      expect(dependencies.socket.listen).to.have.been.calledWithExactly(dependencies.config.PORT);
    });
  });

  describe('stop()', () => {
    it('stops the server', () => {
      stop();

      expect(dependencies.socket.close).to.have.been.called;
    });
  });
});