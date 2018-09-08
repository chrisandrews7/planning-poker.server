const { expect } = require('chai');
const { v4 } = require('uuid');

const storeFactory = require('./store');

describe('store', () => {
  const { getGame } = storeFactory({
    log: {
      info: () => {},
    },
  });

  let gameId;

  beforeEach(() => {
    gameId = v4();
  });

  describe('getGame()', () => {
    describe('when no game ID is provided', () => {
      it('throws an error', () => {
        expect(getGame).to.throw(Error, 'Game ID is required');
      });
    });

    describe('when a game cannot be found', () => {
      it('generates a new game', () => {
        expect(getGame(gameId).state).to.deep.equal({});
      });
    });

    describe('state', () => {
      it('returns the current state of a game', () => {
        const { state } = getGame(gameId);

        expect(state).to.deep.equal({});
      });

      describe('when a game already exists', () => {
        it('returns the state of the existing game', () => {
          const playerId = v4();

          const game1 = getGame(gameId);
          game1.addPlayer(playerId, { name: 'Simon' });

          const game2 = getGame(gameId);
          expect(game2.state).to.have.key(playerId);
        });
      });
    });

    describe('addPlayer()', () => {
      const playerId = v4();
      const player = {
        name: 'Steve',
        vote: 8,
      };

      describe('when no player ID is provided', () => {
        it('throws an error', () => {
          const { addPlayer } = getGame(gameId);

          expect(addPlayer).to.throw(Error, 'Player ID is required');
        });
      });

      describe('when no player name is provided', () => {
        it('throws an error', () => {
          const { addPlayer } = getGame(gameId);

          expect(() => addPlayer(playerId, {})).to.throw(Error, 'Player Name is required');
        });
      });

      describe('when no default vote is provided', () => {
        it('sets a default undefined value', () => {
          const { addPlayer, state } = getGame(gameId);
          addPlayer(playerId, { name: 'Simon' }); // No vote value

          expect(state[playerId]).to.have.property('vote', undefined);
        });
      });

      it('adds the new player to the game', () => {
        const { addPlayer, state } = getGame(gameId);
        addPlayer(playerId, player);

        expect(state[playerId]).to.deep.equal(player);
      });
    });

    describe('removePlayer()', () => {
      const playerId = v4();

      describe('when no player ID is provided', () => {
        it('throws an error', () => {
          const { removePlayer } = getGame(gameId);

          expect(removePlayer).to.throw(Error, 'Player ID is required');
        });
      });

      it('removes the player from the game', () => {
        const { removePlayer, state, addPlayer } = getGame(gameId);

        addPlayer(playerId, {
          name: 'Steve',
          vote: 5,
        });
        removePlayer(playerId);

        expect(state[playerId]).to.not.exist;
      });
    });

    describe('setVote()', () => {
      const playerId = v4();
      const player = {
        name: 'Susan',
      };

      describe('when no player ID is provided', () => {
        it('throws an error', () => {
          const { setVote } = getGame(gameId);

          expect(setVote).to.throw(Error, 'Player ID is required');
        });
      });

      it('sets the players vote value', () => {
        const { setVote, addPlayer, state } = getGame(gameId);

        addPlayer(playerId, player);
        setVote(playerId, 55);

        expect(state[playerId]).to.have.property('vote', 55);
      });
    });
  });
});
