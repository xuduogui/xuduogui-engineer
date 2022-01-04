/*
 * @Author: xuziyong
 * @Date: 2021-11-07 17:12:19
 * @LastEditors: xuziyong
 * @LastEditTime: 2021-11-07 19:10:27
 * @Description: TODO
 */
// copy by faastjs

export type ExtractPropertyNamesWithType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never
}[keyof T]

export type ExtractPropertyNamesExceptType<T, U> = {
  [K in keyof T]: T[K] extends U ? never : K
}[keyof T]

export type PropertiesOfType<T, U> = Pick<T, ExtractPropertyNamesWithType<T, U>>

export type PropertiesExcept<T, X> = Pick<
  T,
  ExtractPropertyNamesExceptType<T, X>
>

export type PartialRequire<T, K extends keyof T> = Partial<T> & Pick<T, K>

export type AnyFunction = (...args: any[]) => any

export interface Attributes {
  [key: string]: string
}

export interface Headers {
  [key: string]: string
}
