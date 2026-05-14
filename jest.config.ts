import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  clearMocks: true,
  collectCoverageFrom: [
    "src/lib/**/*.{ts,tsx}",
    "!src/lib/client-api.ts",
    "!src/lib/r2.ts",
  ],
  coverageDirectory: "coverage",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/**/*.test.ts"],
};

export default createJestConfig(config);
