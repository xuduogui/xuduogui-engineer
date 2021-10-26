/*
 * @Author: xuziyong
 * @Date: 2021-10-25 23:50:41
 * @LastEditors: xuziyong
 * @LastEditTime: 2021-10-27 00:23:12
 * @Description: TODO
 */
'use strict'
const packageJson = require('./package.json')

if (process.env.NODE_ENV === `production`) {
  module.exports = require(`./dist/${packageJson.name}.cjs.prod.js`)
} else {
  module.exports = require(`./dist/${packageJson.name}.cjs.js`)
}
