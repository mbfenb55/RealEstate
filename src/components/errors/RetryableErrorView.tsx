"use client";

import { useEffect, useMemo, useState } from "react";

type RetryableErrorViewProps = {
  error: Error;
  reset: () => void;
  title: string;
  fullScreen?: boolean;
};

const CHUNK_ERROR_RELOAD_KEY = "parselim:chunk-error-reload";

function isChunkLoadError(error: Error) {
  const message = error.message.toLowerCase();

  return (
    message.includes("loading chunk") ||
    message.includes("chunkloaderror") ||
    message.includes("failed to fetch dynamically imported module") ||
    message.includes("dynamically imported module")
  );
}

export function RetryableErrorView({
  error,
  reset,
  title,
  fullScreen = false
}: RetryableErrorViewProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const chunkError = useMemo(() => isChunkLoadError(error), [error]);

  useEffect(() => {
    if (!chunkError || typeof window === "undefined") {
      return;
    }

    const alreadyReloaded = window.sessionStorage.getItem(CHUNK_ERROR_RELOAD_KEY) === "1";

    if (alreadyReloaded) {
      window.sessionStorage.removeItem(CHUNK_ERROR_RELOAD_KEY);
      return;
    }

    window.sessionStorage.setItem(CHUNK_ERROR_RELOAD_KEY, "1");
    setIsRefreshing(true);

    const timeoutId = window.setTimeout(() => {
      window.location.reload();
    }, 1200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [chunkError]);

  useEffect(() => {
    if (typeof window === "undefined" || chunkError) {
      return;
    }

    window.sessionStorage.removeItem(CHUNK_ERROR_RELOAD_KEY);
  }, [chunkError]);

  const description = isRefreshing
    ? "Uygulamanin yeni surumu yukleniyor. Sayfa otomatik olarak yenileniyor."
    : error.message;

  const containerClassName = fullScreen
    ? "flex min-h-screen items-center justify-center bg-slate-50 px-4"
    : "flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center";

  const cardClassName = fullScreen
    ? "max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm"
    : "";

  const content = (
    <div className={cardClassName}>
      <h2 className={fullScreen ? "text-2xl font-semibold text-slate-900" : "text-xl font-semibold text-rose-600"}>{title}</h2>
      <p className="mt-3 max-w-md text-sm text-slate-500">{description}</p>
      <button
        type="button"
        onClick={() => {
          if (chunkError) {
            window.location.reload();
            return;
          }

          reset();
        }}
        className="mt-6 rounded-full bg-primary px-5 py-3 text-sm font-medium text-white transition hover:bg-primary-dark"
      >
        {isRefreshing ? "Sayfa yenileniyor..." : chunkError ? "Sayfayi Yenile" : "Tekrar Dene"}
      </button>
    </div>
  );

  if (fullScreen) {
    return (
      <html lang="tr">
        <body className={containerClassName}>{content}</body>
      </html>
    );
  }

  return <div className={containerClassName}>{content}</div>;
}
