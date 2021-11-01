/*
 * @Author: xuziyong
 * @Date: 2021-11-02 00:00:01
 * @LastEditors: xuziyong
 * @LastEditTime: 2021-11-02 01:13:19
 * @Description: TODO
 */
const { doCommand } = require('./uitls')

run()

async function run() {
  await runAllTest()
  await runAllBuild()
}

async function runAllBuild() {
  await doCommand('lerna run build')
}

async function runAllTest() {
  await doCommand('lerna run test')
}