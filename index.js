const prompts = require('prompts');
const runTests = require('./testRunner');
const path = require('path');
const chalk = require('chalk');
const { updateProgress, isTestCompleted, loadProgress } = require('./progressTracker');

const subjects = {
    'dom-manipulation': {
        name: 'DOM Manipulation',
        tests: {
            createElement: {
                name: 'Create Element',
                description: 'Create a new element and add it to the DOM',
                hint: 'Use document.createElement() to create the element and appendChild() to add it to the DOM'
            },
            modifyElement: {
                name: 'Modify Element',
                description: 'Modify an existing element in the DOM',
                hint: 'Use methods like setAttribute(), classList.add(), or textContent to modify the element'
            },
            removeElement: {
                name: 'Remove Element',
                description: 'Remove an element from the DOM',
                hint: 'Use removeChild() or remove() to delete the element from its parent'
            }
        }
    },
    events: {
        name: 'Events',
        tests: {
            addClickListener: {
                name: 'Add Click Listener',
                description: 'Attach a click event listener to an element',
                hint: 'Use the addEventListener() method with the "click" event type'
            },
            addEventListener: {
                name: 'Add Event Listener',
                description: 'Attach an event listener to an element',
                hint: 'Use the addEventListener() method to attach the event listener'
            },
            removeEventListener: {
                name: 'Remove Event Listener',
                description: 'Remove an event listener from an element',
                hint: 'Use the removeEventListener() method with the same function reference used in addEventListener()'
            },
            eventDelegation: {
                name: 'Event Delegation',
                description: 'Implement event delegation for dynamically added elements',
                hint: 'Attach the event listener to a parent element and use event.target to determine which child was clicked'
            }
        }
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
        ...Object.entries(subjects[subject].tests).map(([test, { name }]) => ({
            title: isTestCompleted(subject, test) ? chalk.green(`${name} ✓`) : name,
            value: test
        })),
        { title: 'Back to subject menu', value: 'back' }
    ];
}

async function chooseSubject() {
    const progress = loadProgress();
    const choices = Object.entries(subjects).map(([value, { name, tests }]) => {
        const totalTests = Object.keys(tests).length;
        const completedTests = Object.keys(tests).filter(test => isTestCompleted(value, test)).length;
        const isCompleted = completedTests === totalTests;
        return {
            title: isCompleted ? chalk.green(`${name} ✓`) : name,
            value
        };
    });

    const response = await prompts({
        type: 'select',
        name: 'subject',
        message: 'Which subject would you like to run tests for?',
        choices
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
        const totalTests = Object.keys(subjects[subject].tests).length;

        while (true) {
            console.clear();
            const test = await chooseTest(subject);
            if (test === 'back') break;

            testIndex = Object.keys(subjects[subject].tests).indexOf(test);
            const progress = `${testIndex + 1}/${totalTests}`;

            let hintShown = false;

            while (true) {
                console.clear();
                console.log(chalk.cyan(`Test ${progress}: ${subjects[subject].tests[test].name}`));
                console.log(chalk.yellow(`\nDescription: ${subjects[subject].tests[test].description}`));

                if (hintShown) {
                    console.log(chalk.magenta(`\nHint: ${subjects[subject].tests[test].hint}`));
                }

                const choices = [
                    { title: 'Run Test', value: 'run' },
                    { title: 'Back to Test Selection', value: 'back' }
                ];

                if (!hintShown) {
                    choices.splice(1, 0, { title: 'Show Hint', value: 'hint' });
                }

                const { action } = await prompts({
                    type: 'select',
                    name: 'action',
                    message: 'What would you like to do?',
                    choices: choices
                });

                if (action === 'back') break;

                if (action === 'hint') {
                    hintShown = true;
                    continue;
                }

                if (action === 'run') {
                    console.clear();
                    console.log(chalk.cyan(`Running test ${progress}: ${subjects[subject].tests[test].name}`));

                    const testPath = path.join('tests', subject, `${test}.test.js`);
                    const passed = await runTests(testPath);

                    if (passed) {
                        updateProgress(subject, test);
                    }

                    console.log('\nPress Enter to continue...');
                    await prompts({ type: 'text', name: 'continue', message: '' });
                    break;
                }
            }
        }
    }

    console.log('Exiting...');
}

main().catch(console.error);
