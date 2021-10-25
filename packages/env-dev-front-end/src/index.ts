/*
 * @Author: xuziyong
 * @Date: 2021-10-17 00:27:00
 * @LastEditors: xuziyong
 * @LastEditTime: 2021-10-26 00:59:36
 * @Description: TODO
 */
import Listr from "listr";
import { logx } from './config/logx';
import runs from "./config/runs";

logx.info('============= 开始运行 =============');

const tasks = new Listr(runs, { concurrent: 3 });

tasks
  .run()
  .then((subprocessRes) => {
    console.log(subprocessRes)
  })
  .catch(err => console.error(err))