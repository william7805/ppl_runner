import { integer, pgEnum, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'

export const activityType = pgEnum('activity_type', ['run', 'strength'])

export const activities = pgTable('activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: activityType('type').notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
  durationSeconds: integer('duration_seconds').notNull(),
  distanceMeters: integer('distance_meters'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export type Activity = typeof activities.$inferSelect
export type NewActivity = typeof activities.$inferInsert
