'use client';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="tr">
      <body className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">Beklenmedik bir hata oluştu</h2>
          <p className="mt-3 text-sm text-slate-500">{error.message}</p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 rounded-full bg-primary px-5 py-3 text-sm font-medium text-white transition hover:bg-primary-dark"
          >
            Tekrar Dene
          </button>
        </div>
      </body>
    </html>
  );
}
