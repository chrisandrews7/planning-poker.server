const getGame = socket => Object.keys(socket.rooms).filter(item => item !== socket.id)[0];

module.exports = ({
  store,
  constants,
  log,
}) => ({
  connect(socket, { name, gameId }) {
    socket.join(gameId, () => {
      const game = store.getGame(gameId);
      game.addPlayer(socket.id, {
        name,
      });

      socket
        .to(gameId)
        .emit(constants.PLAYER_JOINED, {
          id: socket.id,
          name,
        });

      socket
        .emit(constants.JOINED, {
          game: game.state,
        });

      log.info({
        gameId,
        playerId: socket.id,
        name,
      }, 'Player joined');
    });
  },

  disconnect(socket) {
    const gameId = getGame(socket);

    if (gameId) {
      const game = store.getGame(gameId);
      game.removePlayer(socket.id);

      socket
        .to(gameId)
        .emit(constants.PLAYER_LEFT, {
          id: socket.id,
        });

      log.info({
        gameId,
        playerId: socket.id,
      }, 'Player left');
    }
  },

  castVote(socket, { vote }) {
    const gameId = getGame(socket);

    const game = store.getGame(gameId);
    game.setVote(socket.id, vote);

    socket
      .to(gameId)
      .emit(constants.PLAYER_VOTED, {
        id: socket.id,
        vote,
      });

    log.info({
      gameId,
      playerId: socket.id,
      vote,
    }, 'Player voted');
  },
});
