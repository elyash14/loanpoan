const cron = require('node-cron');
const path = require('path');

// Load environment variables from the project root's .env file
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const CRON_SECRET = process.env.CRON_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

console.log('--------------------------------------------------');
console.log(`[${new Date().toISOString()}] Next Financial Cron Worker Starting...`);
console.log(`Target URL: ${APP_URL}`);

if (!CRON_SECRET) {
    console.warn(`WARNING: CRON_SECRET is not defined in environment variables.`);
    console.warn(`The worker will attempt to run, but calls to the secure API route may fail with 401 Unauthorized.`);
} else {
    console.log(`CRON_SECRET is loaded successfully.`);
}

// Schedule: 0 1 * * * runs at 1:00 AM every day
const schedulePattern = '0 1 * * *';
console.log(`Scheduling daily installment generation with pattern: "${schedulePattern}"`);
console.log('--------------------------------------------------');

async function triggerInstallmentGeneration() {
    console.log(`[${new Date().toISOString()}] Triggering monthly installment generation...`);
    const endpoint = `${APP_URL}/api/cron/generate-installments`;

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CRON_SECRET || ''}`,
                'Content-Type': 'application/json',
            },
        });

        const status = response.status;
        const data = await response.json().catch(() => ({}));

        if (response.ok) {
            console.log(`[${new Date().toISOString()}] SUCCESS: Installments generated successfully. Response:`, JSON.stringify(data));
        } else {
            console.error(`[${new Date().toISOString()}] ERROR: API responded with status ${status}. Details:`, JSON.stringify(data));
        }
    } catch (error) {
        console.error(`[${new Date().toISOString()}] EXCEPTION: Failed to reach the cron endpoint. Error:`, error.message);
    }
}

// Start the cron scheduler
cron.schedule(schedulePattern, () => {
    triggerInstallmentGeneration();
});

// Optional: run once on startup for verification if a run flag is passed
if (process.argv.includes('--run-now')) {
    console.log(`--run-now flag detected. Running immediate trigger verification...`);
    triggerInstallmentGeneration();
}
