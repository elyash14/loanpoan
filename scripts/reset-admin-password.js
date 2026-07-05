#!/usr/bin/env node
/**
 * Reset admin password using raw SQL (works before/after column rename migrations).
 * Usage: node scripts/reset-admin-password.js [email] [password]
 */
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

function loadEnv() {
    const envPath = path.join(__dirname, '../.env');
    if (!fs.existsSync(envPath)) return;
    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        let value = trimmed.slice(eq + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = value;
    }
}

loadEnv();

async function main() {
    const email = process.argv[2] || process.env.ADMIN_EMAIL || 'admin@example.com';
    const password = process.argv[3] || process.env.ADMIN_PASSWORD || 'admin123';
    const connectionString = (process.env.DATABASE_URL || '').replace(/\?.*$/, '');

    if (!connectionString) {
        throw new Error('DATABASE_URL is not set');
    }

    const pool = new Pool({ connectionString });
    const hash = bcrypt.hashSync(password, 10);

    try {
        const existing = await pool.query('SELECT id FROM "User" WHERE email = $1', [email]);

        if (existing.rowCount > 0) {
            await pool.query(
                'UPDATE "User" SET password = $1, role = $2, "deletedAt" = NULL WHERE email = $3',
                [hash, 'ADMIN', email]
            );
            console.log(`Updated password for ${email}`);
        } else {
            await pool.query(
                `INSERT INTO "User" ("firstName", "lastName", email, gender, password, role, "createdAt")
                 VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
                ['Admin', 'User', email, 'MAN', hash, 'ADMIN']
            );
            console.log(`Created admin user ${email}`);
        }

        console.log(`Login with email: ${email}`);
        console.log(`Password: ${password}`);
    } finally {
        await pool.end();
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
