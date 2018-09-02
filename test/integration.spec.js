const { expect } = require('chai');
const io = require('socket.io-client');
const { v4 } = require('uuid');

const { server, constants } = require('../src/container');

const SERVER_HOST = 'http://localhost:3000';

const promisifyEmitter = (emitter, event, func) => new Promise((resolve, reject) => {
  emitter.once(event, resolve);
  emitter.once('error', reject);

  if (func) {
    emitter[func]();
  }
});

describe('Integration', () => {
  const roomId = v4();
  let client1;
  let client2;

  beforeAll(async () => {
    server.start();

    client1 = io(SERVER_HOST, { autoConnect: false });
    client2 = io(SERVER_HOST, { autoConnect: false });
    await Promise.all([
      promisifyEmitter(client1, 'connect', 'open'),
      promisifyEmitter(client2, 'connect', 'open'),
    ]);
  });

  afterAll(async () => {
    await Promise.all([
      promisifyEmitter(client1, 'disconnect', 'close'),
      promisifyEmitter(client2, 'disconnect', 'close'),
    ]);
    server.stop();
  });

  describe('when the user joins', () => {
    it('sends the user the current players on the board', (done) => {
      client1.once(constants.JOINED, ({ board }) => {
        expect(board).to.deep.equal({
          [client1.id]: {
            name: 'Steve',
          },
        });
        done();
      });

      client1.emit(constants.JOIN, { roomId, name: 'Steve' });
    });

    it('broadcasts to the existing players that a new player has joined', (done) => {
      client1.emit(constants.JOIN, { roomId, name: 'Steve' });

      client1.once(constants.PLAYER_JOINED, ({ id, name }) => {
        expect(id).to.equal(client2.id);
        expect(name).to.equal('Susan');
        done();
      });

      client2.emit(constants.JOIN, { roomId, name: 'Susan' });
    });
  });
});
