/**
 * TestDemo 的接口描述
 *
 * @remarks
 * 这是testDemo的接口
 *
 * public
 */
export declare interface TestDemo {
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
export declare const testDemo: TestDemo;

/**
 * testFun方法
 *
 * @returns TestDemo 实例
 */
export declare const testFun: () => TestDemo;

declare interface TestItem {
    test1: number;
    test2: string;
}

/**
 * testItem
 * @example
 * Here's an example with negative numbers:
 * ```
 * // Prints "0":
 * console.log(add(1,-1));
 */
export declare const testItem: TestItem;

export { }
