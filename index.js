
const events = require('events');
const net = require('net');
const RedisProto = require('./RedisProto');

class Redis extends events.EventEmitter {
  constructor(options = {}) {
    super();

    this.options = Object.assign({}, {
      host: '127.0.0.1',
      port: 6379
    }, options);

    this._isClosed = false;
    this._isConnected = false;

    this._callbacks = [];

    this._proto = new RedisProto();

    this.connection = net.createConnection(this.options.port, this.options.host, () => {
      this._isConnected = true;
      this.emit('connect');
    });

    this.connection.on('error', err => {
      this.emit('error', err);
    });

    this.connection.on('close', () => {
      this._isClosed = true;
      this.emit('close');
      this._rejectAllCallback();
    });

    this.connection.on('end', () => {
      this.emit('end');
    });

    this.connection.on('data', () => {
      this._pushData(data);
    });
  }

  sendCommand(cmd, callback) {
    return new Promise((resolve, reject) => {

      const cb = (err, ret) => {
        callback && callback(err, ret);
        err ? reject(err) : resolve(ret);
      }

      if (this._isClosed) {
        return cb(new Error('connection has been closed'));
      }

      this._callbacks.push(cb);

      this.connection.write(`cmd\r\n`);
    });
  }

  _pushData(data) {
    this._proto.push(data);

    while(this._proto.next()) {
      const result = this._proto.result;
      const cb = this._callbacks.shift();

      if (result.error) {
        cb(new Error(result.error));
      } else {
        cb(null, result.data);
      }
    }
  }

  _rejectAllCallback() {
    this._callbacks.forEach(cb => cb(new Error('connection has been closed')));
    this._callbacks = [];
  }

  end() {
    this.connection.destroy();
  }
}

module.exports = Redis;