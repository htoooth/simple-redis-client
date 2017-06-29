const RedisProto = require('./RedisProto');

const proto = new RedisProto();

// 接受到数据
proto.push('*3\r\n$3\r\nabc\r\n$3\r\naa1\r\n$1\r\na\r\n');
proto.push('$6\r\n123456\r\n');
proto.push('-ERR unknown command \'help\'\r\n');
proto.push('+OK\r\n');
proto.push(':5\r\n');
proto.push('*3\r\n$5\r\nhe');
proto.push('llo\r\n$-');
proto.push('1\r\n$5\r\nworld\r\n');

while (proto.next()) {
  // proto.next() 如果有解析出完整的结果则返回结果，没有则返回 false
  // 另外可以通过 proto.result 获得
  console.log(proto.result);
}