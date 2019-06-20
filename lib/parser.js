'use strict'

/**
 * @typedef {import('./types').ParserState} ParserState
 * @typedef {import('./types').JSDocTag} JSDocTag
 * @typedef {import('./types').JSDocTypeAnnotation} JSDocTypeAnnotation
 * @typedef {import('./types').JSDocName} JSDocName
 * @typedef {import('./types').JSDocDescription} JSDocDescription
 * @typedef {import('./types').JSDocBlock} JSDocBlock
 * @typedef {import('./types').JSDocComment} JSDocComment
 */

/**
 * TODO: make this configurable
 * @param {string} tagName
 * @returns {boolean}
 */
function shouldParseType(tagName) {
  switch (tagName) {
    case 'return':
    case 'returns':
    case 'param':
    case 'arg':
    case 'argument':
    case 'enum':
    case 'extends':
    case 'type':
    case 'typedef':
    case 'throws':
    case 'exception':
    case 'property':
    case 'prop':
    case 'const':
    case 'constant':
    case 'implements':
    case 'member':
    case 'var':
      return true;
    default:
      return false;
  }
}

/**
 * TODO: make this configurable
 * @param {string} tagName
 * @returns {boolean}
 */
function shouldParseName(tagName) {
  switch (tagName) {
    case 'param':
    case 'arg':
    case 'arguments':
    case 'property':
    case 'prop':
    case 'this':
    case 'augments':
    case 'extends':
    case 'namespace':
    case 'const':
    case 'constant':
    case 'kind':
      return true;
    default:
      return false;
  }
}

/**
 * @param {ParserState} parser
 * @returns {string}
 */
function getChar(parser) {
  return parser.source[parser.pos];
}

/**
 * @param {ParserState} parser
 * @param {string} char
 * @returns {boolean}
 */
function consumeCharOpt(parser, char) {
  if (parser.source[parser.pos] === char) {
    parser.pos += 1;
    return true;
  }
  return false;
}

/**
 * @param {ParserState} parser
 * @returns {boolean}
 */
function isEOF(parser) {
  return parser.pos === parser.source.length;
}

class ParseError extends SyntaxError {
  /**
   * @param {string} message
   * @param {number} [pos]
   */
  constructor(message, pos) {
    super(message);
    this.pos = pos;
  }
}

/**
 *
 * @param {ParserState} parser
 * @param {RegExp} regExp
 * @param {string} [message]
 * @returns {string}
 */
function consumeRegExp(parser, regExp, message) {
  const match = regExp.exec(parser.source.slice(parser.pos));
  if (!match) {
    const msg = message || 'Invalid syntax';
    throw new ParseError(msg);
  }

  parser.pos += match[0].length;
  return match[0];
}

/**
 *
 * @param {ParserState} parser
 * @param {RegExp} regExp
 * @returns {string | undefined}
 */
function consumeRegExpOpt(parser, regExp) {
  const match = regExp.exec(parser.source.slice(parser.pos));
  if (!match) {
    return undefined;
  }

  parser.pos += match[0].length;
  return match[0];
}

function consumeSpaces(parser) {
  consumeRegExp(parser, /^[ \t]*/);
}

/**
 * Skip spaces and one star in line start.
 * @param {ParserState} parser
 * @returns {void}
 */
function consumeLinePadding(parser) {
  consumeRegExp(parser, /^[ \t\r]*\*?/);
}

/**
 * @param {ParserState} parser
 * @returns {JSDocDescription | null}
 */
function parseDescription(parser) {
  consumeRegExp(parser, /^[ \t\r]*/);
  while (consumeRegExpOpt(parser, /^\n[ \t\r]*\*?[ \t\r]*/)) {
    //
  }

  const start = parser.pos;
  let text = consumeRegExp(parser, /^[^@\n]*/);

  let end = parser.pos;
  while (consumeCharOpt(parser, '\n')) {
    consumeLinePadding(parser);
    const line = consumeRegExp(parser, /^[^@\n]*/);

    // Do not include empty lines
    if (!/^[ \t]*$/.test(line)) {
      end = parser.pos;
      text += `\n${line}`;
    }

    if (getChar(parser) === '@') {
      break;
    }
  }

  if (start === parser.pos) {
    return null;
  }

  return {
    type: 'JSDocDescription',
    value: text,
    range: [start, end],
  };
}

/**
 * @param {ParserState} parser
 * @returns {JSDocTag}
 */
function parseTag(parser) {
  const start = parser.pos;
  const tag = consumeRegExp(parser, /^@[-a-zA-Z]+/, 'Tag expected.');
  return {
    type: 'JSDocTag',
    name: tag.slice(1),
    range: [start, parser.pos],
  };
}

/**
 * @param {ParserState} parser
 * @returns {JSDocTypeAnnotation}
 */
function parseType(parser) {
  const start = parser.pos;
  ++parser.pos;
  let curlyBalance = 1;
  let value = '';

  while (curlyBalance > 0) {
    if (isEOF(parser)) {
      throw new ParseError("'}' expected.");
    }
    const char = getChar(parser);
    value += char;
    ++parser.pos;
    switch (char) {
      case '{':
        curlyBalance += 1;
        break;
      case '}':
        curlyBalance -= 1;
        break;
      case '\n':
        consumeLinePadding(parser);
        break;
      default:
    }
  }

  return {
    type: 'JSDocTypeAnnotation',
    value: value.slice(0, value.length - 1),
    range: [start, parser.pos],
  };
}

/**
 * @param {ParserState} parser
 * @returns {JSDocName | null}
 */
function parseName(parser) {
  const start = parser.pos;

  if (consumeCharOpt(parser, '[')) {
    const name = consumeRegExp(parser, /^[^\]\n\r]*/);
    if (!consumeCharOpt(parser, ']')) {
      throw new ParseError('"]" expected.');
    }
    return {
      type: 'JSDocName',
      name: name.trim(),
      optional: true,
      range: [start, parser.pos],
    };
  }

  const name = consumeRegExp(parser, /^[^\] \t\r\n]*/);

  if (name.length === 0) {
    return null;
  }

  return {
    type: 'JSDocName',
    name,
    optional: false,
    range: [start, parser.pos],
  };
}

/**
 * @param {ParserState} parser
 * @returns {JSDocBlock}
 */
function parseBlock(parser) {
  consumeSpaces(parser);
  const start = parser.pos;
  const tag = parseTag(parser);
  consumeSpaces(parser);

  let typeAnnotation = null;
  if (getChar(parser) === '{' && shouldParseType(tag.name)) {
    typeAnnotation = parseType(parser);
  }

  consumeSpaces(parser);

  let name = null;
  if (getChar(parser) !== '\n' && shouldParseName(tag.name)) {
    name = parseName(parser);
  }

  consumeSpaces(parser);
  const description = parseDescription(parser);

  /* eslint-disable no-nested-ternary */
  const end = description
    ? description.range[1]
    : name
    ? name.range[1]
    : typeAnnotation
    ? typeAnnotation.range[1]
    : tag.range[1];
  /* eslint-enable no-nested-ternary */

  return {
    type: 'JSDocBlock',
    tag,
    typeAnnotation,
    name,
    description,
    range: [start, end],
  };
}

/**
 * @param {ParserState} parser
 * @return {JSDocComment}
 */
function parseComment(parser) {
  consumeSpaces(parser);
  const description = parseDescription(parser);
  const blocks = [];
  while (!isEOF(parser)) {
    blocks.push(parseBlock(parser));
  }
  return {
    type: 'JSDocComment',
    description,
    blocks,
    range: [0, parser.source.length + 2],
  };
}

/**
 * @param {string} source
 * @returns {ParserState}
 */
function createParser(source) {
  const commentStartMatch = /^[ \t\n\r]*\/\*\*/.exec(source);
  if (commentStartMatch === null) {
    throw new ParseError('Input source must start with "/**".');
  }

  const commentEndMatch = /\*\/[ \t\n\r]*$/.exec(source);
  if (commentEndMatch === null) {
    throw new ParseError('Input source must ends with "*/".');
  }

  return {
    source: source.slice(0, source.length - commentEndMatch[0].length),
    pos: commentStartMatch[0].length,
  };
}

/**
 * @param {string} source The comment string that starts with `/**`.
 * @returns {JSDocComment} An abstract syntax tree.
 */
function parse(source) {
  const parser = createParser(source);
  return parseComment(parser);
}

exports.parse = parse;
