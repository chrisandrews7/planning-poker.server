module.exports = ({ log }) => {
  const validateRequiredParam = (name, value) => {
    if (!value) {
      throw new Error(`${name} is required`);
    }
  };

  const state = new Map();

  return {
    getBoard(boardId) {
      validateRequiredParam('Board ID', boardId);

      if (!state.has(boardId)) {
        state.set(boardId, new Map());
        log.info({ boardId }, 'New board added');
      }

      const boardState = state.get(boardId);

      return {
        state: boardState,
        addPlayer(playerId, data) {
          validateRequiredParam('Player ID', playerId);
          validateRequiredParam('Player Name', data.name);
          boardState.set(playerId, {
            vote: undefined,
            ...data,
          });
        },
        setVote(playerId, vote) {
          validateRequiredParam('Player ID', playerId);
          boardState.get(playerId).vote = vote;
        },
        removePlayer(playerId) {
          validateRequiredParam('Player ID', playerId);
          boardState.delete(playerId);
        },
      };
    },
  };
};
