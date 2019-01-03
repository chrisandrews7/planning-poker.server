

module.exports = ({
  store,
  constants,
  log,
}) => {
  function getSocketGameId(socket) {
    return Object.keys(socket.rooms).filter(item => item !== socket.id)[0];
  }

  function modifyGame(socket, params, action, func) {
    const gameId = getSocketGameId(socket);
    const logger = log.child({
      gameId,
      playerId: socket.id,
      params,
    });

    try {
      if (!gameId) {
        logger.warn('Player not in a game');
        return;
      }

      const game = store.getGame(gameId);
      func(game);

      socket
        .emit(constants.BOARD_UPDATED, {
          board: game.state,
        });

      socket
        .broadcast
        .to(gameId)
        .emit(constants.BOARD_UPDATED, {
          board: game.state,
        });

      logger.trace(`Player ${action}`);
    } catch (err) {
      logger.error({ err }, `${action} Error`);
    }
  }

  return {
    connect(socket, params) {
      socket.join(params.gameId, () => {
        modifyGame(socket, params, 'Join', (game) => {
          game.addPlayer(socket.id, {
            name: params.name,
          });
          socket
            .emit(constants.JOINED_GAME, {
              gameId: params.gameId,
            });
        });
      });
    },

    disconnect(socket) {
      modifyGame(socket, undefined, 'Leave', (game) => {
        game.removePlayer(socket.id);
      });
    },

    castVote(socket, params) {
      modifyGame(socket, params, 'Vote', (game) => {
        game.setVote(socket.id, params.vote);
      });
    },
  };
};
