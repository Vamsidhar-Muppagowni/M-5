const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'vamsidhar',
    multipleStatements: true
});

console.log("Connecting to MySQL...");

connection.connect((err) => {
    if (err) {
        console.error("Error connecting to MySQL:", err);
        process.exit(1);
    }
    console.log("Connected to MySQL Server.");

    const initSQL = `
    CREATE DATABASE IF NOT EXISTS farming_app;
    USE farming_app;
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'farmer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

    connection.query(initSQL, (err, results) => {
        if (err) {
            console.error("Error initializing database:", err);
        } else {
            console.log("Database 'farming_app' and table 'users' initialized successfully.");
        }
        connection.end();
    });
});
