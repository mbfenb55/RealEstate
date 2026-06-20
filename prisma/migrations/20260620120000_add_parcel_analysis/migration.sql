-- CreateTable
CREATE TABLE "parcel_analyses" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "shoot_id" UUID,
    "original_file_name" TEXT NOT NULL,
    "geojson" JSONB NOT NULL,
    "kml_text" TEXT,
    "area_m2" DOUBLE PRECISION NOT NULL,
    "perimeter_m" DOUBLE PRECISION NOT NULL,
    "centroid_lat" DOUBLE PRECISION NOT NULL,
    "centroid_lng" DOUBLE PRECISION NOT NULL,
    "bbox" JSONB NOT NULL,
    "corner_points" JSONB NOT NULL,
    "geometry_type" TEXT NOT NULL,
    "approximate_frontage_m" DOUBLE PRECISION NOT NULL,
    "ada_no" TEXT,
    "parsel_no" TEXT,
    "il" TEXT,
    "ilce" TEXT,
    "marketing_summary" TEXT,
    "investment_score" INTEGER,
    "investment_analysis" JSONB,
    "social_captions" JSONB,
    "visual_prompts" JSONB,
    "report_html" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parcel_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "parcel_analyses_user_id_created_at_idx" ON "parcel_analyses"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "parcel_analyses_shoot_id_idx" ON "parcel_analyses"("shoot_id");

-- AddForeignKey
ALTER TABLE "parcel_analyses" ADD CONSTRAINT "parcel_analyses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parcel_analyses" ADD CONSTRAINT "parcel_analyses_shoot_id_fkey" FOREIGN KEY ("shoot_id") REFERENCES "shoots"("id") ON DELETE SET NULL ON UPDATE CASCADE;
