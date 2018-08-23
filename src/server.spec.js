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
      castVote: stub().returns('castVoteHandler'),
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
    });
  });

  describe('stop()', () => {
    it('stops the server', () => {
      stop();

      expect(ioStub.close).to.have.been.called;
    });
  });
});
