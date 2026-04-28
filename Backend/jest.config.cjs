module.exports = {
  testEnvironment: 'node',
  transform: {},
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.js'],
  setupFiles: ['<rootDir>/src/__tests__/setEnv.cjs']
};
