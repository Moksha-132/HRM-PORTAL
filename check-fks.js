const { sequelize } = require('./config/db');

async function run() {
    try {
        const query = `
            SELECT 
                conname as constraint_name,
                conrelid::regclass as table_name,
                confrelid::regclass as referenced_table,
                a.attname as column_name,
                af.attname as referenced_column
            FROM pg_constraint c
            JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
            JOIN pg_attribute af ON af.attrelid = c.confrelid AND af.attnum = ANY(c.confkey)
            WHERE c.contype = 'f';
        `;
        const [results] = await sequelize.query(query);
        console.log(JSON.stringify(results, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
run();
