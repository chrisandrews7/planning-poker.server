module.exports = ({ log }) => {
  const validateRequiredParam = (name, value) => {
    if (!value) {
      throw new Error(`${name} is required`);
    }
  };

  const state = {};

  return {
    getBoard(boardId) {
      validateRequiredParam('Board ID', boardId);

      if (!state[boardId]) {
        state[boardId] = {};
        log.info({ boardId }, 'New board added');
      }

      const boardState = state[boardId];

      return {
        state: boardState,
        addPlayer(playerId, data) {
          validateRequiredParam('Player ID', playerId);
          validateRequiredParam('Player Name', data.name);
          boardState[playerId] = {
            vote: undefined,
            ...data,
          };
        },
        setVote(playerId, vote) {
          validateRequiredParam('Player ID', playerId);
          boardState[playerId].vote = vote;
        },
        removePlayer(playerId) {
          validateRequiredParam('Player ID', playerId);
          boardState[playerId] = null;
        },
      };
    },
  };
};
