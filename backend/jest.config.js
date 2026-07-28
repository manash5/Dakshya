/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: "tsconfig.jest.json" }],
  },
  rootDir: ".",
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  // mongodb-memory-server downloads/starts a real mongod -- generous headroom
  // on top of Jest's 5s default so the first run (binary download) doesn't
  // time out.
  testTimeout: 30000,
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/config/**",
    "!src/cron/**",
    "!src/database/**",
    "!src/**/*.d.ts",
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      lines: 80,
      functions: 80,
      branches: 45,
    },
  },
};
