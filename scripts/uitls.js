/*
 * @Author: xuziyong
 * @Date: 2021-11-02 01:06:14
 * @LastEditors: xuziyong
 * @LastEditTime: 2021-11-02 01:12:34
 * @Description: TODO
 */
const execa = require('execa')

exports.doCommand = async function(cmd) {
  try {
    await execa.command(cmd);
  } catch (error) {
    console.error(error.stderr || error)
  }
}