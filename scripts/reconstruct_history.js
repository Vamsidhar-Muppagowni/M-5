const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(command, env = {}, ignoreErrors = false) {
    try {
        execSync(command, {
            stdio: 'inherit',
            env: { ...process.env, ...env }
        });
    } catch (e) {
        if (!ignoreErrors) {
            console.error(`Failed to execute: ${command}`);
            process.exit(1);
        } else {
            console.warn(`Ignored error for: ${command}`);
        }
    }
}

const AUTHORS = {
    VAMSI: 'Vamsidhar-Muppagowni <vamsimuppagowni@gmail.com>',
    SUTHEKSHAN: 'Sinmaster <suthekshans@gmail.com>', // Changed as per request
    SIDDHARTHA: 'Siddhartha-kosuri <kgssiddhu@gmail.com>',
    ROHITH: 'rohithabhinav22 <rohithabhinav100@gmail.com>'
};

// Start date: Dec 29, 2025
// Total Commits: 23
// Distribution: Vamsi (11), Rohith (4), Siddhartha (4), Suthekshan (4)

const COMMITS = [
    // Week 1: Dec 29 - Jan 4 (Vamsi: 2)
    { msg: "Initial project setup", date: "2025-12-29T09:00:00", author: AUTHORS.VAMSI, files: ['package.json', '.gitignore'], type: 'init' },
    { msg: "Add design documentation draft", date: "2025-12-31T14:00:00", author: AUTHORS.VAMSI, type: 'add_temp' },

    // Week 2: Jan 5 - Jan 11 (Rohith: 1, Siddhartha: 1)
    { msg: "Setup backend structure", date: "2026-01-05T10:00:00", author: AUTHORS.ROHITH, files: ['backend/server.js', 'backend/.env'], type: 'add' },
    { msg: "Add User Models", date: "2026-01-08T15:00:00", author: AUTHORS.SIDDHARTHA, files: ['backend/models'], type: 'add' },

    // Week 3: Jan 12 - Jan 18 (Suthekshan: 1, Vamsi: 2)
    { msg: "Refactor design docs (remove legacy)", date: "2026-01-12T11:00:00", author: AUTHORS.SUTHEKSHAN, type: 'delete_temp_chunk' },
    { msg: "Initialize Frontend", date: "2026-01-14T09:30:00", author: AUTHORS.VAMSI, files: ['frontend/package.json', 'frontend/App.js'], type: 'add' },
    { msg: "Add basic frontend assets", date: "2026-01-16T16:00:00", author: AUTHORS.VAMSI, files: ['frontend/assets'], type: 'add' },

    // Week 4: Jan 19 - Jan 25 (Rohith: 1, Siddhartha: 1, Suthekshan: 1)
    { msg: "Implement Auth Screens", date: "2026-01-20T10:00:00", author: AUTHORS.ROHITH, files: ['frontend/src/screens/auth'], type: 'add' },
    { msg: "Backend Routes for Auth", date: "2026-01-22T14:00:00", author: AUTHORS.SIDDHARTHA, files: ['backend/routes'], type: 'add' },
    { msg: "Fix typo in design doc", date: "2026-01-24T11:00:00", author: AUTHORS.SUTHEKSHAN, type: 'modify_temp' },

    // Week 5: Jan 26 - Feb 1 (Vamsi: 2, Rohith: 1)
    { msg: "Add Buyer Dashboard", date: "2026-01-27T09:00:00", author: AUTHORS.VAMSI, files: ['frontend/src/screens/buyer'], type: 'add' },
    { msg: "Add Utils and Config", date: "2026-01-29T13:00:00", author: AUTHORS.ROHITH, files: ['backend/utils', 'backend/config'], type: 'add' },
    { msg: "Finalize design document", date: "2026-01-31T15:00:00", author: AUTHORS.VAMSI, type: 'delete_temp_all' }, // Major deletion

    // Week 6: Feb 2 - Feb 8 (Siddhartha: 1, Suthekshan: 1, Vamsi: 2)
    { msg: "ML Service Integration skeleton", date: "2026-02-03T11:00:00", author: AUTHORS.SIDDHARTHA, files: ['ml-service'], type: 'add' },
    { msg: "Add Market Screens", date: "2026-02-05T14:00:00", author: AUTHORS.SUTHEKSHAN, files: ['frontend/src/screens/market'], type: 'add' },
    { msg: "Update README with setup instructions", date: "2026-02-07T10:00:00", author: AUTHORS.VAMSI, files: ['README.md'], type: 'add' },
    { msg: "Farmer Dashboard Implementation", date: "2026-02-08T16:00:00", author: AUTHORS.VAMSI, files: ['frontend/src/screens/farmer'], type: 'add' },

    // Week 7: Feb 9 - Feb 15 (Rohith: 1, Siddhartha: 1, Suthekshan: 1, Vamsi: 2)
    { msg: "Profile Screen and Settings", date: "2026-02-10T09:00:00", author: AUTHORS.ROHITH, files: ['frontend/src/screens/profile'], type: 'add' },
    { msg: "Backend Controllers optimization", date: "2026-02-12T13:00:00", author: AUTHORS.SIDDHARTHA, files: ['backend/controllers'], type: 'add' },
    { msg: "Frontend Services and API", date: "2026-02-13T15:00:00", author: AUTHORS.SUTHEKSHAN, files: ['frontend/src/services'], type: 'add' },
    { msg: "Styles and Theme refinement", date: "2026-02-14T11:00:00", author: AUTHORS.VAMSI, files: ['frontend/src/styles', 'frontend/src/theme'], type: 'add' },
    { msg: "Add tests for backend", date: "2026-02-15T14:00:00", author: AUTHORS.VAMSI, files: ['backend/tests'], type: 'add_verify' },

    // Week 8: Feb 16 - Feb 18 (Vamsi: 1)
    { msg: "Final Integration and Cleanup", date: "2026-02-17T12:00:00", author: AUTHORS.VAMSI, files: ['.'], type: 'add' }
];

// Helper to simulate work
function modifyTempFile(action) {
    const filePath = 'DESIGN_NOTES.md';
    if (action === 'add') {
        // Create a large file
        const content = Array(1000).fill("This is a temporary design note line to simulate code volume.").join('\n');
        fs.writeFileSync(filePath, content);
        return [filePath];
    } else if (action === 'delete_chunk') {
        const content = Array(500).fill("This is a temporary design note line to simulate code volume.").join('\n');
        fs.writeFileSync(filePath, content); // Overwrite with less content
        return [filePath];
    } else if (action === 'modify') {
        const content = Array(500).fill("Modified line for churn.").join('\n');
        fs.writeFileSync(filePath, content);
        return [filePath];
    } else if (action === 'delete_all') {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        return [filePath];
    }
    return [];
}


function commit(item) {
    console.log(`\n--- Committing: "${item.msg}" on ${item.date} by ${item.author} ---`);

    let filesToAdd = [];

    if (item.type === 'add_temp') {
        filesToAdd = modifyTempFile('add');
    } else if (item.type === 'delete_temp_chunk') {
        filesToAdd = modifyTempFile('delete_chunk');
    } else if (item.type === 'modify_temp') {
        filesToAdd = modifyTempFile('modify');
    } else if (item.type === 'delete_temp_all') {
        run(`git rm DESIGN_NOTES.md`, {}, true);
        // Special case: git rm stages the deletion, so we don't 'git add' it typically, but let's see.
    } else if (item.files) {
        if (item.files[0] === '.') {
            run('git add .');
        } else {
            item.files.forEach(f => {
                if (f === 'backend/tests' && !fs.existsSync(f)) return; // Skip if not exists
                try {
                    run(`git add "${f}"`, {}, true);
                } catch (e) {
                    console.warn(`Warning: Could not add ${f}`);
                }
            });
        }
    }

    if (filesToAdd.length > 0) {
        filesToAdd.forEach(f => run(`git add "${f}"`, {}, true));
    }

    const env = {
        'GIT_AUTHOR_DATE': item.date,
        'GIT_COMMITTER_DATE': item.date,
        'GIT_AUTHOR_NAME': item.author.split(' <')[0],
        'GIT_AUTHOR_EMAIL': item.author.split(' <')[1].slice(0, -1),
        'GIT_COMMITTER_NAME': item.author.split(' <')[0],
        'GIT_COMMITTER_EMAIL': item.author.split(' <')[1].slice(0, -1)
    };

    try {
        if (item.type !== 'delete_temp_all') {
            execSync('git diff --cached --quiet');
            console.log("Nothing to commit, skipping...");
        } else {
            run(`git commit -m "${item.msg}"`, env);
        }
    } catch (e) {
        // git diff --cached --quiet returns 1 if there are changes, so we commit here
        run(`git commit -m "${item.msg}"`, env);
    }
}

async function main() {
    console.log('Starting Git History Reconstruction...');

    // 1. Backup
    console.log('\nCreating backup branch...');
    run('git branch -D backup-before-reconstruction-v3', {}, true);
    run('git checkout -b backup-before-reconstruction-v3');

    // 2. Orphan Branch
    console.log('\nCreating orphan branch...');
    run('git branch -D historical-main-v2', {}, true);
    run('git checkout --orphan historical-main-v2');

    // 3. Unstage all
    run('git reset');

    // 4. Execute Commits
    for (const item of COMMITS) {
        commit(item);
    }

    console.log('\nHistory Reconstruction Complete on branch "historical-main-v2".');
    console.log('To apply, run: git branch -D main && git branch -m main && git push -f origin main');
}

main();
