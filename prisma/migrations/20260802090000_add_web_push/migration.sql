CREATE TYPE "NotificationDeliveryStatus" AS ENUM ('PENDING', 'CLAIMED', 'SENT', 'FAILED');

CREATE TABLE "PushSubscription" (
    "id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NotificationDelivery" (
    "id" TEXT NOT NULL,
    "scheduled_for" TIMESTAMP(3) NOT NULL,
    "status" "NotificationDeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "available_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimed_at" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "task_id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    CONSTRAINT "NotificationDelivery_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");
CREATE INDEX "PushSubscription_user_id_idx" ON "PushSubscription"("user_id");
CREATE UNIQUE INDEX "NotificationDelivery_task_id_subscription_id_scheduled_for_key" ON "NotificationDelivery"("task_id", "subscription_id", "scheduled_for");
CREATE INDEX "NotificationDelivery_status_available_at_scheduled_for_idx" ON "NotificationDelivery"("status", "available_at", "scheduled_for");
CREATE INDEX "NotificationDelivery_subscription_id_idx" ON "NotificationDelivery"("subscription_id");
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NotificationDelivery" ADD CONSTRAINT "NotificationDelivery_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "AcademicTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NotificationDelivery" ADD CONSTRAINT "NotificationDelivery_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "PushSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
