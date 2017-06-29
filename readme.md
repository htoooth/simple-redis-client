# simple redis client

简单使用 node 的网络功能来实现 redis 协议。

## 第一版
有限的命令的几个命令。

手动实现命令的解析。

已完成。

## 第二版
使用 [redis-commands](https://www.npmjs.com/package/redis-commands) 增加所有的命令。

已完成。

## 第三版
使用 [redis-parser](https://www.npmjs.com/package/redis-parser) 解析所有的返回值。

## 第四版
使用 [double-ended-queue](https://www.npmjs.com/package/double-ended-queue) 取代数组，加快速度。

## 第五版
更好的错误处理，自动重连机制

## 感谢
* [how-to-write-a-nodejs-redis-client](http://morning.work/page/2016-05/how-to-write-a-nodejs-redis-client.html)
* [Redis Cluster实践](http://shift-alt-ctrl.iteye.com/blog/2284890)
* [redis集群模式](https://www.zhihu.com/question/21419897)