
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)
  },
  transform: {
    '^.+\.(ts|tsx)
: 'ts-jest',
  },
};
 : '<rootDir>/src/$1',
  },
  transform: {
    '^.+\.(ts|tsx)
: 'ts-jest',
  },
};
