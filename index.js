// index.js
const prompts = require('prompts');
const path = require('path');
const chalk = require('chalk');
const chokidar = require('chokidar');
const readline = require('readline');
const fs = require('fs');

const runTests = require('./testRunner');
const { updateProgress, isTestCompleted, loadProgress, saveProgress } = require('./progressTracker');
const subjects = require('./subjects');

function getSubjectChoices() {
    const progress = loadProgress();
    return Object.entries(subjects).map(([value, { name }]) => ({
        title: isSubjectCompleted(value, progress) ? chalk.green(`${name} ✓`) : name,
        value
    }));
}

function isSubjectCompleted(subject, progress) {
    return progress[subject] && Object.keys(progress[subject]).length === Object.keys(subjects[subject].tests).length;
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

function displayTestInfo(subject, test) {
    console.clear();
    console.log(chalk.cyan(`Test: ${subjects[subject].tests[test].name}`));
    console.log(chalk.yellow(`\nDescription: ${subjects[subject].tests[test].description}`));

    if (subjects[subject].tests[test].hintShown) {
        console.log(chalk.magenta(`\nHint: ${subjects[subject].tests[test].hint}`));
    }
}

async function runTestWithWatcher(subject, test) {
    const implementationPath = getImplementationPath(subject, test);
    const testPath = getTestPath(subject, test);

    ensureImplementationFileExists(implementationPath);
    displayTestInfo(subject, test);

    console.log('\nWatching for file changes. Press "q" to stop and go back.\n');

    const watcher = createWatcher(implementationPath);
    const rl = createReadlineInterface();

    return new Promise((resolve) => {
        setupKeyPressHandler(rl, watcher, resolve);
        setupWatcher(watcher, subject, test, testPath);
        runTest(subject, test, testPath);
    });
}

function createWatcher(implementationPath) {
    return chokidar.watch(implementationPath, {
        persistent: true,
        usePolling: true,
        interval: 100,
        awaitWriteFinish: {
            stabilityThreshold: 300,
            pollInterval: 100
        }
    });
}

function createReadlineInterface() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.input.setRawMode(true);
    rl.input.resume();
    return rl;
}

function setupKeyPressHandler(rl, watcher, resolve) {
    const onKeyPress = (str, key) => {
        if (key.name === 'q') {
            rl.input.removeListener('keypress', onKeyPress);
            rl.close();
            watcher.close();
            resolve();
        }
    };
    rl.input.on('keypress', onKeyPress);
}

function setupWatcher(watcher, subject, test, testPath) {
    watcher.on('change', () => runTest(subject, test, testPath));
}

async function runTest(subject, test, testPath) {
    displayTestInfo(subject, test);
    const passed = await runTests(testPath);
    updateTestProgress(subject, test, passed);
    console.log('\nWatching for file changes. Press "q" to stop and go back.');
}

function updateTestProgress(subject, test, passed) {
    if (passed) {
        updateProgress(subject, test);
    } else if (isTestCompleted(subject, test)) {
        const progress = loadProgress();
        delete progress[subject][test];
        saveProgress(progress);
    }
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
                displayTestInfo(subject, test);
                const action = await chooseAction(subject, test);
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

async function chooseAction(subject, test) {
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

    return action;
}

main().catch(console.error);
