require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const { connectDB, sequelize } = require('./config/db');
const GlobalNotificationService = require('./services/globalNotificationService');

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
const server = http.createServer(app);

// Create Socket.IO server
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

// Attach io to app so controllers can use it
app.set('io', io);

// Global notification service mapping
const globalNotificationService = new GlobalNotificationService(io);

// Socket connection handling
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Users join a room with their email/ID for explicit personalized alerts
    socket.on('join_room', (userId) => {
        if (userId) {
            socket.join(userId);
            console.log(`User ${userId} joined their notification room`);
        }
    });

    // Register user for broadcasting global notifications
    socket.on('register-global-notifications', (userData) => {
        console.log('User registered for global notifications:', userData);
        globalNotificationService.registerUser(socket.id, userData);
        socket.join('global-notifications');
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        globalNotificationService.unregisterUser(socket.id);
    });
});

// Make io and globalNotificationService globally available
global.io = io;
global.globalNotificationService = globalNotificationService;

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors());

// Set static folder
const publicFilesOptions = {
    index: ['index.html'],
    setHeaders: (res, filepath) => {
        // basic protection
    }
};

// Mount routers
app.use('/api/v1/auth', require('./routes/superAdminRoutes'));
app.use('/api/v1/settings', require('./routes/settingsRoutes'));
app.use('/api/v1/companies', require('./routes/companyRoutes'));
app.use('/api/v1/transactions', require('./routes/transactionRoutes'));
app.use('/api/v1/manager', require('./routes/managerRoutes'));
app.use('/api/v1/employee', require('./routes/employeeRoutes'));
app.use('/api/v1/chat', require('./routes/v1ChatRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/admin', require('./routes/adminChatRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/global-notifications', require('./routes/globalNotificationRoutes'));

// Serve static assets
app.use(express.static(__dirname, publicFilesOptions));

// Expose uploads
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
server.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`));
