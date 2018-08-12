module.exports = () => {
  const validateRequiredParam = (name, value) => {
    if(!value) {
      throw new Error(`${name} is required`);
    }
  };

  const state = new Map();

  return {
    setBoard(boardId) {
      validateRequiredParam('Board ID', boardId);
      state.set(boardId, new Map());
    },
    getBoard(boardId) { 
      validateRequiredParam('Board ID', boardId);
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
        }
      };
    },
  };
};
