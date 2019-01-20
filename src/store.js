module.exports = ({ log }) => {
  const validateRequiredParam = (name, value) => {
    if (!value) {
      throw new Error(`${name} is required`);
    }
  };

  const state = {};

  return {
    getGame(gameId) {
      validateRequiredParam('Game ID', gameId);

      if (!state[gameId]) {
        state[gameId] = {};
        log.info({ gameId }, 'New game added');
      }

      const gameState = state[gameId];

      return {
        state: gameState,
        addPlayer(playerId, data) {
          validateRequiredParam('Player ID', playerId);
          validateRequiredParam('Player Name', data.name);
          gameState[playerId] = {
            id: playerId,
            vote: undefined,
            ...data,
          };
        },
        setVote(playerId, vote) {
          validateRequiredParam('Player ID', playerId);
          gameState[playerId].vote = vote;
        },
        resetVotes() {
          Object.keys(gameState).forEach((playerId) => {
            gameState[playerId].vote = undefined;
          });
        },
        removePlayer(playerId) {
          validateRequiredParam('Player ID', playerId);
          delete gameState[playerId];
        },
      };
    },
  };
};
