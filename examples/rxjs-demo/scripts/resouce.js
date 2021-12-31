const {
  Command,
  InvalidArgumentError
} = require('commander');
const program = new Command();
// program.version('0.0.1', '-v, --version');

// program
//   .option('-d, --debug', 'output extra debugging')
//   .option('-s, --small', 'small pizza size')
//   .option('-p, --pizza-type <type>', 'flavour of pizza')
//   .parse(process.argv);

// console.log('pizza details:');

// const options = program.opts();


// if (options.debug) console.log(options);


// if (options.small) console.log('- small pizza size');

// if (options.pizzaType) console.log(`- ${options.pizzaType}`);


// function myParseInt(value, dummyPrevious) {
//   // parseInt 参数为字符串和进制数
//   const parsedValue = parseInt(value, 10);
//   if (isNaN(parsedValue)) {
//     throw new InvalidArgumentError('Not a number.');
//   }
//   return parsedValue;
// }

// function increaseVerbosity(dummyValue, previous) {
//   return previous + 1;
// }

// function collect(value, previous) {
//   return previous.concat([value]);
// }

// function commaSeparatedList(value, dummyPrevious) {
//   return value.split(',');
// }

// program
//   .option('-f, --float <number>', 'float argument', parseFloat)
//   .option('-i, --integer <number>', 'integer argument', myParseInt)
//   .option('-v, --verbose', 'verbosity that can be increased', increaseVerbosity, 0)
//   .option('-c, --collect <value>', 'repeatable value', collect, [])
//   .option('-l, --list <items>', 'comma separated list', commaSeparatedList)

// program
//   .command('add')
//   .argument('<first>', 'integer argument', myParseInt)
//   .argument('[second]', 'integer argument', myParseInt, 1000)
//   .action((first, second) => {
//     console.log(`${first} + ${second} = ${first + second}`);
//   })

// program.parse();

// const options = program.opts();
// if (options.float !== undefined) console.log(`float: ${options.float}`);
// if (options.integer !== undefined) console.log(`integer: ${options.integer}`);
// if (options.verbose > 0) console.log(`verbosity: ${options.verbose}`);
// if (options.collect.length > 0) console.log(options.collect);
// if (options.list !== undefined) console.log(options.list);