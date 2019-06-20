'use strict';

const Parser = require('../lib/parser');

function serializeParseError(error) {
  return {
    type: error.type,
    message: error.message,
    index: error.index,
    expected: error.expected,
  };
}

/**
 * @param {string} code
 * @returns {void}
 */
function testPass(code) {
  test(code, () => {
    let ast;
    try {
      ast = Parser.parse(code);
    } catch (err) {
      ast = serializeParseError(err);
    }
    expect(ast).toMatchSnapshot();
  });
}

testPass(`/** */`);
testPass(`/***/`);
testPass(`/** foo */`);

testPass(`
/**
 *
 */
`);

testPass(`
/**
 * foo
 */
`);

testPass(`
/**
* foo
*/
`);

testPass(`
/**
 * foo
 * goo
 */
`);

testPass(`
/**
  foo
  goo
 */
`);

testPass(`
/** foo
    goo */
`);

testPass(`
/**
 * @returns
 */
`);

testPass(`
/**
 * @returns foo
 */
`);

testPass(`
/**
 * @returns  foo
 */
`);

testPass(`
/**
 * @returns\tfoo
 */
`);

testPass(`
/**
 * @returns
 * foo
 */
`);

testPass(`
/**
 * @returns
 *   foo
 */
`);

testPass(`
/**
 * @returns {any}
 */
`);

testPass(`
/**
 * @returns
 *   {any}
 */
`);

testPass(`
/**
 * @param
 */
`);

testPass(`
/**
 * @param a
 */
`);

testPass(`
/**
 * @param a foo
 */
`);

testPass(`
/**
 * @param {any} a foo
 */
`);

testPass(`
/**
 * @param
 *   foo
 */
`);

testPass(`
/**
 foo
 @param a foo 
 */
`);

testPass(`
/** @param {string} a
 *  foo */
`);

testPass(`
/**
 * @
 * @returns
 */
`);

testPass(`/** @param a @param b */`);

testPass(`
/**
  * @param a
  * @returns foo
  */
`);

testPass(`/** @foo */`);
testPass(`/** @fooFoo */`);
testPass(`/** @foo-foo */`);
testPass(`/** @foo_foo */`);
testPass(`/** @foo.foo */`);
testPass(`/** @foo#foo */`);
testPass(`/** @foo@foo */`);
testPass(`/** @#foo */`);
testPass(`/** @@foo */`);
testPass(`/** @-foo */`);

testPass(`/** @param .a */`);
testPass(`/** @param a. */`);
testPass(`/** @param +a */`);
testPass(`/** @param a+ */`);
testPass(`/** @param a{ */`);

testPass(`/** @param a.b */`);
testPass(`/** @param a.b.c */`);
testPass(`/** @param a. b */`);
testPass(`/** @param a .b */`);
testPass(`/** @param a..b */`);
testPass(`/** @param a. */`);

testPass(`/** @param [a] */`);
testPass(`/** @param [a=b] */`);
testPass(`/** @param [a = b] */`);
testPass(`/** @param [a="foo"] */`);
testPass(`/** @param [a="foo] */`);
testPass(`/** @param [a=foo bar] */`);
testPass(`/** @param [a=@returns] */`);
testPass(`/** @param [a="@returns"] */`);
testPass(`/** @param [a b] */`);
testPass(`/** @param [a . b] */`);
testPass(`/** @param [a */`);
testPass(`
/**
 * @param [a
 * @returns
 */
`);

testPass(`/** @param @abc */`);

testPass(`/** @param a[].name */`);

testPass(`
/**
 * @param {number a
 */
`);

testPass(`
/**
 * @param {{x: number} a
 */
`);

testPass(`
/**
 * @param {{x: any}} a
 */
`);

testPass(`
/**
 * @param {
 *   number
 * }
 */
`);

testPass(`
/**
 * @param {{
 *    x: any
 * }} a
 */
`);

testPass(`
/**
 * @param {"}" | "{"} a
 */
`);

testPass(`
/**
 * @param
 * @returns
 */
`);

testPass(`/** Quoted tags like \`@types\`, "@types", and '@types' */`);
testPass(`/** cc \`@ljharb\` */`);
testPass(`/** cc '@ljharb' */`);
testPass(`/** cc "@ljharb" */`);

testPass(`/** @author me <me@example.com> */`);

testPass(`
/**
 * @my-tag {any} a foo
 */
`);
