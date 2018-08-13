const { expect } = require('chai');
const { createSandbox } = require('sinon');
const { v4 } = require('uuid');

const constants = require('./constants');
const handlersFactory = require('./handlers');

describe('handlers', () => {
  const sandbox = createSandbox();

  const getBoardStub = {
    addPlayer: sandbox.spy(),
    removePlayer: sandbox.spy(),
    setVote: sandbox.spy(),
    state: 'mockState',
  };
  const socketStub = {
    join: sandbox.stub(),
    to: sandbox.stub().returnsThis(),
    emit: sandbox.stub().returnsThis(),
  };

  const dependencies = {
    constants,
    log: {
      info: () => {},
    },
    store: {
      getBoard: sandbox.stub().returns(getBoardStub),
    },
  };
  const { connect, disconnect, castVote } = handlersFactory(dependencies);

  beforeEach(() => {
    socketStub.roomId = v4();
  });

  afterEach(() => {
    sandbox.resetHistory();
  });

  describe('connect()', () => {
    const name = 'Steve';

    beforeEach(() => {
      connect(socketStub, {
        name,
        roomId: socketStub.roomId,
      });
    });

    it('adds the user to the room', () => {
      expect(socketStub.join).to.have.been.calledWith(socketStub.roomId);
    });

    it('adds the user to the game board', () => {
      expect(dependencies.store.getBoard).to.have.been.calledWithExactly(socketStub.roomId);
      expect(getBoardStub.addPlayer).to.have.been.calledWith(socketStub.id, {
        name,
      });
    });

    it('emits to the room the user has joined', () => {
      expect(socketStub.to).to.have.been.calledWith(socketStub.roomId);
      expect(socketStub.emit).to.have.been.calledWith(constants.PLAYER_JOINED, {
        id: socketStub.id,
        name,
      });
    });

    it('emits to the user the current game board state', () => {
      expect(socketStub.to).to.have.been.calledWith(socketStub.id);
      expect(socketStub.emit).to.have.been.calledWith(constants.CONNECTED, {
        board: getBoardStub.state,
      });
    });
  });

  describe('disconnect()', () => {
    beforeEach(() => {
      disconnect(socketStub);
    });

    it('removes the user from the game board', () => {
      expect(dependencies.store.getBoard).to.have.been.calledWithExactly(socketStub.roomId);
      expect(getBoardStub.removePlayer).to.have.been.calledWith(socketStub.id);
    });

    it('emits to the room the user has left', () => {
      expect(socketStub.to).to.have.been.calledWith(socketStub.roomId);
      expect(socketStub.emit).to.have.been.calledWith(constants.PLAYER_LEFT, {
        id: socketStub.id,
      });
    });
  });

  describe('castVote()', () => {
    const vote = 5;

    beforeEach(() => {
      castVote(socketStub, { vote });
    });

    it('updates the users vote in the game board', () => {
      expect(dependencies.store.getBoard).to.have.been.calledWithExactly(socketStub.roomId);
      expect(getBoardStub.setVote).to.have.been.calledWithExactly(vote);
    });

    it('emits to the room the users vote', () => {
      expect(socketStub.to).to.have.been.calledWith(socketStub.roomId);
      expect(socketStub.emit).to.have.been.calledWith(constants.PLAYER_VOTED, {
        id: socketStub.id,
        vote,
      });
    });
  });
});
