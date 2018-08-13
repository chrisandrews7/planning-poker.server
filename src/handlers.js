module.exports = ({
  store,
  constants,
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
  },

  disconnect(socket) {
    const board = store.getBoard(socket.roomId);
    board.removePlayer(socket.id);

    socket
      .to(socket.roomId)
      .emit(constants.PLAYER_LEFT, {
        id: socket.id,
      });
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
  },
});
