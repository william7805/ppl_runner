export * from './auth-schema'
import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import { user } from './auth-schema'
import { ACTIVITY_TYPES } from '@/lib/activity-types'

export const activityType = pgEnum('activity_type', ACTIVITY_TYPES)

export const activities = pgTable(
  'activities',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    type: activityType('type').notNull(),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
    durationSeconds: integer('duration_seconds').notNull(),
    distanceMeters: integer('distance_meters'),
    elevationGainMeters: integer('elevation_gain_meters'),
    avgHeartRate: integer('avg_heart_rate'),
    maxHeartRate: integer('max_heart_rate'),
    // Trace simplifiée, sans la zone de confidentialité (ADR 0014),
    // au format encoded polyline. Null : pas de trace (course trop courte,
    // ou importée avant l'ajout de la carte)
    track: text('track'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // Empêche d'importer deux fois la même séance
    uniqueIndex('activities_user_started_at_idx').on(
      table.userId,
      table.startedAt
    ),
  ]
)

export type Activity = typeof activities.$inferSelect
export type NewActivity = typeof activities.$inferInsert
