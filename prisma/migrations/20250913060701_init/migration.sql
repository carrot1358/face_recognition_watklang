-- CreateTable
CREATE TABLE "public"."access_events" (
    "id" SERIAL NOT NULL,
    "event_id" TEXT,
    "event_type" TEXT,
    "device_id" TEXT,
    "device_name" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "raw_data" JSONB,
    "person_id" TEXT,
    "person_name" TEXT,
    "card_number" TEXT,
    "door_id" TEXT,
    "door_name" TEXT,
    "access_result" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "access_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."access_images" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "filename" TEXT NOT NULL,
    "original_name" TEXT,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "minio_path" TEXT NOT NULL,
    "public_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "access_images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."access_images" ADD CONSTRAINT "access_images_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."access_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
