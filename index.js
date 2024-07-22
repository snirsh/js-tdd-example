const prompts = require('prompts');
const runTests = require('./testRunner');
const path = require('path');
const chalk = require('chalk');
const { updateProgress, isTestCompleted, loadProgress } = require('./progressTracker');

const subjects = {
    'dom-manipulation': {
        name: 'DOM Manipulation',
        tests: ['createElement', 'modifyElement', 'removeElement']
    },
    events: {
        name: 'Events',
        tests: ['addEventListener', 'removeEventListener', 'eventDelegation']
    }
};

function getSubjectChoices() {
    const progress = loadProgress();
    return Object.entries(subjects).map(([value, { name }]) => {
        const isCompleted = progress[value] && Object.keys(progress[value]).length === subjects[value].tests.length;
        return {
            title: isCompleted ? chalk.green(`${name} ✓`) : name,
            value
        };
    });
}

function getTestChoices(subject) {
    return [
        ...subjects[subject].tests.map(test => ({
            title: isTestCompleted(subject, test) ? chalk.green(`${test} ✓`) : test,
            value: test
        })),
        { title: 'Back to subject menu', value: 'back' }
    ];
}

async function chooseSubject() {
    const response = await prompts({
        type: 'select',
        name: 'subject',
        message: 'Which subject would you like to run tests for?',
        choices: getSubjectChoices()
    });

    return response.subject;
}

async function chooseTest(subject) {
    const response = await prompts({
        type: 'select',
        name: 'test',
        message: `Which ${subjects[subject].name} test would you like to run?`,
        choices: getTestChoices(subject)
    });

    return response.test;
}

async function main() {
    while (true) {
        console.clear();
        const subject = await chooseSubject();
        if (!subject) break;

        let testIndex = 0;
        const totalTests = subjects[subject].tests.length;

        while (true) {
            console.clear();
            const test = await chooseTest(subject);
            if (test === 'back') break;

            testIndex = subjects[subject].tests.indexOf(test);
            const progress = `${testIndex + 1}/${totalTests}`;

            console.clear();
            console.log(chalk.cyan(`Running test ${progress}: ${test}`));

            const testPath = path.join('tests', subject, `${test}.test.js`);
            const passed = await runTests(testPath);

            if (passed) {
                updateProgress(subject, test);
            }

            console.log('\nPress Enter to continue...');
            await prompts({ type: 'text', name: 'continue', message: '' });
        }
    }

    console.log('Exiting...');
}

main().catch(console.error);
