module.exports = ({
  store,
  constants,
  log,
}) => {
  function getSocketGameId(socket) {
    return Object.keys(socket.rooms).filter(item => item !== socket.id)[0];
  }

  function modifyGame(action, socket, func) {
    const gameId = getSocketGameId(socket);
    const logger = log.child({
      gameId,
      playerId: socket.id,
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
        modifyGame('Join', socket, (game) => {
          if (!params.isObserver) {
            game.addPlayer(socket.id, {
              name: params.name,
            });
          }

          socket
            .emit(constants.JOINED_GAME, {
              gameId: params.gameId,
            });
        });
      });
    },

    disconnect(socket) {
      modifyGame('Leave', socket, (game) => {
        game.removePlayer(socket.id);
      });
    },

    castVote(socket, params) {
      modifyGame('Vote', socket, (game) => {
        game.setVote(socket.id, params.vote);
      });
    },

    resetVotes(socket) {
      modifyGame('Reset Votes', socket, (game) => {
        game.resetVotes();
      });
    },
  };
};
