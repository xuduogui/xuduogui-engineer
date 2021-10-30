/*
 * @Author: xuziyong
 * @Date: 2021-10-30 21:46:43
 * @LastEditors: xuziyong
 * @LastEditTime: 2021-10-30 22:53:07
 * @Description: runs测试
 */

import runs from '../src/config/runs'

describe('@xuduogui/env-dev-front-end: /src/config/runs', () => {
  describe('数据格式检查', () => {
    test('返回格式：{title: string, task: function}[]', async () => {
      runs.forEach(runEle => {
        expect(runEle).toHaveProperty('title')
        expect(runEle).toHaveProperty('task')
      })
    })
  })
})