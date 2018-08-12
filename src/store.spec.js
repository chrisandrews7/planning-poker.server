const { expect } = require('chai');
const { v4 } = require('uuid');

const storeFactory = require('./store');

describe('store', () => {
  let boardId;
  const store = storeFactory({});

  beforeEach(() => {
    boardId = v4();
    store.setBoard(boardId);
  });

  describe('startBoard()', () => {
    describe('when no board ID is provided', () => {
      it('throws an error', () => {
        expect(store.setBoard).to.throw(Error, 'Board ID is required');
      });
    });

    it('generates a new board', () => {
      expect(store.getBoard(boardId).state).to.deep.equal(new Map());
    });
  });

  describe('getBoard()', () => {
    describe('when no board ID is provided', () => {
      it('throws an error', () => {
        expect(store.getBoard).to.throw(Error, 'Board ID is required');
      });
    });

    describe('state', () => {
      it('returns the current state of a board', () => {
        const { state } = store.getBoard(boardId);

        expect(state).to.deep.equal(new Map());
      });
    });

    describe('addPlayer()', () => {
      const playerId = v4();
      const player = {
        name: 'Steve',
        vote: undefined,
      };

      describe('when no player ID is provided', () => {
        it('throws an error', () => {
          const { addPlayer } = store.getBoard(boardId);

          expect(addPlayer).to.throw(Error, 'Player ID is required');
        });
      });

      describe('when no player name is provided', () => {
        it('throws an error', () => {
          const { addPlayer } = store.getBoard(boardId);

          expect(() => addPlayer(playerId, {})).to.throw(Error, 'Player Name is required');
        });
      });

      describe('when no default vote is provided', () => {
        it('sets a default undefined value', () => {
          const { addPlayer, state } = store.getBoard(boardId);
          addPlayer(playerId, { name: 'Simon' }); // No vote value

          expect(state.get(playerId)).to.have.property('vote', undefined);
        });
      });

      it('adds the new player to the board', () => {
        const { addPlayer, state } = store.getBoard(boardId);
        addPlayer(playerId, player);

        expect(state.get(playerId)).to.deep.equal(player);
      });
    });

    describe('removePlayer()', () => {
      const playerId = v4();

      describe('when no player ID is provided', () => {
        it('throws an error', () => {
          const { removePlayer } = store.getBoard(boardId);

          expect(removePlayer).to.throw(Error, 'Player ID is required');
        });
      });

      it('removes the player from the board', () => {
        const { removePlayer, state } = store.getBoard(boardId);
        removePlayer(playerId);

        expect(state.has(playerId)).to.be.false;
      });
    });

    describe('setVote()', () => {
      const playerId = v4();
      const player = {
        name: 'Susan',
      };

      describe('when no player ID is provided', () => {
        it('throws an error', () => {
          const { setVote } = store.getBoard(boardId);

          expect(setVote).to.throw(Error, 'Player ID is required');
        });
      });

      it('sets the players vote value', () => {
        const { setVote, addPlayer, state } = store.getBoard(boardId);

        addPlayer(playerId, player);
        setVote(playerId, 55);

        expect(state.get(playerId)).to.have.property('vote', 55);
      });
    });
  });
});
