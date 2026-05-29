import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'server/database.db');
const db = new sqlite3.Database(dbPath);

db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log('USERS:', JSON.stringify(rows, null, 2));
    
    db.all('SELECT * FROM models', [], (err, rows) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.log('MODELS:', JSON.stringify(rows, null, 2));
        db.close();
    });
});
