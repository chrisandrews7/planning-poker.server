module.exports = ({ io, config, log }) => ({
  start() {
    io.listen(config.PORT);
    log.info(`Server started listening on port ${config.PORT}`);
  },

  stop() {
    io.close(() => log.info('Server terminated'));
  },
});
