/*
 * @Author: xuziyong
 * @Date: 2021-10-30 19:51:26
 * @LastEditors: xuziyong
 * @LastEditTime: 2021-10-30 22:34:50
 * @Description: 测试src/config/logx.ts
 */
import fs from 'fs-extra'
import { logx, logFile } from '../src/config/logx'

describe('@xuduogui/env-dev-front-end: /src/config/logx', () => {
  describe('console被log4js代理', () => {

    const logStr = '我是测试console.log'
    console.log(logStr)

    test('在console.log执行之后，检查日志文件存在logStr', async () => {
      const fileText = await fs.readFile(logFile)
      expect(fileText.toString()).toEqual(expect.stringContaining(logStr))
    })

  })

  describe('logx是log4js的实例', () => {

    const logStr = '我是测试logx.info方法'
    logx.info(logStr)

    test('在logx.info执行之后，检查日志文件存在logStr', async () => {
      const fileText = await fs.readFile(logFile)
      expect(fileText.toString()).toEqual(expect.stringContaining(logStr))
    })
  })

})

