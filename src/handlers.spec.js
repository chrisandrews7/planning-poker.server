const { expect } = require('chai');
const { createSandbox } = require('sinon');
const { v4 } = require('uuid');

const constants = require('./constants');
const handlersFactory = require('./handlers');

describe('handlers', () => {
  const sandbox = createSandbox();

  const getGameStub = {
    addPlayer: sandbox.spy(),
    removePlayer: sandbox.spy(),
    setVote: sandbox.spy(),
    state: 'mockState',
  };
  const socketStub = {
    broadcast: {
      to: sandbox.stub().returnsThis(),
      emit: sandbox.stub().returnsThis(),
    },
    emit: sandbox.stub().returnsThis(),
    join: sandbox.stub().yields(),
  };

  let gameId;

  const dependencies = {
    constants,
    log: {
      child: () => ({
        trace: () => {},
        warn: () => {},
        error: ({ err }) => { throw err; },
      }),
    },
    store: {
      getGame: sandbox.stub().returns(getGameStub),
    },
  };
  const { connect, disconnect, castVote } = handlersFactory(dependencies);

  beforeEach(() => {
    gameId = v4();

    socketStub.id = v4();
    socketStub.rooms = {
      [gameId]: gameId,
      [socketStub.id]: socketStub.id,
    };
  });

  afterEach(() => {
    sandbox.resetHistory();
  });

  describe('connect()', () => {
    const name = 'Steve';

    beforeEach(() => {
      connect(socketStub, {
        name,
        gameId,
      });
    });

    it('adds the user to the room', () => {
      expect(socketStub.join).to.have.been.calledWith(gameId);
    });

    describe('once joined', () => {
      it('adds the user to the game', () => {
        expect(dependencies.store.getGame).to.have.been.calledWithExactly(gameId);
        expect(getGameStub.addPlayer).to.have.been.calledWith(socketStub.id, {
          name,
        });
      });

      it('broadcasts the updated game state', () => {
        expect(socketStub.broadcast.to).to.have.been.calledWith(gameId);
        expect(socketStub.broadcast.emit).to.have.been.calledWith(
          constants.BOARD_UPDATED,
          { board: getGameStub.state },
        );
      });

      it('emits to the user the game state', () => {
        expect(socketStub.emit).to.have.been.calledWith(
          constants.BOARD_UPDATED,
          { board: getGameStub.state },
        );
      });

      it('emits to the user that they joined successfully', () => {
        expect(socketStub.emit).to.have.been.calledWith(
          constants.JOINED_GAME,
          { gameId },
        );
      });
    });
  });

  describe('disconnect()', () => {
    describe('when the user is in a room', () => {
      beforeEach(() => {
        disconnect(socketStub);
      });

      it('removes the user from the game', () => {
        expect(dependencies.store.getGame).to.have.been.calledWithExactly(gameId);
        expect(getGameStub.removePlayer).to.have.been.calledWith(socketStub.id);
      });

      it('broadcasts the updated game state', () => {
        expect(socketStub.broadcast.to).to.have.been.calledWith(gameId);
        expect(socketStub.broadcast.emit).to.have.been.calledWith(
          constants.BOARD_UPDATED,
          { board: getGameStub.state },
        );
      });

      it('emits to the user the game state', () => {
        expect(socketStub.emit).to.have.been.calledWith(
          constants.BOARD_UPDATED,
          { board: getGameStub.state },
        );
      });
    });

    describe('when the user is not in any game', () => {
      it('does nothing', () => {
        socketStub.rooms = {};
        disconnect(socketStub);

        expect(socketStub.broadcast.to).to.have.not.been.called;
        expect(socketStub.broadcast.emit).to.have.not.been.called;
        expect(dependencies.store.getGame).to.have.not.been.called;
      });
    });
  });

  describe('castVote()', () => {
    const vote = 5;

    beforeEach(() => {
      castVote(socketStub, { vote });
    });

    it('updates the users vote in the game', () => {
      expect(dependencies.store.getGame).to.have.been.calledWithExactly(gameId);
      expect(getGameStub.setVote).to.have.been.calledWithExactly(socketStub.id, vote);
    });

    it('broadcasts the updated game state', () => {
      expect(socketStub.broadcast.to).to.have.been.calledWith(gameId);
      expect(socketStub.broadcast.emit).to.have.been.calledWith(
        constants.BOARD_UPDATED,
        { board: getGameStub.state },
      );
    });

    it('emits to the user the game state', () => {
      expect(socketStub.emit).to.have.been.calledWith(
        constants.BOARD_UPDATED,
        { board: getGameStub.state },
      );
    });
  });
});
