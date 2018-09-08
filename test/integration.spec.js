const { expect } = require('chai');
const io = require('socket.io-client');
const { v4 } = require('uuid');

const { server, constants } = require('../src/container');

describe('Integration', () => {
  const SERVER_HOST = 'http://localhost:3333';
  const gameId = v4();

  beforeAll(() => {
    server.start();
  });

  afterAll(() => {
    server.stop();
  });

  describe('when the user joins', () => {
    it('sends the user the current players on the game', (done) => {
      const client = io(SERVER_HOST);

      client.once(constants.GAME_UPDATED, ({ game }) => {
        expect(game).to.deep.equal({
          [client.id]: {
            name: 'Brian',
          },
        });
        done();

        client.close();
      });

      client.emit(constants.JOIN, { gameId, name: 'Brian' });
    });

    it('broadcasts to the other players that a new player has joined', (done) => {
      const client1 = io(SERVER_HOST);
      const client2 = io(SERVER_HOST);

      client1.once(constants.PLAYER_JOINED, ({ id, name }) => {
        expect(id).to.equal(client2.id);
        expect(name).to.equal('Susan');
        done();

        client1.close();
        client2.close();
      });

      client1.emit(constants.JOIN, { gameId, name: 'Steve' });
      client2.emit(constants.JOIN, { gameId, name: 'Susan' });
    });
  });

  describe('when the user votes', () => {
    it('broadcasts to the vote to the other players', (done) => {
      const client1 = io(SERVER_HOST);
      const client2 = io(SERVER_HOST);
      client1.emit(constants.JOIN, { gameId, name: 'David' });
      client2.emit(constants.JOIN, { gameId, name: 'Diane' });

      client1.once(constants.PLAYER_VOTED, ({ id, vote }) => {
        expect(id).to.equal(client2.id);
        expect(vote).to.equal(13);

        client1.close();
        client2.close();
        done();
      });

      client2.emit(constants.VOTE, { vote: 13 });
    });
  });

  describe('when the user leaves', () => {
    it('broadcasts to the other players that a player has left', (done) => {
      const client1 = io(SERVER_HOST);
      const client2 = io(SERVER_HOST);
      client1.emit(constants.JOIN, { gameId, name: 'Simon' });
      client2.emit(constants.JOIN, { gameId, name: 'Sharon' });

      client1.once(constants.PLAYER_JOINED, () => {
        // Cache this as when the user disconnects we cant access it
        const clientId = client2.id;

        client1.once(constants.PLAYER_LEFT, ({ id }) => {
          expect(id).to.equal(clientId);

          client1.close();
          done();
        });

        client2.close();
      });
    });
  });
});
