module.exports = ({
  store,
  constants,
  log,
}) => ({
  connect(socket, { name, roomId }) {
    const board = store.getBoard(socket.roomId);
    board.addPlayer(socket.id, {
      name,
    });

    socket.join(roomId);

    socket
      .to(socket.roomId)
      .emit(constants.PLAYER_JOINED, {
        id: socket.id,
        name,
      });

    socket
      .to(socket.id)
      .emit(constants.CONNECTED, {
        board: board.state,
      });

    log.info({
      roomId: socket.roomId,
      playerId: socket.id,
      name,
    }, 'Player joined');
  },

  disconnect(socket) {
    const board = store.getBoard(socket.roomId);
    board.removePlayer(socket.id);

    socket
      .to(socket.roomId)
      .emit(constants.PLAYER_LEFT, {
        id: socket.id,
      });

    log.info({
      roomId: socket.roomId,
      playerId: socket.id,
    }, 'Player left');
  },

  castVote(socket, { vote }) {
    const board = store.getBoard(socket.roomId);
    board.setVote(vote);

    socket
      .to(socket.roomId)
      .emit(constants.PLAYER_VOTED, {
        id: socket.id,
        vote,
      });

    log.info({
      roomId: socket.roomId,
      playerId: socket.id,
      vote,
    }, 'Player voted');
  },
});
