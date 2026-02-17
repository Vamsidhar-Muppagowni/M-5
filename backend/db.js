const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'vamsidhar',
    database: 'farming_app',
    multipleStatements: true // Allow running multiple queries (useful for init)
});

// Create database and table if not exists (One-time setup helper)
// In production, database usually pre-exists.
// We will try to connect to server without DB first if this fails? 
// actually the above will fail if farming_app doesn't exist.
// Let's create a separate connection for initialization or handle it carefully.

// exporting a promise wrapper for async/await usage
module.exports = connection.promise();
