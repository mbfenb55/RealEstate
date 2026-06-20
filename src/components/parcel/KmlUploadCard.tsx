"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { AlertTriangle, BrainCircuit, FileUp, Loader2, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type KmlUploadCardProps = {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  isAnalyzing: boolean;
  fileName?: string | null;
  error?: string | null;
};

export function KmlUploadCard({
  onUpload,
  isUploading,
  isAnalyzing,
  fileName,
  error
}: KmlUploadCardProps) {
  const [localError, setLocalError] = useState<string | null>(null);

  const handleDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      if (!file) {
        return;
      }

      setLocalError(null);
      await onUpload(file);
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    multiple: false,
    noClick: true,
    noKeyboard: true,
    accept: {
      "application/vnd.google-earth.kml+xml": [".kml"],
      "application/xml": [".kml"],
      "text/xml": [".kml"]
    },
    onDrop: (acceptedFiles) => {
      void handleDrop(acceptedFiles);
    },
    onDropRejected: () => {
      setLocalError("Lutfen sadece .kml uzantili bir dosya yukleyin.");
    }
  });

  const visibleError = error ?? localError;

  return (
    <Card
      {...getRootProps()}
      className={cn(
        "rounded-[2rem] border-slate-200 bg-white transition-all duration-300",
        isDragActive && "border-primary shadow-lg shadow-primary/10"
      )}
    >
      <CardHeader className="border-b border-slate-100">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">KML Upload</p>
            <CardTitle className="text-2xl">Parsel KML dosyanizi yukleyin</CardTitle>
            <p className="max-w-3xl text-sm leading-6 text-slate-500">
              Sistem KML dosyasini GeoJSON&apos;a cevirir, metrikleri hesaplar ve ardindan emlak
              pazarlama iceriklerini otomatik hazirlar.
            </p>
          </div>

          <Button type="button" variant="outline" onClick={open} disabled={isUploading || isAnalyzing}>
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Yukleniyor
              </>
            ) : (
              <>
                <UploadCloud className="h-4 w-4" />
                Dosya Sec
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 p-6">
        <input {...getInputProps()} />

        <div
          className={cn(
            "rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-center transition-all duration-300",
            isDragActive && "border-primary bg-primary/5"
          )}
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FileUp className="h-7 w-7" />
          </div>
          <p className="mt-4 text-base font-semibold text-slate-900">
            {isDragActive ? "KML dosyasini birakin" : "Dosyayi surukleyip birakin"}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Sadece polygon iceren `.kml` dosyalari desteklenir.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-[1.5rem] bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Dosya</p>
            <p className="mt-2 truncate text-sm font-medium text-slate-900">
              {fileName || "Henüz yukleme yapilmadi"}
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Durum</p>
            <p className="mt-2 text-sm font-medium text-slate-900">
              {isUploading ? "KML cozuluyor" : isAnalyzing ? "AI analizi uretiliyor" : "Hazir"}
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Sonraki Adim</p>
            <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-900">
              <BrainCircuit className="h-4 w-4 text-primary" />
              Metrik, harita ve pazarlama ciktilari
            </p>
          </div>
        </div>

        {visibleError ? (
          <div className="flex items-start gap-3 rounded-[1.5rem] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
            <p>{visibleError}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
