// jest.config.js (convertit din TS config-ul tău)
const nextJest = require('next/jest')

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files
    dir: './',
})

// Add any custom config to be passed to Jest
const config = {
    coverageProvider: 'v8',
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // schimbat la .js

    // Handle module aliases and static assets
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js'
    },

    // Test file patterns - acceptă atât JS cât și TS
    testMatch: [
        '<rootDir>/**/__tests__/**/*.(ts|tsx|js|jsx)',
        '<rootDir>/**/*.(test|spec).(ts|tsx|js|jsx)'
    ],

    // Ignore patterns
    testPathIgnorePatterns: [
        '<rootDir>/.next/',
        '<rootDir>/node_modules/',
        '<rootDir>/cypress/',
        '<rootDir>/e2e/'
    ],

    // Module file extensions
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

    // Transform files - Next.js se ocupă de transformarea TS
    // Nu mai avem nevoie de ts-jest explicit, next/jest face asta automat

    // Coverage settings
    collectCoverageFrom: [
        'app/**/*.{ts,tsx,js,jsx}', // adăugat js,jsx
        'lib/**/*.{ts,tsx,js,jsx}',
        'components/**/*.{ts,tsx,js,jsx}',
        '!**/*.d.ts',
        '!**/node_modules/**',
        '!**/.next/**',
        '!**/coverage/**',
        '!**/__tests__/**',
        '!**/jest.config.*',
        '!**/next.config.*'
    ],

    // Coverage thresholds
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70,
        },
    },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(config)