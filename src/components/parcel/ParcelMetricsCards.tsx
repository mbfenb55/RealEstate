import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ParcelAnalysisRecord } from "@/types/parcel";

function metricValue(value: number, digits = 2) {
  return value.toLocaleString("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits
  });
}

export function ParcelMetricsCards({ analysis }: { analysis: ParcelAnalysisRecord }) {
  const metricItems = [
    {
      label: "Alan",
      value: `${metricValue(analysis.areaM2)} m²`,
      helper: `${metricValue(analysis.areaDonum, 3)} donum`
    },
    {
      label: "Cevre",
      value: `${metricValue(analysis.perimeterM)} m`,
      helper: "Turf ile hesaplandi"
    },
    {
      label: "Kose Sayisi",
      value: String(analysis.cornerPoints.length),
      helper: "Koordinat tablosuna aktarıldi"
    },
    {
      label: "Merkez",
      value: `${analysis.centroidLat.toFixed(6)}, ${analysis.centroidLng.toFixed(6)}`,
      helper: "Centroid koordinati"
    },
    {
      label: "Yaklasik Cephe",
      value: `${metricValue(analysis.approximateFrontageM)} m`,
      helper: "En uzun kenar baz alindi"
    },
    {
      label: "Ada / Parsel",
      value: [analysis.adaNo ?? "-", analysis.parselNo ?? "-"].join(" / "),
      helper: [analysis.ilce, analysis.il].filter(Boolean).join(", ") || "KML properties"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metricItems.map((item) => (
          <Card key={item.label} className="rounded-[1.75rem] border-slate-200 bg-white">
            <CardContent className="p-5">
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-3 text-xl font-semibold text-slate-900">{item.value}</p>
              <p className="mt-2 text-sm text-slate-500">{item.helper}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-[1.75rem] border-slate-200 bg-white">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Pazarlama Ozeti</CardTitle>
            <p className="mt-1 text-sm text-slate-500">KML yuklemesi sonrasinda hazirlanan ilk cikarimlar</p>
          </div>
          {typeof analysis.investmentScore === "number" ? (
            <Badge variant="success" className="px-3 py-1.5 text-sm font-semibold">
              Yatirim Puani {analysis.investmentScore}/100
            </Badge>
          ) : null}
        </CardHeader>
        <CardContent>
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-600">
            {analysis.marketingSummary ??
              "KML yüklendi. Metrikler hazir. AI pazarlama analizi tamamlandiginda burada detayli ozet gorunecek."}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
