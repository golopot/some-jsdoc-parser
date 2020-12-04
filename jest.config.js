const semver = require('semver');

module.exports = {
  testEnvironment: 'node',
  snapshotSerializers: ['./tests/snapshot-serializer.js'],
  reporters: semver.satisfies(process.versions.node, '>=10')
    ? ['jest-progress-bar-reporter']
    : undefined,
  collectCoverageFrom: ['lib/**/*.js'],
};
