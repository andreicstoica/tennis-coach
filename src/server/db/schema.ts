// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { pgTable, serial, varchar, text, integer, timestamp, uuid } from 'drizzle-orm/pg-core';

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */

export const users = pgTable('users', {
  id: uuid('uuid1').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  focusArea: varchar('focus_area', { length: 50 }).notNull(),
  plan: text('plan').notNull(),      // JSON or markdown of warmup/drill/game
  createdAt: timestamp('created_at').defaultNow(),
});

export const reflections = pgTable('reflections', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id').references(() => sessions.id),
  rating: integer('rating'),         // 1–5
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});
