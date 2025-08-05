module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'routes/**/*.js',
    'controllers/**/*.js',
    'models/**/*.js'
  ],
  coverageDirectory: 'coverage',
  verbose: true
};