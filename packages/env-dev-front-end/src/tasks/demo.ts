/*
 * @Author: xuziyong
 * @Date: 2021-10-17 09:31:29
 * @LastEditors: xuziyong
 * @LastEditTime: 2021-10-26 00:17:21
 * @Description: TODO
 */
import execa from "execa";

export const installDemo = async () => {
  try {
    const subprocessRes = await execa.command('yarn install  xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx -d');
    console.log(subprocessRes)
  } catch (error) {
    console.error(error);
  };
}