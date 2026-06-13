import { Card, CardContent } from "@/components/ui/card";

export function MetricCard({
  label,
  value,
  delta
}: {
  label: string;
  value: string;
  delta: string;
}) {
  return (
    <Card className="rounded-[2rem] border-slate-200 bg-white shadow-sm">
      <CardContent className="space-y-3 p-6">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-4xl font-semibold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500">{delta}</p>
      </CardContent>
    </Card>
  );
}
