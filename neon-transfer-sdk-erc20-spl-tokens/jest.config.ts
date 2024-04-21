export default {
  clearMocks: true,
  coverageProvider: 'v8',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: { '^.+\\.(t|j)sx?$': 'ts-jest' },
  testRegex: '(/__tests__/.*(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  coveragePathIgnorePatterns: ['/node_modules/'],
  transformIgnorePatterns: ['/node_modules/']
};
