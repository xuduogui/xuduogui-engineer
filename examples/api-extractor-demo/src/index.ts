/*
 * @Author: xuziyong
 * @Date: 2021-11-06 00:33:10
 * @LastEditors: xuziyong
 * @LastEditTime: 2021-11-06 01:15:46
 * @Description: TODO
 */

/**
 * TestDemo 的接口描述
 *
 * @remarks
 * 这是testDemo的接口
 *
 * public
 */
export interface TestDemo {
  prototypeOne: number;
  prototypeTwo: string;
  prototypeThree: string;
  prototypeFour: boolean;
}

/**
 * testDemo 实例
 *
 * @remarks
 * 这是TestDemo类
 *
 * @returns testDemo实例
 */
export const testDemo: TestDemo = {
  prototypeFour: false,
  prototypeOne: 1,
  prototypeThree: '234234',
  prototypeTwo: 'sdfsdf'
}

/**
 * testFun方法
 *
 * @returns TestDemo 实例
 */
export const testFun = (): TestDemo => {
  return testDemo
}

/**
 * 我不做事
 */
export { testItem } from './moduleTest/test'