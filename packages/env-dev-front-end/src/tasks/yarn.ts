/*
 * @Author: xuziyong
 * @Date: 2021-10-17 09:31:29
 * @LastEditors: xuziyong
 * @LastEditTime: 2021-10-30 19:21:22
 * @Description: TODO
 */
import execa from "execa";

export const installYarn = async () => {
  try {
    /**
     * 检测yarn是否安装，如果未安装，则通过npm下载全局安装
     * 注：
     */
    console.log('=========================== 检测yarn版本 ===========================')
    const subprocessRes = await execa.command('yarn -v');
    console.log(subprocessRes)
    console.log('=========================== yarn版本检测通过！===========================')
  } catch (error) {
    console.error(error);
    throw new Error('=========================== yarn版本检测失败！===========================')
  };
}