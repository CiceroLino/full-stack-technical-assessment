CREATE TYPE "public"."task_status" AS ENUM('pending', 'in_progress', 'completed');--> statement-breakpoint
CREATE TABLE "t3_tasks_account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" varchar(255) NOT NULL,
	"providerId" varchar(255) NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp,
	"refreshTokenExpiresAt" timestamp,
	"scope" text,
	"password" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "t3_tasks_session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"token" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"ipAddress" varchar(255),
	"userAgent" text,
	"userId" text NOT NULL,
	CONSTRAINT "t3_tasks_session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "t3_tasks_task" (
	"id" text PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" "task_status" DEFAULT 'pending' NOT NULL,
	"userId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "t3_tasks_user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "t3_tasks_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "t3_tasks_verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" varchar(255) NOT NULL,
	"value" varchar(255) NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "t3_tasks_account" ADD CONSTRAINT "t3_tasks_account_userId_t3_tasks_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."t3_tasks_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "t3_tasks_session" ADD CONSTRAINT "t3_tasks_session_userId_t3_tasks_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."t3_tasks_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "t3_tasks_task" ADD CONSTRAINT "t3_tasks_task_userId_t3_tasks_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."t3_tasks_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "t3_tasks_account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "t3_tasks_session" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "session_token_idx" ON "t3_tasks_session" USING btree ("token");--> statement-breakpoint
CREATE INDEX "task_user_id_idx" ON "t3_tasks_task" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "task_status_idx" ON "t3_tasks_task" USING btree ("status");--> statement-breakpoint
CREATE INDEX "task_created_at_idx" ON "t3_tasks_task" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "task_user_id_created_at_idx" ON "t3_tasks_task" USING btree ("userId","createdAt");