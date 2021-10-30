/*
 * @Author: xuziyong
 * @Date: 2021-10-17 00:27:00
 * @LastEditors: xuziyong
 * @LastEditTime: 2021-10-30 19:19:37
 * @Description: TODO
 */
import { Listr } from "listr2";
import { logx } from './config/logx';
import runs from "./config/runs";

logx.info('============= 开始运行 =============');

const tasks = new Listr(runs, { concurrent: 1, exitOnError: false });

tasks
  .run()
  .then((subprocessRes) => {
    console.log(subprocessRes)
    logx.info('============= 运行结束（正常） =============');
  })
  .catch(err => {
    console.error(err)
    logx.info('============= 运行结束（异常） =============');
  })