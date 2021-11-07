/*
 * @Author: xuziyong
 * @Date: 2021-11-07 12:04:02
 * @LastEditors: xuziyong
 * @LastEditTime: 2021-11-07 12:04:20
 * @Description: TODO
 */
module.exports =  {
  plugins: [
    "@typescript-eslint/eslint-plugin",
    "eslint-plugin-tsdoc"
  ],
  extends:  [
    'plugin:@typescript-eslint/recommended'
  ],
  parser:  '@typescript-eslint/parser',
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
    ecmaVersion: 2018,
    sourceType: "module"
  },
  rules: {
    "tsdoc/syntax": "warn"
  }
};