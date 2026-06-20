"use client";

import toast from "react-hot-toast";
import { ClipboardCopy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ParcelCoordinatePoint } from "@/types/parcel";

function formatCoordinate(value: number) {
  return value.toLocaleString("tr-TR", {
    minimumFractionDigits: 6,
    maximumFractionDigits: 6
  });
}

export function ParcelCoordinateTable({ points }: { points: ParcelCoordinatePoint[] }) {
  const copyPoint = async (point: ParcelCoordinatePoint) => {
    await navigator.clipboard.writeText(`${point.lat}, ${point.lng}`);
    toast.success(`Nokta ${point.pointNo} panoya kopyalandi.`);
  };

  const copyAll = async () => {
    const content = points.map((point) => `${point.pointNo}\t${point.lat}\t${point.lng}`).join("\n");
    await navigator.clipboard.writeText(content);
    toast.success("Tum koordinatlar panoya kopyalandi.");
  };

  return (
    <Card className="rounded-[2rem] border-slate-200 bg-white">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Koordinat Tablosu</CardTitle>
          <p className="mt-1 text-sm text-slate-500">Parselin kose noktalarini tek tek kopyalayabilirsiniz.</p>
        </div>
        <Button type="button" variant="outline" onClick={() => void copyAll()}>
          <ClipboardCopy className="h-4 w-4" />
          Tumunu Kopyala
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nokta No</TableHead>
              <TableHead>Enlem</TableHead>
              <TableHead>Boylam</TableHead>
              <TableHead className="text-right">Islem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {points.map((point) => (
              <TableRow key={point.pointNo}>
                <TableCell className="font-medium text-slate-900">{point.pointNo}</TableCell>
                <TableCell>{formatCoordinate(point.lat)}</TableCell>
                <TableCell>{formatCoordinate(point.lng)}</TableCell>
                <TableCell className="text-right">
                  <Button type="button" size="sm" variant="outline" onClick={() => void copyPoint(point)}>
                    Kopyala
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
