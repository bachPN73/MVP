import sqlite3 from 'sqlite3';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const dbPath = path.resolve(__dirname, 'database.db');
const pgConnectionString = process.env.DATABASE_URL;

if (!pgConnectionString) {
    console.error('DATABASE_URL is not defined in .env');
    process.exit(1);
}

const { Pool } = pg;
const pgPool = new Pool({
    connectionString: pgConnectionString,
});

const sqliteDb = new sqlite3.Database(dbPath);

async function migrate() {
    try {
        console.log('Starting migration...');

        // 1. Migrate Users
        console.log('Migrating users...');
        const users = await new Promise((resolve, reject) => {
            sqliteDb.all('SELECT * FROM users', [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        for (const user of users) {
            await pgPool.query(
                'INSERT INTO users (name, email, role, plan, password) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING',
                [user.name, user.email, user.role, user.plan, user.password]
            );
        }

        // 2. Migrate Models
        console.log('Migrating models...');
        const models = await new Promise((resolve, reject) => {
            sqliteDb.all('SELECT * FROM models', [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        for (const model of models) {
            await pgPool.query(
                'INSERT INTO models (title, description, file_url, thumbnail, subject, grade, tags) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [model.title, model.description, model.file_url, model.thumbnail, model.subject, model.grade, model.tags]
            );
        }

        // 3. Migrate Reset Tokens
        console.log('Migrating reset tokens...');
        const tokens = await new Promise((resolve, reject) => {
            sqliteDb.all('SELECT * FROM password_reset_tokens', [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        for (const token of tokens) {
            await pgPool.query(
                'INSERT INTO password_reset_tokens (email, token, expires_at) VALUES ($1, $2, $3)',
                [token.email, token.token, token.expires_at]
            );
        }

        console.log('Migration completed successfully!');
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        sqliteDb.close();
        await pgPool.end();
    }
}

migrate();
