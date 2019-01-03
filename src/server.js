module.exports = ({
  socketio, constants, handlers, config, log,
}) => {
  let io;

  return {
    start() {
      io = socketio(config.PORT);

      io.on(constants.CONNECTION, (socket) => {
        socket.on(constants.JOIN, handlers.connect.bind(null, socket));
        socket.on(constants.VOTE, handlers.castVote.bind(null, socket));
        socket.on(constants.DISCONNECTING, handlers.disconnect.bind(null, socket));
      });

      log.info(`Server started listening on port ${config.PORT}`);
    },

    stop() {
      io.close(() => log.info('Server terminated'));
    },
  };
};
