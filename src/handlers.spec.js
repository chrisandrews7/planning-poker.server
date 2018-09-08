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
    join: sandbox.stub().yields(),
    to: sandbox.stub().returnsThis(),
    emit: sandbox.stub().returnsThis(),
  };
  let gameId;

  const dependencies = {
    constants,
    log: {
      info: () => {},
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

      it('emits to the room the user has joined', () => {
        expect(socketStub.to).to.have.been.calledWith(gameId);
        expect(socketStub.emit).to.have.been.calledWith(constants.PLAYER_JOINED, {
          id: socketStub.id,
          name,
        });
      });

      it('emits to the user the current game state', () => {
        expect(socketStub.emit).to.have.been.calledWith(constants.GAME_UPDATED, {
          game: getGameStub.state,
        });
      });
    });
  });

  describe('disconnect()', () => {
    it('removes the user from the game', () => {
      disconnect(socketStub);

      expect(dependencies.store.getGame).to.have.been.calledWithExactly(gameId);
      expect(getGameStub.removePlayer).to.have.been.calledWith(socketStub.id);
    });

    it('emits to the room the user has left', () => {
      disconnect(socketStub);

      expect(socketStub.to).to.have.been.calledWith(gameId);
      expect(socketStub.emit).to.have.been.calledWith(constants.PLAYER_LEFT, {
        id: socketStub.id,
      });
    });

    describe('when the user is not in any game', () => {
      it('does nothing', () => {
        socketStub.rooms = {};
        disconnect(socketStub);

        expect(socketStub.to).to.have.not.been.called;
        expect(socketStub.emit).to.have.not.been.called;
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

    it('emits to the room the users vote', () => {
      expect(socketStub.to).to.have.been.calledWith(gameId);
      expect(socketStub.emit).to.have.been.calledWith(constants.PLAYER_VOTED, {
        id: socketStub.id,
        vote,
      });
    });
  });
});
