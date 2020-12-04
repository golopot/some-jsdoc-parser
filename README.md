# some-jsdoc-parser 

[![npm](https://img.shields.io/npm/v/some-jsdoc-parser.svg?style=flat)](https://www.npmjs.org/package/some-jsdoc-parser) ![build status](https://github.com/golopot/jsdoc-parser/workflows/build/badge.svg) [![codecov.io](https://codecov.io/github/golopot/jsdoc-parser/coverage.svg?branch=master)](https://codecov.io/github/golopot/jsdoc-parser?branch=master)

A hand-written jsdoc parser.

- AST format similar to estree.
- Nodes locations included.
- Typed with typescript.

## Install

```
npm install --save some-jsdoc-parser
```

## Usage

```js
const SomeJsdocParser = require('some-jsdoc-parser');

const ast = SomeJsdocParser.parse(`
/**
 * @param {string} foo - some parameter.
 * @returns {string} 
 */
`);

console.log(ast)

// {
//   type: 'JSDocComment',
//   description: null,
//   blocks: [
//     {
//       type: 'JSDocBlock',
//       tag: { type: 'JSDocTag', name: 'param', range: [ 8, 14 ] },
//       typeAnnotation: {
//         type: 'JSDocTypeAnnotation',
//         value: 'string',
//         range: [ 15, 23 ]
//       },
//       name: {
//         type: 'JSDocName',
//         name: 'foo',
//         optional: false,
//         range: [ 24, 27 ]
//       },
//       description: {
//         type: 'JSDocDescription',
//         value: '- some parameter.',
//         range: [ 28, 45 ]
//       },
//       range: [ 8, 45 ]
//     },
//     {
//       type: 'JSDocBlock',
//       tag: { type: 'JSDocTag', name: 'returns', range: [ 49, 57 ] },
//       typeAnnotation: {
//         type: 'JSDocTypeAnnotation',
//         value: 'string',
//         range: [ 58, 66 ]
//       },
//       name: null,
//       description: null,
//       range: [ 49, 66 ]
//     }
//   ],
//   range: [ 0, 71 ]
// }
```

## License

[MIT License](https://opensource.org/licenses/MIT)
