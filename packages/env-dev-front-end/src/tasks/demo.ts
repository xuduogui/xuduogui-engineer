/*
 * @Author: xuziyong
 * @Date: 2021-10-17 09:31:29
 * @LastEditors: xuziyong
 * @LastEditTime: 2021-10-30 19:40:40
 * @Description: TODO
 */
import execa from "execa";

export const installDemo = async () => {
  try {
    console.log('=========================== 开始demo运行测试 ===========================')
    const subprocessRes = await execa.command('yarn install  xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx -d');
    console.log(subprocessRes)
    console.log('=========================== demo运行通过！ ===========================')
    return true
  } catch (error) {
    console.error(error);
    console.error('=========================== demo运行测试失败！ ===========================')
    throw new Error()
  };
}