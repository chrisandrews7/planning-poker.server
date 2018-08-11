module.exports = ({ socket, config, log }) => ({
  start() {
    socket.listen(config.PORT);
    log.info(`Server started listening on port ${config.PORT}`);
  },

  stop() {
    socket.close(() => {
      log.info('Server terminated');
    });
  },
});
