/*
 * @Author: xuziyong
 * @Date: 2021-10-17 09:49:47
 * @LastEditors: xuziyong
 * @LastEditTime: 2021-10-17 15:53:27
 * @Description: TODO
 */
import * as log from 'log4js'
import * as path from 'path'

const timeNow = new Date().getTime()

const logConfigDefault = {
  appenders: {
    // 控制台输出
    console: { type: 'console' },
    // 日志文件
    file: { type: 'file', filename: path.join(__dirname, `../logs/time-${timeNow}.log`) }
  },
  categories: {
    // 默认日志
    default: { appenders: ['file', 'console'], level: 'debug' },
  }
}

log.configure(logConfigDefault);

const logx = log.getLogger();

/**
 * console 代理
 * @param logLevel 类型/级别
 * @param logger log4js实例
 * @return {function}
 */
function createLogProxy(logLevel: string, logger: log.Logger = logx) {
  return (messeage: any, ...arg: any[]) => {
    switch (logLevel) {
      case 'debug':
        return logger.debug(messeage, ...arg)
      case 'info':
        return logger.debug(messeage, ...arg)
      case 'warn':
        return logger.debug(messeage, ...arg)
      case 'error':
        return logger.debug(messeage, ...arg)
      default:
        break;
    }
  };
}
console.log = createLogProxy('debug');
console.info = createLogProxy('info');
console.warn = createLogProxy('warn');
console.error = createLogProxy('error');

export {logx}