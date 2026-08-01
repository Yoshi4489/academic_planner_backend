CREATE TABLE "ImportOperation" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "response" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "user_id" TEXT NOT NULL,
  CONSTRAINT "ImportOperation_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ImportOperation_user_id_key_key" ON "ImportOperation"("user_id", "key");
CREATE INDEX "ImportOperation_created_at_idx" ON "ImportOperation"("created_at");
ALTER TABLE "ImportOperation" ADD CONSTRAINT "ImportOperation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
