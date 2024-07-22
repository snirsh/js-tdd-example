// jest.config
module.exports = {
    testEnvironment: 'jsdom',
    watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
    watchPathIgnorePatterns: ['node_modules'],
};
