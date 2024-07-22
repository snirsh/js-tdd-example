const jest = require('jest');
const chalk = require('chalk');

function formatErrorMessage(failureMessage) {
    const messageLines = failureMessage.split('\n');
    return messageLines[0];
}

async function runTests(testPath) {
    // Temporarily redirect console.log to suppress Jest output
    const originalLog = console.log;
    console.log = () => {};

    try {
        const results = await jest.runCLI(
            {
                silent: true,
                testRegex: [testPath],
                reporters: [],
            },
            [process.cwd()]
        );

        // Restore console.log
        console.log = originalLog;

        const { numFailedTests, numPassedTests, testResults } = results.results;

        console.log(chalk.bold('\nTest Results:'));
        testResults[0].testResults.forEach((test) => {
            if (test.status === 'passed') {
                console.log(chalk.green(`✓ ${test.title}`));
            } else {
                console.log(chalk.red(`✗ ${test.title}`));
                const errorMessage = formatErrorMessage(test.failureMessages[0]);
                console.log(chalk.red(`  ${errorMessage}`));
            }
        });

        console.log(chalk.bold(`\nPassed: ${numPassedTests}, Failed: ${numFailedTests}`));
    } catch (error) {
        // Restore console.log in case of error
        console.log = originalLog;
        console.error('An error occurred while running the tests:', error);
    }
}

module.exports = runTests;
