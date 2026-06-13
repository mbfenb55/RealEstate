import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-white">
      <div className="absolute left-6 top-6">
        <Link href="/" className="text-sm text-slate-300 transition hover:text-white">
          Parselim
        </Link>
      </div>
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        {children}
      </div>
    </div>
  );
}
