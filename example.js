const util = require('util');
const parser = require('./lib/parser');

function log() {
  for (const arg of arguments) {
    // eslint-disable-next-line no-console
    console.log(
      util.inspect(arg, {
        colors: true,
        depth: null,
      })
    );
  }
}

const ast = parser.parse(`/** @param {any} [a] foo */`);
log(ast);
