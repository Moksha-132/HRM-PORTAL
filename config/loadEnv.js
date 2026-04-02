const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const candidatePaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(__dirname, '..', '.env'),
    path.resolve(__dirname, '..', '..', '.env'),
];

const loadedPaths = new Set();

candidatePaths.forEach((envPath) => {
    if (!fs.existsSync(envPath) || loadedPaths.has(envPath)) {
        return;
    }

    dotenv.config({
        path: envPath,
        override: false,
        quiet: true,
    });
    loadedPaths.add(envPath);
});

