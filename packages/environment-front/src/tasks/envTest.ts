/*
 * @Author: xuziyong
 * @Date: 2021-10-17 09:31:29
 * @LastEditors: xuziyong
 * @LastEditTime: 2021-10-31 00:13:42
 * @Description: TODO
 */
import execa from 'execa'

const showStr = (str: string) =>
  `=========================== ${str} ===========================`

const log = console.log

const taskItem = async (target: string, command: string) => {
  log(showStr(`开始检测 ${target}`))
  log((await execa.command(command)).stdout)
  log(showStr(`${target} ok`))
}

export const envTest = async () => {
  try {
    taskItem('nvm', 'nvm version')
  } catch (error) {
    console.error(error)
    throw new Error('基础环境异常，请检查')
  }
}
