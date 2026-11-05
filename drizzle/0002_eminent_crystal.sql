ALTER TABLE "activities" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "elevation_gain_meters" integer;--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "avg_heart_rate" integer;--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "max_heart_rate" integer;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "activities_user_started_at_idx" ON "activities" USING btree ("user_id","started_at");