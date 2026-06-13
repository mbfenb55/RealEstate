import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">404</p>
      <h1 className="mt-4 text-4xl font-semibold text-slate-900">Sayfa bulunamadı</h1>
      <p className="mt-3 max-w-md text-sm text-slate-500">
        Aradığınız sayfa taşınmış, silinmiş ya da hiç var olmamış olabilir.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-primary px-5 py-3 text-sm font-medium text-white transition hover:bg-primary-dark"
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}
