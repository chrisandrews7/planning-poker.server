const getGame = socket => Object.keys(socket.rooms).filter(item => item !== socket.id)[0];

module.exports = ({
  store,
  constants,
  log,
}) => ({
  connect(socket, io, { name, gameId }) {
    socket.join(gameId, () => {
      try {
        const game = store.getGame(gameId);
        game.addPlayer(socket.id, {
          name,
        });

        socket
          .emit(constants.JOINED_GAME, {
            gameId,
          });

        io
          .to(gameId)
          .emit(constants.BOARD_UPDATED, {
            board: game.state,
          });

        log.info({
          gameId,
          playerId: socket.id,
          name,
        }, 'Player joined');
      } catch (err) {
        log.error({
          err,
          gameId,
          playerId: socket.id,
          name,
        }, 'Join error');
      }
    });
  },

  disconnect(socket, io) {
    try {
      const gameId = getGame(socket);

      if (gameId) {
        const game = store.getGame(gameId);
        game.removePlayer(socket.id);

        io
          .to(gameId)
          .emit(constants.BOARD_UPDATED, {
            board: game.state,
          });

        log.info({
          gameId,
          playerId: socket.id,
        }, 'Player left');
      }
    } catch (err) {
      log.error({
        err,
        playerId: socket.id,
      }, 'Leave error');
    }
  },

  castVote(socket, io, { vote }) {
    try {
      const gameId = getGame(socket);

      const game = store.getGame(gameId);
      game.setVote(socket.id, vote);

      io
        .to(gameId)
        .emit(constants.BOARD_UPDATED, {
          board: game.state,
        });

      log.info({
        gameId,
        playerId: socket.id,
        vote,
      }, 'Player voted');
    } catch (err) {
      log.error({
        err,
        vote,
        playerId: socket.id,
      }, 'Vote error');
    }
  },
});
