import { installDemo, installYarn } from "../tasks";

/*
 * @Author: xuziyong
 * @Date: 2021-10-17 16:05:20
 * @LastEditors: xuziyong
 * @LastEditTime: 2021-10-30 19:20:31
 * @Description: TODO
 */
export default [
  {
    title: 'task: install-demo',
    task: installDemo
  },
  {
    title: 'task: install-yarn',
    task: installYarn
  },
]