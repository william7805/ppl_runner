CREATE TYPE "public"."activity_type" AS ENUM('run', 'strength');--> statement-breakpoint
CREATE TABLE "activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "activity_type" NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"duration_seconds" integer NOT NULL,
	"distance_meters" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
