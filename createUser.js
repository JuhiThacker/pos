require('dotenv').config();

const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

async function createUser() {
    let connection;

    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'erp_pos_system'
        });

        // Get user information dynamically from command line
        const username = process.argv[2];
        const password = process.argv[3];
        const statusId = process.argv[4];

        // Validate input
        if (!username || !password || !statusId) {
            console.log('Please provide: username password status_id');
            console.log('Example:');
            console.log('node createUser.js admin2 admin123 1');
            return;
        }

        // Check whether username already exists
        const [existingUser] = await connection.execute(
            'SELECT id FROM users WHERE username = ?',
            [username]
        );

        if (existingUser.length > 0) {
            console.log('Username already exists.');
            return;
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Insert user
        const [result] = await connection.execute(
            `INSERT INTO users
                (username, password_hash, status_id)
             VALUES (?, ?, ?)`,
            [username, passwordHash, statusId]
        );

        console.log('--------------------------------');
        console.log('User created successfully!');
        console.log('User ID:', result.insertId);
        console.log('Username:', username);
        console.log('Password stored as bcrypt hash.');
        console.log('--------------------------------');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

createUser();