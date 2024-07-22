// progressTracker.js
const fs = require('fs');
const path = require('path');

const progressFile = path.join(__dirname, 'progress.json');

function loadProgress() {
    try {
        const data = fs.readFileSync(progressFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return {};
        }
        throw error;
    }
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

module.exports = { updateProgress, isTestCompleted, loadProgress, saveProgress };
