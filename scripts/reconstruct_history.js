const { execSync } = require('child_process');

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
    SUTHEKSHAN: 'Suthekshan Adeit <suthekshans@gmail.com>'
};

function commit(message, date, files, author = AUTHORS.VAMSI) {
    console.log(`\n--- Committing: "${message}" on ${date} by ${author} ---`);
    if (files === '.') {
        run('git add .');
    } else {
        files.forEach(f => {
            try {
                run(`git add "${f}"`, {}, true);
            } catch (e) {
                console.warn(`Warning: Could not add ${f}`);
            }
        });
    }

    const env = {
        'GIT_AUTHOR_DATE': date,
        'GIT_COMMITTER_DATE': date,
        'GIT_AUTHOR_NAME': author.split(' <')[0],
        'GIT_AUTHOR_EMAIL': author.split(' <')[1].slice(0, -1),
        'GIT_COMMITTER_NAME': author.split(' <')[0],
        'GIT_COMMITTER_EMAIL': author.split(' <')[1].slice(0, -1)
    };

    try {
        execSync('git diff --cached --quiet');
        console.log("Nothing to commit, skipping...");
    } catch (e) {
        run(`git commit -m "${message}"`, env);
    }
}

async function main() {
    console.log('Starting Git History Reconstruction...');

    // 1. Backup
    console.log('\nCreating backup branch...');
    run('git branch -D backup-before-reconstruction-v2', {}, true);
    run('git checkout -b backup-before-reconstruction-v2');

    // 2. Orphan Branch
    console.log('\nCreating orphan branch...');
    run('git branch -D historical-main', {}, true);
    run('git checkout --orphan historical-main');

    // 3. Unstage all
    run('git reset');

    // 4. Commits sequence
    // Feb 01 - Suthekshan
    commit('Initial project setup', '2026-02-01T09:00:00', [
        'package.json', 'package-lock.json', 'README.md', '.gitignore', 'LICENSE',
        'tailwind.config.js', 'postcss.config.js'
    ], AUTHORS.SUTHEKSHAN);

    // Feb 03 - Vamsi
    commit('Add Backend Models', '2026-02-03T10:00:00', ['backend/models'], AUTHORS.VAMSI);

    // Feb 05 - Suthekshan
    commit('Add Backend Configuration and Utilities', '2026-02-05T14:00:00', [
        'backend/config', 'backend/middleware', 'backend/utils', 'backend/.env'
    ], AUTHORS.SUTHEKSHAN);

    // Feb 07 - Vamsi
    commit('Implement Core Backend Logic (Controllers & Routes)', '2026-02-07T11:00:00', [
        'backend/controllers', 'backend/routes', 'backend/server.js', 'backend/app.js', 'backend/init_db.js'
    ], AUTHORS.VAMSI);

    // Feb 09 - Suthekshan
    commit('Add Machine Learning Service', '2026-02-09T15:00:00', ['ml-service'], AUTHORS.SUTHEKSHAN);

    // Feb 11 - Vamsi
    commit('Frontend Initialization', '2026-02-11T09:00:00', [
        'frontend/package.json', 'frontend/App.js', 'frontend/babel.config.js', 'frontend/metro.config.js'
    ], AUTHORS.VAMSI);

    // Feb 13 - Suthekshan
    commit('Frontend Components and Styles', '2026-02-13T13:00:00', [
        'frontend/src/components', 'frontend/src/styles', 'frontend/src/theme', 'frontend/assets'
    ], AUTHORS.SUTHEKSHAN);

    // Feb 15 - Vamsi
    commit('Implement Auth and Dashboard Screens', '2026-02-15T16:00:00', [
        'frontend/src/screens/auth', 'frontend/src/screens/farmer', 'frontend/src/screens/buyer',
        'frontend/src/store', 'frontend/src/services'
    ], AUTHORS.VAMSI);

    // Feb 16 - Suthekshan
    commit('Add Market and Profile Features', '2026-02-16T10:00:00', [
        'frontend/src/screens/market', 'frontend/src/screens/profile'
    ], AUTHORS.SUTHEKSHAN);

    // Feb 17 - Vamsi
    commit('Final Polish and Integration', '2026-02-17T12:00:00', ['.'], AUTHORS.VAMSI);

    console.log('\nHistory Reconstruction Complete on branch "historical-main".');
    console.log('To apply, run: git branch -D main && git branch -m main && git push -f origin main');
}

main();
