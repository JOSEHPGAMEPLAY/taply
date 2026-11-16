-- Crear tabla QrCode para almacenar códigos QR de páginas
CREATE TABLE "qr_codes" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "dataUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qr_codes_pkey" PRIMARY KEY ("id")
);

-- Índice único: un QR por página
CREATE UNIQUE INDEX "qr_codes_pageId_key" ON "qr_codes"("pageId");

-- Índice para consultas por pageId
CREATE INDEX "qr_codes_pageId_idx" ON "qr_codes"("pageId");

-- Foreign key: QrCode → Page (cascade delete)
ALTER TABLE "qr_codes" ADD CONSTRAINT "qr_codes_pageId_fkey" 
    FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE RESTRICT;
