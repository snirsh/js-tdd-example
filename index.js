// index.js
const prompts = require('prompts');
const runTests = require('./testRunner');
const path = require('path');
const chalk = require('chalk');
const chokidar = require('chokidar');
const readline = require('readline');
const fs = require('fs');

const { updateProgress, isTestCompleted, loadProgress, saveProgress} = require('./progressTracker');

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

function getImplementationPath(subject, test) {
    return path.join('subjects', subject, `${test}.js`);
}

function getTestPath(subject, test) {
    return path.join('tests', subject, `${test}.test.js`);
}

function ensureImplementationFileExists(implementationPath) {
    if (!fs.existsSync(implementationPath)) {
        fs.writeFileSync(implementationPath, '// Write your implementation here\n');
    }
}

async function runTestWithWatcher(subject, test) {
    const implementationPath = getImplementationPath(subject, test);
    const testPath = getTestPath(subject, test);

    ensureImplementationFileExists(implementationPath);

    console.clear();
    console.log(chalk.cyan(`Test: ${subjects[subject].tests[test].name}`));
    console.log(chalk.yellow(`\nDescription: ${subjects[subject].tests[test].description}`));

    if (subjects[subject].tests[test].hintShown) {
        console.log(chalk.magenta(`\nHint: ${subjects[subject].tests[test].hint}`));
    }

    console.log('\nWatching for file changes. Press "q" to stop and go back.\n');

    const watcher = chokidar.watch(implementationPath, {
        persistent: true,
        usePolling: true,
        interval: 100,
        awaitWriteFinish: {
            stabilityThreshold: 300,
            pollInterval: 100
        }
    });

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.input.setRawMode(true);
    rl.input.resume();

    return new Promise((resolve) => {
        const onKeyPress = (str, key) => {
            if (key.name === 'q') {
                rl.input.removeListener('keypress', onKeyPress);
                rl.close();
                watcher.close();
                resolve();
            }
        };

        rl.input.on('keypress', onKeyPress);

        const runTest = async () => {
            console.clear();
            console.log(chalk.cyan(`Test: ${subjects[subject].tests[test].name}`));
            console.log(chalk.yellow(`\nDescription: ${subjects[subject].tests[test].description}`));

            if (subjects[subject].tests[test].hintShown) {
                console.log(chalk.magenta(`\nHint: ${subjects[subject].tests[test].hint}`));
            }

            const passed = await runTests(testPath);

            if (passed) {
                updateProgress(subject, test);
            } else if (isTestCompleted(subject, test)) {
                // If the test was previously passed but now fails, update progress
                const progress = loadProgress();
                delete progress[subject][test];
                saveProgress(progress);
            }

            console.log('\nWatching for file changes. Press "q" to stop and go back.');
        };

        watcher.on('change', runTest);

        // Run the test once immediately
        runTest();
    });
}

async function main() {
    while (true) {
        console.clear();
        const subject = await chooseSubject();
        if (!subject) break;

        while (true) {
            console.clear();
            const test = await chooseTest(subject);
            if (test === 'back') break;

            while (true) {
                console.clear();
                console.log(chalk.cyan(`Test: ${subjects[subject].tests[test].name}`));
                console.log(chalk.yellow(`\nDescription: ${subjects[subject].tests[test].description}`));

                if (subjects[subject].tests[test].hintShown) {
                    console.log(chalk.magenta(`\nHint: ${subjects[subject].tests[test].hint}`));
                }

                const choices = [
                    { title: 'Run Test', value: 'run' },
                    { title: 'Back to Test Selection', value: 'back' }
                ];

                if (!subjects[subject].tests[test].hintShown) {
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
                    subjects[subject].tests[test].hintShown = true;
                    continue;
                }

                if (action === 'run') {
                    await runTestWithWatcher(subject, test);
                    break;
                }
            }
        }
    }

    console.log('Exiting...');
}

main().catch(console.error);
