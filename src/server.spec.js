const { expect } = require('chai');
const { stub, createSandbox } = require('sinon');

const constants = require('./constants');
const serverFactory = require('./server');

describe('server', () => {
  const sandbox = createSandbox();

  const ioStub = {
    on: sandbox.stub(),
    close: sandbox.stub(),
    origins: sandbox.spy(),
  };

  const dependencies = {
    constants,
    config: {
      PORT: 3000,
      CORS_WHITELIST: 'test.com',
    },
    log: {
      info: () => {},
    },
    socketio: stub().returns(ioStub),
    handlers: {
      connect: sandbox.spy(),
      castVote: sandbox.spy(),
      resetVotes: sandbox.spy(),
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

    it('sets CORS the socket server', () => {
      expect(ioStub.origins).to.have.been.calledWithExactly(dependencies.config.CORS_WHITELIST);
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

      describe('on a RESET event', () => {
        it('uses the resetVotes handler', () => {
          const socketStub = { on: sandbox.stub().yields() };
          ioStub
            .on
            .withArgs(constants.CONNECTION)
            .yield(socketStub);

          expect(socketStub.on).to.have.been.calledWith(
            constants.RESET,
          );
          expect(dependencies.handlers.resetVotes).to.have.been.calledWith(socketStub);
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
