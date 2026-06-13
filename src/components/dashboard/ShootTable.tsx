import Link from "next/link";

import { getShootTypeLabel, getStatusBadgeVariant, getStatusLabel } from "@/lib/dashboard";
import { formatDate } from "@/lib/utils";
import type { ShootRecord } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function ShootTable({ shoots }: { shoots: ShootRecord[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Konum</TableHead>
          <TableHead>Tür</TableHead>
          <TableHead>Durum</TableHead>
          <TableHead>Tarih</TableHead>
          <TableHead className="text-right">Aksiyonlar</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {shoots.map((shoot) => (
          <TableRow key={shoot.id}>
            <TableCell>
              <div>
                <p className="font-medium text-slate-900">{shoot.location}</p>
                <p className="text-xs text-slate-500">
                  Ada {shoot.adaNo ?? "-"} / Parsel {shoot.parselNo ?? "-"}
                </p>
              </div>
            </TableCell>
            <TableCell>{getShootTypeLabel(shoot.type)}</TableCell>
            <TableCell>
              <Badge variant={getStatusBadgeVariant(shoot.status)}>{getStatusLabel(shoot.status)}</Badge>
            </TableCell>
            <TableCell>{formatDate(shoot.createdAt)}</TableCell>
            <TableCell className="text-right">
              <Link href={`/dashboard/cekimlerim/${shoot.id}`} className="text-sm font-semibold text-primary">
                Detay
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
