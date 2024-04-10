/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest/presets/default-esm',
    transform: {
        '^.+\\.m?[tj]sx?$': [
            'ts-jest',
            {
                useESM: true,
            },
        ],
    },
    extensionsToTreatAsEsm: ['.mts', '.ts'],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    collectCoverageFrom: [
        "src/**/*.mts",
    ],
    testEnvironment: "node",
    testRegex: "/tests/.*\\.(test|spec)?\\.(js|ts|tsx)$",
    moduleFileExtensions: ['js', 'ts', 'mts'],
    resolver: "<rootDir>/mjs-resolver.cjs", 
    coverageProvider: 'v8',
    coverageThreshold: {
        global: {
            lines: 98,
        },
    },
};
