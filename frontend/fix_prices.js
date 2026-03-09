const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'screens', 'decision', 'PriceDashboard.js');
let content = fs.readFileSync(filePath, 'utf8');

// The error happens when {" "} is NOT inside <Text>.
// A common pattern from bad formatting is:
// />{" "}
// </View>{" "}
// </Text>{" "}
// {something()}{" "}

// Let's remove {" "} if it is immediately preceded by >, }, or followed by <, {
// Also we can just remove all {" "} that are surrounded by whitespace or newlines 
// basically anywhere it's not strictly between text.
// Actually, it's safer to remove `{" "}` entirely from this file since none of the valid text nodes strictly require it for a single space, or we can just replace text node spaces with a literal space inside the text.

content = content.replace(/>\s*\{\s*["']\s*["']\s*\}\s*</g, '><');
content = content.replace(/\}\s*\{\s*["']\s*["']\s*\}\s*</g, '}<');
content = content.replace(/>\s*\{\s*["']\s*["']\s*\}\s*\{/g, '>{');
content = content.replace(/\}\s*\{\s*["']\s*["']\s*\}\s*\{/g, '}{');
content = content.replace(/\{\s*["']\s*["']\s*\}\s*</g, '<');
content = content.replace(/>\s*\{\s*["']\s*["']\s*\}/g, '>');

// More aggressive: remove ALL {" "}
content = content.replace(/\{\s*"\s*"\s*\}/g, '');

fs.writeFileSync(filePath, content);
console.log('Fixed PriceDashboard.js');
