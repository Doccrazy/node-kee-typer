const EventEmitter = require('events');

const child_process = jest.genMockFromModule('child_process');

child_process.spawn = (cmd, args) => {
  child_process.__lastSpawn = {cmd, args};
  const emitter = new EventEmitter();
  setTimeout(() => emitter.emit('close'));
  return emitter;
};

module.exports = child_process;
