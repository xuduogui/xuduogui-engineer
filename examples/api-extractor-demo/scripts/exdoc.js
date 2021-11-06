/*
 * @Author: xuziyong
 * @Date: 2021-11-06 22:56:26
 * @LastEditors: xuziyong
 * @LastEditTime: 2021-11-07 01:32:17
 * @Description: TODO
 */
const { doCommand } = require('@xuduogui/commands')

run()

async function run() {
  await doCommand('yarn run extractor')
  await doCommand('yarn run doc')
}
