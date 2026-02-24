import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined')
}

const connectionString = process.env.DATABASE_URL

// For migrations
export const migrationClient = postgres(connectionString, { max: 1 })

// For queries - optimized connection pool
const queryClient = postgres(connectionString, {
  max: 10, // Max 10 connections
  idle_timeout: 20, // Close idle connections after 20s
  connect_timeout: 10, // 10s timeout for new connections
  prepare: false // Disable prepared statements for better performance with serverless
})

export const db = drizzle(queryClient, { schema })
