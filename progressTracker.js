const fs = require('fs');
const path = require('path');

const progressFile = path.join(__dirname, 'progress.json');

function loadProgress() {
    if (fs.existsSync(progressFile)) {
        return JSON.parse(fs.readFileSync(progressFile, 'utf8'));
    }
    return {};
}

function saveProgress(progress) {
    fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));
}

function updateProgress(subject, test) {
    const progress = loadProgress();
    if (!progress[subject]) {
        progress[subject] = {};
    }
    progress[subject][test] = true;
    saveProgress(progress);
}

function isTestCompleted(subject, test) {
    const progress = loadProgress();
    return progress[subject] && progress[subject][test];
}

module.exports = { updateProgress, isTestCompleted, loadProgress };
