
import runs from '../src/config/runs'

describe('@xdg/env-dev-front-end: /src/config/runs', () => {
  describe('数据格式检查', () => {
    test('返回格式：{title: string, task: function}[]', async () => {
      runs.forEach(runEle => {
        expect(runEle).toHaveProperty('title')
        expect(runEle).toHaveProperty('task')
      })
    })
  })
})