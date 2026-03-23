require('dotenv').config();
const express = require('express');
//const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

const { connectDB, sequelize } = require('./config/db');

// Load env vars
//dotenv.config();

// Connect to database
connectDB();

// Initialize all models and their associations
require('./models');

// Sync models
sequelize.sync()
    .then(() => {
        console.log('Database synced successfully');
    })
    .catch((err) => {
        console.error('Failed to sync database:', err);
    });

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors());

// Set static folder - be careful not to serve sensitive files
// Express static can be restricted or we can serve specific extensions
const publicFilesOptions = {
    index: ['index.html'],
    setHeaders: (res, filepath) => {
        // basic protection
        if(filepath.endsWith('.env') || filepath.endsWith('.js') && !filepath.endsWith('main.js') && !filepath.endsWith('admin.js')) {
            // we'll allow but actually better to route exact files
        }
    }
};

// Mount routers
app.use('/api/v1/auth', require('./routes/superAdminRoutes'));
app.use('/api/v1/settings', require('./routes/settingsRoutes'));
app.use('/api/v1/companies', require('./routes/companyRoutes'));
// app.use('/api/v1/subscriptions', require('./routes/subscriptionRoutes'));
app.use('/api/v1/transactions', require('./routes/transactionRoutes'));
app.use('/api/v1/manager', require('./routes/managerRoutes'));
app.use('/api/v1/employee', require('./routes/employeeRoutes'));
app.use('/api/v1/chat', require('./routes/v1ChatRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/admin', require('./routes/adminChatRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
// app.use('/api/v1/email-queries', require('./routes/emailQueryRoutes'));
// app.use('/api/v1/offline-requests', require('./routes/offlineRequestRoutes'));


// Serve static assets
app.use(express.static(__dirname, publicFilesOptions));

// Expose uploads so uploaded images can be fetched
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve specific files
app.get('/admin-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-dashboard.html'));
});

app.get('/manager-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'manager-dashboard.html'));
});

app.get('/employee-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'employee-dashboard.html'));
});

// 404 handler for API
app.use('/api', (req, res) => {
    res.status(404).json({ success: false, error: `Route ${req.originalUrl} not found` });
});

// Fallback error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: 'Server Error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
