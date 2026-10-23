import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

/** @type {import('jest').Config} */
const customJestConfig = {
  coverageProvider: "v8",
  collectCoverageFrom: [
    "**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**",
    "!**/coverage/**",
    "!jest.config.js",
    "!next.config.{js,cjs,mjs}",
    "!**/*.test.{js,jsx,ts,tsx}",
    "!**/__tests__/**",
    "!**/__mocks__/**",
    "!eslint.config.js",
    "!jest.setup.ts",
    "!tests/e2e/**",
    "!playwright.config.ts",
  ],
  testEnvironment: "jsdom",
  testPathIgnorePatterns: ["/node_modules/", "/.next/", "/tests/e2e/"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  transformIgnorePatterns: [
    "/node_modules/(?!(string-width|strip-ansi|ansi-regex|wrap-ansi)/)",
  ],
  moduleDirectories: ["node_modules", "<rootDir>/"],
};

export default createJestConfig(customJestConfig);
