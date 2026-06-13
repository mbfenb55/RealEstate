import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate, sampleInvoices } from "@/lib/utils";

export default function InvoicesPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Faturalar</p>
        <h1 className="text-3xl font-semibold text-slate-900">Ödeme ve fatura geçmişiniz</h1>
      </div>

      <Card className="rounded-[2rem] border-slate-200 bg-white">
        <CardHeader>
          <CardTitle>Fatura listesi</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ödeme ID</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">Tutar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.paymentId ?? invoice.id}</TableCell>
                  <TableCell>{formatDate(invoice.issuedAt)}</TableCell>
                  <TableCell>{invoice.status}</TableCell>
                  <TableCell className="text-right">{formatCurrency(invoice.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
