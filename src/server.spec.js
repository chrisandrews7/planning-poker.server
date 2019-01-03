const { expect } = require('chai');
const { stub, createSandbox } = require('sinon');

const constants = require('./constants');
const serverFactory = require('./server');

describe('server', () => {
  const sandbox = createSandbox();

  const ioStub = {
    on: sandbox.stub(),
    close: sandbox.stub(),
  };

  const dependencies = {
    constants,
    config: {
      PORT: 3000,
    },
    log: {
      info: () => {},
    },
    socketio: stub().returns(ioStub),
    handlers: {
      connect: sandbox.spy(),
      castVote: sandbox.spy(),
      disconnect: sandbox.spy(),
    },
  };
  const { start, stop } = serverFactory(dependencies);

  afterEach(() => {
    sandbox.reset();
  });

  describe('start()', () => {
    beforeEach(() => {
      start();
    });

    it('starts the socket server', () => {
      expect(dependencies.socketio).to.have.been.calledWithExactly(dependencies.config.PORT);
    });

    describe('on a new socket connection', () => {
      describe('on a JOIN event', () => {
        it('uses the connect handler', () => {
          const socketStub = { on: sandbox.stub().yields('testJoinData') };
          ioStub
            .on
            .withArgs(constants.CONNECTION)
            .yield(socketStub);

          expect(socketStub.on).to.have.been.calledWith(
            constants.JOIN,
          );
          expect(dependencies.handlers.connect).to.have.been.calledWith(socketStub, 'testJoinData');
        });
      });

      describe('on a VOTE event', () => {
        it('uses the castVote handler', () => {
          const socketStub = { on: sandbox.stub().yields('testVoteValue') };
          ioStub
            .on
            .withArgs(constants.CONNECTION)
            .yield(socketStub);

          expect(socketStub.on).to.have.been.calledWith(
            constants.VOTE,
          );
          expect(dependencies.handlers.castVote).to.have.been.calledWith(socketStub, 'testVoteValue');
        });
      });

      describe('on a DISCONNECTING event', () => {
        it('uses the disconnect handler', () => {
          const socketStub = { on: sandbox.stub().yields('testDisconnectData') };
          ioStub
            .on
            .withArgs(constants.CONNECTION)
            .yield(socketStub);

          expect(socketStub.on).to.have.been.calledWith(
            constants.DISCONNECTING,
          );
          expect(dependencies.handlers.disconnect).to.have.been.calledWith(socketStub, 'testDisconnectData');
        });
      });
    });
  });

  describe('stop()', () => {
    it('stops the server', () => {
      ioStub.close.yields();
      stop();

      expect(ioStub.close).to.have.been.called;
    });
  });
});
