"use client";

import { useCallback, useEffect, useState } from "react";
import type { FeatureCollection } from "geojson";
import { useDropzone } from "react-dropzone";
import { AlertTriangle, FileJson2, Loader2, UploadCloud } from "lucide-react";

import toGeoJSON from "togeojson";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type FileUploadProps = {
  onDataLoaded: (geojsonData: FeatureCollection, fileName?: string) => void;
  initialFileName?: string;
  initialFeatureCount?: number;
};

function isFeatureCollection(value: unknown): value is FeatureCollection {
  return (
    typeof value === "object" &&
    value !== null &&
    "features" in value &&
    Array.isArray((value as { features?: unknown }).features)
  );
}

async function parseFile(file: File): Promise<FeatureCollection> {
  const fileName = file.name.toLocaleLowerCase("tr-TR");
  const content = await file.text();

  if (fileName.endsWith(".kml")) {
    const xmlDocument = new DOMParser().parseFromString(content, "application/xml");
    const parseError = xmlDocument.getElementsByTagName("parsererror")[0];

    if (parseError) {
      throw new Error("KML dosyası okunamadı.");
    }

    return toGeoJSON.kml(xmlDocument) as FeatureCollection;
  }

  const parsed = JSON.parse(content) as unknown;

  if (!isFeatureCollection(parsed)) {
    throw new Error("Dosya GeoJSON FeatureCollection yapısında olmalı.");
  }

  return parsed;
}

export function FileUpload({ onDataLoaded, initialFileName, initialFeatureCount }: FileUploadProps) {
  const [fileName, setFileName] = useState(initialFileName ?? "");
  const [featureCount, setFeatureCount] = useState(initialFeatureCount ?? 0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialFileName) {
      setFileName(initialFileName);
    }
  }, [initialFileName]);

  useEffect(() => {
    if (typeof initialFeatureCount === "number") {
      setFeatureCount(initialFeatureCount);
    }
  }, [initialFeatureCount]);

  const handleFile = useCallback(
    async (file: File) => {
      setIsLoading(true);
      setError(null);

      try {
        const geojsonData = await parseFile(file);
        setFileName(file.name);
        setFeatureCount(geojsonData.features.length);
        onDataLoaded(geojsonData, file.name);
      } catch (parseError) {
        setError(parseError instanceof Error ? parseError.message : "Dosya işlenemedi.");
        setFileName("");
        setFeatureCount(0);
      } finally {
        setIsLoading(false);
      }
    },
    [onDataLoaded]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        void handleFile(file);
      }
    },
    [handleFile]
  );

  const onDropRejected = useCallback(() => {
    setIsLoading(false);
    setError("Lütfen .geojson, .json veya .kml dosyası yükleyin.");
    setFileName("");
    setFeatureCount(0);
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    onDropRejected,
    multiple: false,
    noClick: true,
    noKeyboard: true,
    accept: {
      "application/json": [".json", ".geojson"],
      "application/geo+json": [".geojson"],
      "application/vnd.google-earth.kml+xml": [".kml"],
      "text/xml": [".kml"],
      "application/xml": [".kml"]
    }
  });

  return (
    <Card
      {...getRootProps()}
      className={cn(
        "cursor-pointer rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-5 shadow-none transition-all duration-300 hover:border-primary hover:bg-primary/5",
        isDragActive && "border-primary bg-primary/10"
      )}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold text-slate-900">GeoJSON / KML dosyası yükle</h3>
          </div>
          <p className="text-sm leading-6 text-slate-500">
            .geojson, .json veya .kml dosyanızı sürükleyip bırakın. Yüklenen parseller harita üzerinde doğrudan
            görselleştirilecek.
          </p>
        </div>

        <Button type="button" variant="outline" onClick={open} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Yükleniyor
            </>
          ) : (
            "Dosya Seç"
          )}
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-slate-600">
          <FileJson2 className="h-4 w-4 text-primary" />
          {fileName || "Henüz dosya yüklenmedi"}
        </span>
        <span className="rounded-full bg-white px-3 py-1 text-slate-600">
          {featureCount > 0 ? `${featureCount} parsel yüklendi` : "Parsel sayısı bekleniyor"}
        </span>
      </div>

      {error ? (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
          <p>{error}</p>
        </div>
      ) : null}

      {isDragActive ? (
        <p className="mt-4 text-sm font-medium text-primary">Dosyayı bırakın, hemen içeri aktaralım.</p>
      ) : null}
    </Card>
  );
}
