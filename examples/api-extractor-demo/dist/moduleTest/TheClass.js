"use strict";
/*
 * @Author: xuziyong
 * @Date: 2021-11-07 17:01:00
 * @LastEditors: xuziyong
 * @LastEditTime: 2021-11-07 21:07:56
 * @Description: TODO
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 测试抽象类的表现
 * @public
 */
var TheAbstract = /** @class */ (function () {
    function TheAbstract() {
    }
    return TheAbstract;
}());
exports.TheAbstract = TheAbstract;
/**
 * 测试方法，用于link这里
 * @returns 测试字符 `ceshi`
 */
function testMsg() {
    return 'ceshi';
}
exports.testMsg = testMsg;
/**
 * 测试普通类的表现
 * 构造函数使用tag internal标记，即为第三方不要用
 * 注意：在构造函数其他信息会被省略 {@link www.baidu.com | 测试} 测试link
 * 测试link 接口 {@link ClassMsg | 测试2} ClassMsg
 * 测试link 方法 {@link testMsg | 方法测试}
 * @public
 */
var TheClass = /** @class */ (function (_super) {
    __extends(TheClass, _super);
    /**
     * @internal
     */
    function TheClass(arg) {
        var _this = _super.call(this) || this;
        _this.id = Math.random();
        _this.name = arg.name;
        _this.msg = arg.msg;
        return _this;
    }
    Object.defineProperty(TheClass.prototype, "classId", {
        /**
         * id
         * @readonly
         */
        get: function () {
            return this.id;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 测试public方法
     * @returns TheClass实例的名称 + id（`${this.name}: ${this.id}`）; e.g: `测试名称`: 1234
     * @public @experimental
     */
    TheClass.prototype.absMethod = function () {
        return this.name + ": " + this.id;
    };
    return TheClass;
}(TheAbstract));
exports.TheClass = TheClass;
//# sourceMappingURL=TheClass.js.map