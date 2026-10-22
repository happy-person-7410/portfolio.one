import { runMigrationsAndSeed } from '../src/db/migrate.ts';

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('❌ Error: DATABASE_URL is not set.');
  console.log('👉 Please set DATABASE_URL in your environment or .env file.');
  console.log('   Example: DATABASE_URL=postgresql://user:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require');
  process.exit(1);
}

console.log('🚀 Running safe idempotent migrations on Neon PostgreSQL...');

runMigrationsAndSeed(
  dbUrl,
  process.env.ADMIN_DEFAULT_EMAIL || 'happyperson7410@gmail.com',
  process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@HappyPerson2026'
)
  .then((res) => {
    console.log('✅ Migrations & seed completed successfully!');
    res.log.forEach((l) => console.log('   ✓', l));
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });
