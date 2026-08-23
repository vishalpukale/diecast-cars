const { migrate } = require('drizzle-orm/node-postgres/migrator');
const path = require('path');
const { db, pool } = require('../config/database');

async function main() {
  console.log('Migration started...');
  const folder = path.join(__dirname, 'migrations');
  await migrate(db, { migrationsFolder: folder });
  console.log('Migration completed!');
  await pool.end();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('Migration failed!', err);
  try {
    await pool.end();
  } catch (_) {}
  process.exit(1);
});
