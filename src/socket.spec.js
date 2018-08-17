const { expect } = require('chai');
const { stub, spy } = require('sinon');

const constants = require('./constants');
const socketFactory = require('./socket');

describe('socket', () => {
  const dependencies = {
    constants,
    io: {
      on: stub(),
    },
    log: {
      info: () => {},
    },
    handlers: {
      connect: spy(),
      castVote: spy(),
    },
  };

  it('connects the user', () => {
    socketFactory(dependencies);
    expect(dependencies.io.on).to.have.been.calledWith(constants.CONNECTION);
  });

  xdescribe('on a user voting', () => {
    it('uses the castVote handler', () => {
      const vote = 5;
      const socketStub = {
        id: 'test',
      };

      dependencies.io.on
        .withArgs(constants.VOTE)
        .yields({ vote });

      dependencies.io.on
        .withArgs(constants.CONNECTION)
        .yields(socketStub);

      socketFactory(dependencies);

      expect(dependencies.handlers.castVote).to.have.been.calledWith(socketStub, { vote });
    });
  });
});
