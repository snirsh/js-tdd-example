const jest = require('jest');
const chalk = require('chalk');

function formatErrorMessage(failureMessage) {
    const messageLines = failureMessage.split('\n');
    return messageLines[0];
}

async function runTests(testPath) {
    const originalLog = console.log;
    const originalStdoutWrite = process.stdout.write;
    console.log = () => {};
    process.stdout.write = () => {};

    try {
        const results = await jest.runCLI(
            {
                silent: true,
                testRegex: [testPath],
                reporters: [],
            },
            [process.cwd()]
        );

        console.log = originalLog;
        process.stdout.write = originalStdoutWrite;

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

        return numFailedTests === 0;
    } catch (error) {
        console.log = originalLog;
        process.stdout.write = originalStdoutWrite;
        console.error('An error occurred while running the tests:', error);
        return false;
    }
}

module.exports = runTests;
