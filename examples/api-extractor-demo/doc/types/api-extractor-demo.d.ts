/**
 * 包描述，一个项目只有一个【packageDocumentation tag】
 *
 * @remarks
 *
 * 【remarks tag】 演示效果（文件头）
 * 同样也是demo包的入口文件
 *
 * @privateRemarks
 *
 * 【privateRemarks tag】私有privateRemarks演示,不面向公众受众的附加文档内容
 *
 * @packageDocumentation
 */

declare type AnyFunction = (...args: any[]) => any;

/**
 * 测试类的消息类型
 * @remarks
 * 这是测试实例属性
 */
declare interface ClassMsg {
    /** 消息 */
    msg?: string;
    /** 类型 */
    type: number;
}

declare type ExtractPropertyNamesExceptType<T, U> = {
    [K in keyof T]: T[K] extends U ? never : K;
}[keyof T];

declare type PropertiesExcept<T, X> = Pick<T, ExtractPropertyNamesExceptType<T, X>>;

/**
 * 测试抽象类的表现
 * @public
 */
export declare abstract class TheAbstract {
    /** name @virtual */
    abstract name: string;
    /** 抽象方法 @virtual */
    abstract absMethod(): string;
}

/**
 * 测试普通类的表现
 * 构造函数使用tag internal标记，即为第三方不要用
 * 注意：在构造函数其他信息会被省略 {@link www.baidu.com | 测试} 测试link
 * 测试link 接口 {@link ClassMsg | 测试2} ClassMsg
 * 测试link 方法 {@link testMsg | 方法测试}
 * @public
 */
export declare class TheClass extends TheAbstract {
    /** TheClass 实例的name；e.g: `preName` */
    readonly name: string;
    /** TheClass 实例的id； e.g: 123 */
    private id;
    /**
     * 消息
     * {@link ClassMsg} 消息类型
     *
     * @defaultValue
     * default value is {msg: '', type: 1}
     *
     * @public
     */
    msg: ClassMsg;
    /**
     * @internal
     */
    constructor(arg: PropertiesExcept<TheClass, AnyFunction>);
    /**
     * id
     * @readonly
     */
    get classId(): number;
    /**
     * 测试public方法
     * @returns TheClass实例的名称 + id（`${this.name}: ${this.id}`）; e.g: `测试名称`: 1234
     * @public @experimental
     */
    absMethod(): string;
}

export { }
