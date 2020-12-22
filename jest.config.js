module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/playground/', '/node_modules/'],
  testRegex: '(/test/.*|(\\.|/)(test|spec))\\.ts?$',
};
