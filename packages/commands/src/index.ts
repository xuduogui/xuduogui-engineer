/*
 * @Author: xuziyong
 * @Date: 2021-11-02 01:06:14
 * @LastEditors: xuziyong
 * @LastEditTime: 2021-11-06 23:25:14
 * @Description: TODO
 */
import execa, { ExecaError } from 'execa'

export const doCommand = async function (cmd: string) {
  try {
    await execa.command(cmd)
  } catch (error: unknown) {
    console.error((error as ExecaError).stderr || error)
  }
}
