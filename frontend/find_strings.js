const fs = require('fs');

function findNakedStrings(filename) {
    const content = fs.readFileSync(filename, 'utf8');
    let inTag = false;
    let inExpression = 0;
    let currentString = '';
    let startPos = 0;

    // Simple state machine to find text outside < > and { }
    // Note: This is a heuristic and might have false positives (like in strings or comments)
    // but it's good for finding stray text in JSX.
    for (let i = 0; i < content.length; i++) {
        const char = content[i];

        if (char === '<' && !inTag && inExpression === 0) {
            checkString(currentString, startPos, filename);
            inTag = true;
            currentString = '';
        } else if (char === '>' && inTag && inExpression === 0) {
            inTag = false;
            startPos = i + 1;
            currentString = '';
        } else if (char === '{' && !inTag) {
            if (inExpression === 0) {
                checkString(currentString, startPos, filename);
                currentString = '';
            }
            inExpression++;
        } else if (char === '}' && !inTag) {
            inExpression--;
            if (inExpression === 0) {
                startPos = i + 1;
                currentString = '';
            }
        } else if (!inTag && inExpression === 0) {
            currentString += char;
        }
    }
}

function checkString(str, pos, file) {
    // Only check if it's inside what looks like a return block or component body
    // This is very rough, but we are looking for non-whitespace text.
    const trimmed = str.trim();
    if (trimmed.length > 0 && !trimmed.startsWith('//') && !trimmed.startsWith('/*')) {
        // Find line number
        const lines = str.split('\n');
        // This heuristic is noisy outside of JSX blocks, but we can look for obviously out-of-place text
        if (trimmed.includes(';') || trimmed.includes('=')) return; // Likely JS code outside JSX

        // If it looks like actual text words, it's a hit
        if (/[a-zA-Z]/.test(trimmed)) {
            console.log(`POTENTIAL NAKED STRING in ${file} at offset ${pos}: "${trimmed}"`);
        }
    }
}

const files = process.argv.slice(2);
files.forEach(findNakedStrings);
