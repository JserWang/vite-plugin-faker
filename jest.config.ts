module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/playground/', '/node_modules/', 'test/utils.ts'],
  testRegex: ['(/test/.*|(\\.|/)(test|spec))\\.ts?$'],
};
