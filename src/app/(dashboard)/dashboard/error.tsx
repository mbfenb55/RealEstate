'use client';

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-xl font-semibold text-rose-600">Bir hata oluştu</h2>
      <p className="max-w-md text-sm text-slate-500">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-primary px-5 py-3 text-sm font-medium text-white transition hover:bg-primary-dark"
      >
        Tekrar Dene
      </button>
    </div>
  );
}
