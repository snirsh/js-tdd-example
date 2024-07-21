const prompts = require('prompts');
const { execSync } = require('child_process');

(async () => {
    const response = await prompts({
        type: 'select',
        name: 'subject',
        message: 'Which subject would you like to run tests for?',
        choices: [
            { title: 'DOM Manipulation', value: 'dom-manipulation' },
            { title: 'Events', value: 'events' }
        ],
    });

    if (response.subject) {
        console.log(`Running tests for ${response.subject === 'dom-manipulation' ? 'DOM Manipulation' : 'Events'}...`);
        console.log('Tests will run automatically. Press "f" to run only failed tests.');
        try {
            execSync(`npm run test:${response.subject}`, { stdio: 'inherit' });
        } catch (error) {
            console.error('An error occurred while running the tests.');
        }
    } else {
        console.log('No subject selected. Exiting...');
    }
})();
