export default function CekimlerimLoading() {
  return (
    <div className="space-y-4 p-6">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="h-16 animate-pulse rounded-lg bg-slate-200/80" />
      ))}
    </div>
  );
}
