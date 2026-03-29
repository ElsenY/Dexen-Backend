-- CreateTable
CREATE TABLE "user_update_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "before_update" JSONB NOT NULL,
    "after_update" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_update_logs_pkey" PRIMARY KEY ("id")
);
