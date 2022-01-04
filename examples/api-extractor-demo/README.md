<!--
 * @Author: xuziyong
 * @Date: 2021-11-06 22:22:00
 * @LastEditors: xuziyong
 * @LastEditTime: 2021-11-07 15:04:17
 * @Description: TODO
-->

# test-api-extractor

## 概念与描述

### api report (api 报告)

一个.md 文件，类似接口概要文件，监控提交差异

### .d.ts 汇总文件（api 类型汇总文件）

类似其他 js 打包工具的.lib.js，将工程的类型文件汇总

### api doc 描述文档（api-extractor 最终的输出文件）

一个.api.json 文件，描述了文档的输出信息，提供给其他的解析器使用（如 api-documenter）

### api-extractor.json 配置以上三者的行为
