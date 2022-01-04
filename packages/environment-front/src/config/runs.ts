import { installBase, envTest } from '../tasks'

/*
 * @Author: xuziyong
 * @Date: 2021-10-17 16:05:20
 * @LastEditors: xuziyong
 * @LastEditTime: 2021-10-30 23:31:34
 * @Description: TODO
 */
export default [
  {
    title: 'task: env test',
    task: envTest
  },
  {
    title: 'task: install-Base',
    task: installBase
  }
]
