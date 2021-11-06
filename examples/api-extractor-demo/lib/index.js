"use strict";
/*
 * @Author: xuziyong
 * @Date: 2021-11-06 00:33:10
 * @LastEditors: xuziyong
 * @LastEditTime: 2021-11-06 01:15:46
 * @Description: TODO
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.testItem = exports.testFun = exports.testDemo = void 0;
/**
 * testDemo 实例
 *
 * @remarks
 * 这是TestDemo类
 *
 * @returns testDemo实例
 */
exports.testDemo = {
    prototypeFour: false,
    prototypeOne: 1,
    prototypeThree: '234234',
    prototypeTwo: 'sdfsdf'
};
/**
 * testFun方法
 *
 * @returns TestDemo 实例
 */
var testFun = function () {
    return exports.testDemo;
};
exports.testFun = testFun;
/**
 * 我不做事
 */
var test_1 = require("./moduleTest/test");
Object.defineProperty(exports, "testItem", { enumerable: true, get: function () { return test_1.testItem; } });
//# sourceMappingURL=index.js.map