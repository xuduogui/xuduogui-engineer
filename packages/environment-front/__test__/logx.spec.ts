import fs from 'fs-extra'
import { logx, logFile } from '../src/config/logx'

function sleepTime(time) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(1)
    }, time)
  })
}

describe('@xdg/env-dev-front-end: /src/config/logx', () => {
  describe('console被log4js代理', () => {
    const logStr = '我是测试console.log'
    console.log(logStr)

    test('在console.log执行之后，检查日志文件存在logStr', async () => {
      await sleepTime(2000)
      const fileText = await fs.readFile(logFile)
      expect(fileText.toString()).toEqual(expect.stringContaining(logStr))
    })
  })

  describe('logx是log4js的实例', () => {
    const logStr = '我是测试logx.info方法'
    logx.info(logStr)

    test('在logx.info执行之后，检查日志文件存在logStr', async () => {
      await sleepTime(2000)
      const fileText = await fs.readFile(logFile)
      expect(fileText.toString()).toEqual(expect.stringContaining(logStr))
    })
  })
})
