function jsonStringifyReplacer(key, value) {
  if (key !== 'range' || !Array.isArray(value)) {
    return value;
  }
  return `[${value.join(', ')}]`;
}

module.exports = {
  serialize(val) {
    return JSON.stringify(val, jsonStringifyReplacer, 2);
  },

  test(val) {
    return val && val.type !== undefined;
  },
};
