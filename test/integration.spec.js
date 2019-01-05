const { expect } = require('chai');
const io = require('socket.io-client');
const { v4 } = require('uuid');

const { server, constants } = require('../src/container');

describe('Integration', () => {
  const SERVER_HOST = 'http://localhost:3333';
  let gameId;

  beforeAll(() => {
    server.start();
  });

  beforeEach(() => {
    gameId = v4();
  });

  afterAll(() => {
    server.stop();
  });

  describe('when the user joins', () => {
    it('updates the user that the join was successful', (done) => {
      const client = io(SERVER_HOST);

      client.once(constants.JOINED_GAME, ({ gameId: game }) => {
        expect(gameId).to.equal(game);

        client.close();
        done();
      });

      client.emit(constants.JOIN, { gameId, name: 'Brian' });
    });

    it('broadcasts to the other players that a new player has joined', (done) => {
      const client1 = io(SERVER_HOST);
      const client2 = io(SERVER_HOST);

      client2.once(constants.BOARD_UPDATED, ({ board }) => {
        expect(board).to.deep.equal({
          [client1.id]: {
            id: client1.id,
            name: 'Steve',
          },
          [client2.id]: {
            id: client2.id,
            name: 'Susan',
          },
        });

        client1.close();
        client2.close();
        done();
      });

      client1.emit(constants.JOIN, { gameId, name: 'Steve' });
      client2.emit(constants.JOIN, { gameId, name: 'Susan' });
    });
  });

  describe('when the user votes', () => {
    const client1 = io(SERVER_HOST);
    const client2 = io(SERVER_HOST);

    beforeAll((done) => {
      client1.emit(constants.JOIN, { gameId, name: 'David' });
      client2.emit(constants.JOIN, { gameId, name: 'Diane' });
      client2.once(constants.JOINED_GAME, () => done());
    });

    afterAll(() => {
      client1.close();
      client2.close();
    });

    it('broadcasts to the vote to the other players', (done) => {
      client2.once(constants.BOARD_UPDATED, ({ board }) => {
        expect(board).to.deep.equal({
          [client1.id]: {
            id: client1.id,
            name: 'David',
            vote: 13,
          },
          [client2.id]: {
            id: client2.id,
            name: 'Diane',
          },
        });
        done();
      });

      client1.emit(constants.VOTE, { vote: 13 });
    });
  });

  describe('when the user leaves', () => {
    const client1 = io(SERVER_HOST);
    const client2 = io(SERVER_HOST);

    beforeAll((done) => {
      client1.emit(constants.JOIN, { gameId, name: 'Simon' });
      client2.emit(constants.JOIN, { gameId, name: 'Sharon' });

      client2.once(constants.JOINED_GAME, () => done());
    });

    it('broadcasts to the other players that a player has left', (done) => {
      client2.once(constants.BOARD_UPDATED, ({ board }) => {
        expect(board).to.deep.equal({
          [client2.id]: {
            id: client2.id,
            name: 'Sharon',
          },
        });

        client2.close();
        done();
      });

      client1.close();
    });
  });
});
