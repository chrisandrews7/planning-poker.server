const { expect } = require('chai');

// const handlersFactory = require('./handlers');

describe('handlers', () => {
  // const dependencies = {
  //   store: {
  //     getBoard: {
  //       addPlayer: spy(),
  //     },
  //   },
  // };
  // const { connect, disconnect, vote } = handlersFactory(dependencies);

  describe('connect', () => {
    it('adds the user to the game board', () => {
      expect(true).to.be.true;
    });

    it('emits to the room the user has joined', () => {

    });

    it('emits to the user the current game board state', () => {

    });
  });

  describe('disconnect', () => {
    it('removes the user from the game board', () => {

    });

    it('emits to the room the user has left', () => {

    });
  });

  describe('vote', () => {
    it('updates the users vote in the game board', () => {

    });

    it('emits to the room the users vote', () => {

    });
  });
});
