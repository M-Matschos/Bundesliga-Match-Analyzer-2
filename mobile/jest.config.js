module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/__tests__/$1',
  },
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|expo-modules|react-native-screens|react-native-reanimated|@react-navigation)/)',
  ],
  testMatch: [
    '**/__tests__/**/*.test.(ts|tsx|js|jsx)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
