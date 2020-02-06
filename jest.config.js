module.exports = {
  preset: 'ts-jest',
  testEnvironment: "node",
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/tsconfig.json',
      diagnostics: true,
    },
  },
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  testPathIgnorePatterns: ['/node_modules/', '/lib/'],
  testRegex: ".test.ts$",
  collectCoverage: false,
  collectCoverageFrom: [
    "**/src/**.ts",
    "!**/*.{test.ts,d.ts,js}"
  ],
  coverageDirectory: "./coverage",
};
