const { sequelize } = require('./config/db');

async function fix() {
    try {
        await sequelize.authenticate();
        console.log('Connected to Database...');
        
        console.log('Dropping chat_messages table and related types...');
        await sequelize.query('DROP TABLE IF EXISTS chat_messages CASCADE;');
        await sequelize.query('DROP TYPE IF EXISTS enum_chat_messages_role CASCADE;');
        
        console.log('Cleanup successful!');
        process.exit(0);
    } catch (err) {
        console.error('Cleanup failed:', err);
        process.exit(1);
    }
}

fix();
