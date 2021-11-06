/*
 * @Author: xuziyong
 * @Date: 2021-10-17 09:31:29
 * @LastEditors: xuziyong
 * @LastEditTime: 2021-11-06 22:30:38
 * @Description: TODO
 */
import execa from "execa";

const showStr = (str: string) => `=========================== ${str} ===========================`

const log = console.log

const taskInstallItem = async (target: string, testCommond: string, installCommand: string) => {
  log(showStr(`环境开始初始化： ${target}`))
  try {
    await execa.command(testCommond);
    log(`${target} is ok!(no install)`)
  } catch (error) {
    try {
      await execa.command(installCommand);
      log(`${target} install ok`)
    } catch (error) {
      console.error(`${target} install error`)
      log(showStr(`${target} 环境初始化： 失败！`))
      return false
    }
  }
  log(showStr(`${target} 环境初始化： 成功！`))
}

export const installBase = async () => {
  try {
    log('nvm 配置源')
    await execa.command('nvm node_mirror https://npm.taobao.org/mirrors/node/');
    await execa.command('nvm npm_mirror https://npm.taobao.org/mirrors/npm/');

    log('npm 配置源')
    await execa.command('npm config set registry https://registry.npm.taobao.org --global');
    await execa.command('npm config set disturl https://npm.taobao.org/dist --global');

    await taskInstallItem('vue-cli', 'vue -V', 'npm install -g @vue/cli')

    await taskInstallItem('yarn', 'yarn -v', 'npm install -g yarn')
    log('yarn 配置源')
    await execa.command('yarn config set registry https://registry.npm.taobao.org --global');
    await execa.command('yarn config set disturl https://npm.taobao.org/dist --global');

    await taskInstallItem('nrm', 'nrm -V', 'npm install -g nrm')

    await taskInstallItem('lerna', 'lerna -v', 'npm install --global lerna')

    await taskInstallItem('rollup', 'rollup -v', 'npm install --global rollup')
    
    await taskInstallItem('@microsoft/api-extractor', 'api-extractor -v', 'npm install -g @microsoft/api-extractor')
    
    await taskInstallItem('@microsoft/api-documenter', 'api-documenter -v', 'npm install -g @microsoft/api-documenter')

  } catch (error) {
    console.error(error);
    throw new Error(' 环境安装异常 ')
  };
}