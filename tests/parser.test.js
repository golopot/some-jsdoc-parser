'use strict';

const Parser = require('../lib/parser');

function serializeParseError(error) {
  return {
    type: error.type,
    message: error.message,
    pos: error.pos,
  };
}

/**
 * @param {string} code
 * @returns {void}
 */
function testPass(code) {
  test(code, () => {
    const ast = Parser.parse(code);
    expect(ast).toMatchSnapshot();
  });
}

/**
 * @param {string} code
 * @returns {void}
 */
function testFail(code) {
  test(code, () => {
    let ast;
    let parseError;
    let hasCatched = false;

    try {
      ast = Parser.parse(code);
    } catch (err) {
      hasCatched = true;
      parseError = err;
    }

    if (!hasCatched) {
      throw new Error(
        `Expected the parser to throw an error. Got ${JSON.stringify(
          ast,
          null,
          2
        )}.`
      );
    }

    expect(serializeParseError(parseError)).toMatchSnapshot();
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

testFail(`
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
testFail(`/** @#foo */`);
testFail(`/** @@foo */`);
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
testFail(`/** @param [a */`);
testFail(`
/**
 * @param [a
 * @returns
 */
`);

testPass(`/** @param @abc */`);

testPass(`/** @param a[].name */`);

testFail(`
/**
 * @param {number a
 */
`);

testFail(`
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
