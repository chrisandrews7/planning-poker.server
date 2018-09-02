const getRoom = socket => Object.keys(socket.rooms).filter(item => item !== socket.id)[0];

module.exports = ({
  store,
  constants,
  log,
}) => ({
  connect(socket, { name, roomId }) {
    socket.join(roomId, () => {
      const board = store.getBoard(roomId);
      board.addPlayer(socket.id, {
        name,
      });

      socket
        .to(roomId)
        .emit(constants.PLAYER_JOINED, {
          id: socket.id,
          name,
        });

      socket
        .emit(constants.JOINED, {
          board: board.state,
        });

      log.info({
        roomId,
        playerId: socket.id,
        name,
      }, 'Player joined');
    });
  },

  disconnect(socket) {
    const roomId = getRoom(socket);

    const board = store.getBoard(roomId);
    board.removePlayer(socket.id);

    socket
      .to(roomId)
      .emit(constants.PLAYER_LEFT, {
        id: socket.id,
      });

    log.info({
      roomId,
      playerId: socket.id,
    }, 'Player left');
  },

  castVote(socket, { vote }) {
    const roomId = getRoom(socket);

    const board = store.getBoard(roomId);
    board.setVote(socket.id, vote);

    socket
      .to(roomId)
      .emit(constants.PLAYER_VOTED, {
        id: socket.id,
        vote,
      });

    log.info({
      roomId,
      playerId: socket.id,
      vote,
    }, 'Player voted');
  },
});
