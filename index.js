
const events = require('events');
const net = require('net');
const RedisProto = require('./RedisProto');
const commands = require('redis-commands');

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

    this._bindCommands();

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

  _bindCommands() {
    let self = this;

    commands.list.forEach(cmd => {
      this[cmd.toLowerCase()] = this[cmd.toUpperCase()] = function(...rest) {
        let callback = null;

        if (typeof rest[rest.length -1] === 'function') {
          callback = rest.pop();
        }

        let args = rest.map(arg => Array.isArray(arg) ? arg.join(' ') : arg).join(' ');

        return self.sendCommand(`${cmd} ${args}\r\n`, callback);
      }
    })
  }
}

module.exports = Redis;