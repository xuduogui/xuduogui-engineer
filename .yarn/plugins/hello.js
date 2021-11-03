/*
 * @Author: xuziyong
 * @Date: 2021-11-03 22:38:24
 * @LastEditors: xuziyong
 * @LastEditTime: 2021-11-03 22:54:05
 * @Description: TODO
 */
module.exports = {
  name: `plugin-yarn`,
  factory: require => {
    // What is this `require` function, you ask? It's a `require`
    // implementation provided by Yarn core that allows you to
    // access various packages (such as @yarnpkg/core) without
    // having to list them in your own dependencies - hence
    // lowering your plugin bundle size, and making sure that
    // you'll use the exact same core modules as the rest of the
    // application.
    //
    // Of course, the regular `require` implementation remains
    // available, so feel free to use the `require` you need for
    // your use case!
    const {Command} = require(`clipanion`);

    class HelloWorldCommand extends Command {
      static paths = [[`hello`]];

      async execute() {
        this.context.stdout.write(`This is my very own plugin 😎\n`);
      }
    }

    return {
      commands: [
        HelloWorldCommand,
      ],
    };
  }
};