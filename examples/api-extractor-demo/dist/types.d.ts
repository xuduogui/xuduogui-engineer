export declare type ExtractPropertyNamesWithType<T, U> = {
    [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];
export declare type ExtractPropertyNamesExceptType<T, U> = {
    [K in keyof T]: T[K] extends U ? never : K;
}[keyof T];
export declare type PropertiesOfType<T, U> = Pick<T, ExtractPropertyNamesWithType<T, U>>;
export declare type PropertiesExcept<T, X> = Pick<T, ExtractPropertyNamesExceptType<T, X>>;
export declare type PartialRequire<T, K extends keyof T> = Partial<T> & Pick<T, K>;
export declare type AnyFunction = (...args: any[]) => any;
export interface Attributes {
    [key: string]: string;
}
export interface Headers {
    [key: string]: string;
}
//# sourceMappingURL=types.d.ts.map