import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

const runMigrations = async () => {
  const connectionString = process.env.DATABASE_URL!
  
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined')
  }
  
  console.log('🔄 Connecting to database...')
  
  // For migrations, we use a connection pool with max 1 connection
  const migrationClient = postgres(connectionString, { max: 1 })
  const db = drizzle(migrationClient)
  
  console.log('🚀 Running migrations...')
  
  await migrate(db, { migrationsFolder: 'drizzle' })
  
  console.log('✅ Migrations completed successfully!')
  
  await migrationClient.end()
}

runMigrations().catch((err) => {
  console.error('❌ Migration failed:', err)
  process.exit(1)
})
