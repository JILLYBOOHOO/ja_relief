const mysql = require('mysql2/promise');
require('dotenv').config();

async function init() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  const dbName = process.env.DB_NAME || 'ja_relief';
  await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
  await connection.query(`USE ${dbName}`);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS survivors (
      id INT AUTO_INCREMENT PRIMARY KEY,
      fullName VARCHAR(255) NOT NULL,
      contact VARCHAR(50) NOT NULL,
      idType VARCHAR(50),
      idNumber VARCHAR(50) NOT NULL UNIQUE,
      provisional BOOLEAN DEFAULT FALSE,
      parish VARCHAR(100),
      address TEXT,
      dob DATE,
      damageLevel VARCHAR(50),
      password VARCHAR(255) NOT NULL,
      idScanPath VARCHAR(255),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Database and table initialized successfully');
  await connection.end();
}

init().catch(err => {
  console.error('❌ Error initializing database:', err);
});
