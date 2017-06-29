const Parser = require('redis-parser');
const events = require('events');

class RedisProto extends events.EventEmitter{
  constructor() {
    this.parser = new Parser({
      returnReply: this._returnReply,
      returnError: this._returnError,
      returnFatalError: this._returnFatalError
    });
  }

  push(text) {
    this.parser.execute(text);
  }

  _returnReply(reply) {
    this.emit('response', reply);
  }

  _returnError(err) {
    this.emit('error', err);
  }

  _returnFatalError(err) {
    this.emit('fatal', err);
  }
}

module.exports = RedisProto;