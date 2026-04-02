require('./config/loadEnv');
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const { connectDB, sequelize } = require('./config/db');
const GlobalNotificationService = require('./services/globalNotificationService');
const { Employee, SuperAdmin } = require('./models');

// Connect to database
connectDB();

// Initialize all models and their associations
require('./models');

// Sync models
sequelize.sync({ alter: true })
    .then(async () => {
        // Self-heal legacy/bad rows with missing display names.
        const employees = await Employee.findAll({
            where: sequelize.where(
                sequelize.fn('trim', sequelize.fn('coalesce', sequelize.col('employee_name'), '')),
                ''
            )
        });
        for (const employee of employees) {
            const fallbackName = employee.email ? employee.email.split('@')[0] : `Employee-${employee.employee_id}`;
            await employee.update({ employee_name: fallbackName });
        }

        const admins = await SuperAdmin.findAll({
            where: sequelize.where(
                sequelize.fn('trim', sequelize.fn('coalesce', sequelize.col('name'), '')),
                ''
            )
        });
        for (const admin of admins) {
            const fallbackName = admin.email ? admin.email.split('@')[0] : `User-${admin.id}`;
            await admin.update({ name: fallbackName });
        }

        console.log('Database synced successfully');
        if (employees.length || admins.length) {
            console.log(`Profile data repair applied: employees=${employees.length}, admins=${admins.length}`);
        }
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
    console.log('🔌 [Socket.IO] New client connected:', socket.id);
    console.log('🔌 [Socket.IO] Total connected clients:', io.sockets.sockets.size);

    // Users join a room with their email/ID for explicit personalized alerts
    socket.on('join_room', (userId) => {
        if (userId) {
            socket.join(userId);
            console.log(`🔌 [Socket.IO] User ${userId} joined their notification room`);
        }
    });

    // Register user for broadcasting global notifications
    socket.on('register-global-notifications', (userData) => {
        console.log('🔌 [Socket.IO] User registered for global notifications:', userData);
        console.log('🔌 [Socket.IO] Socket ID:', socket.id);
        globalNotificationService.registerUser(socket.id, userData);
        socket.join('global-notifications');
        console.log('🔌 [Socket.IO] User joined "global-notifications" room');
        console.log('🔌 [Socket.IO] Total in global-notifications room:', io.sockets.adapter.rooms.get('global-notifications')?.size || 0);
        
        // Send acknowledgment back to client
        socket.emit('registration-confirmed', { 
            success: true, 
            message: 'Registered for global notifications',
            roomSize: io.sockets.adapter.rooms.get('global-notifications')?.size || 0
        });
    });

    socket.on('disconnect', () => {
        console.log('🔌 [Socket.IO] Client disconnected:', socket.id);
        console.log('🔌 [Socket.IO] Total connected clients:', io.sockets.sockets.size);
        globalNotificationService.unregisterUser(socket.id);
    });

    // Test event for debugging
    socket.on('test-notification', (data) => {
        console.log('🔌 [Socket.IO] Test notification received:', data);
        socket.emit('test-response', { success: true, echo: data });
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
app.use('/api/v1/company-chat', require('./routes/companyChatRoutes'));
app.use('/api/company-chat', require('./routes/companyChatRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
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

const PORT = process.env.PORT || 5001;

server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is already in use. Backend is likely already running in another terminal.`);
        console.log('Use only one backend terminal, or stop the old process on port 5000 before starting again.');
        process.exit(0);
    }

    console.error('Server failed to start:', err);
    process.exit(1);
});

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
