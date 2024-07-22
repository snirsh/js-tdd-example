const prompts = require('prompts');
const runTests = require('./testRunner');
const path = require('path');

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

async function chooseSubject() {
    const response = await prompts({
        type: 'select',
        name: 'subject',
        message: 'Which subject would you like to run tests for?',
        choices: Object.entries(subjects).map(([value, { name }]) => ({ title: name, value }))
    });

    return response.subject;
}

async function chooseTest(subject) {
    const response = await prompts({
        type: 'select',
        name: 'test',
        message: `Which ${subjects[subject].name} test would you like to run?`,
        choices: [
            ...subjects[subject].tests.map(test => ({ title: test, value: test })),
            { title: 'Back to subject menu', value: 'back' }
        ]
    });

    return response.test;
}

async function main() {
    while (true) {
        const subject = await chooseSubject();
        if (!subject) break;

        while (true) {
            const test = await chooseTest(subject);
            if (test === 'back') break;

            const testPath = path.join('tests', subject, `${test}.test.js`);
            await runTests(testPath);

            console.log('\nPress Enter to continue...');
            await prompts({ type: 'text', name: 'continue', message: '' });
        }
    }

    console.log('Exiting...');
}

main().catch(console.error);
