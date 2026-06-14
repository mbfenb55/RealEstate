import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Users, Video, Wallet, Clock3, CircleCheckBig, CircleAlert } from "lucide-react";

import { isAdmin } from "@/lib/admin";
import { getAdminOverviewData } from "@/lib/admin-overview";
import { getPrisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { syncAuthUser } from "@/lib/auth-user";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function resolvePrisma() {
  try {
    return getPrisma();
  } catch (error) {
    console.error("Admin panel Prisma client initialization failed:", error);
    return null;
  }
}

export default async function AdminPage() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/giris?redirect=/dashboard/admin");
  }

  const prisma = resolvePrisma();
  if (!prisma) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Veritabanı bağlantısı kurulamadı.
      </div>
    );
  }

  const profile = await syncAuthUser(user, prisma);
  if (!isAdmin(profile.email ?? user.email ?? "")) {
    redirect("/dashboard");
  }

  const overview = await getAdminOverviewData(prisma);

  const statusCards = [
    {
      label: "Hazırlanıyor",
      value: overview.stats.processingShoots,
      icon: <Clock3 className="h-5 w-5" />
    },
    {
      label: "Hazır",
      value: overview.stats.readyShoots,
      icon: <CircleCheckBig className="h-5 w-5" />
    },
    {
      label: "Hata",
      value: overview.stats.failedShoots,
      icon: <CircleAlert className="h-5 w-5" />
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge variant="success" className="inline-flex w-fit gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em]">
            <ShieldCheck className="h-4 w-4" />
            Admin Paneli
          </Badge>
          <h1 className="text-3xl font-semibold text-slate-900">Platform kontrol merkezi</h1>
          <p className="max-w-3xl text-sm leading-6 text-slate-500">
            Tüm kullanıcılar, çekimler ve gelirler tek ekranda. Canlı operasyonu buradan takip edebilirsiniz.
          </p>
        </div>

        <Link href="/dashboard" className="inline-flex">
          <Button variant="outline">Dashboard&apos;a Dön</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-[2rem] border-slate-200 bg-white">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-slate-500">Toplam kullanıcı</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{overview.stats.totalUsers}</p>
            </div>
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-slate-200 bg-white">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-slate-500">Toplam çekim</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{overview.stats.totalShoots}</p>
            </div>
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <Video className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-slate-200 bg-white">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-slate-500">Toplam gelir</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{formatCurrency(overview.stats.totalRevenue)}</p>
            </div>
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <Wallet className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-slate-200 bg-white">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-slate-500">Bekleyen çekim</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{overview.stats.processingShoots}</p>
            </div>
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <Video className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {statusCards.map((item) => (
          <Card key={item.label} className="rounded-[2rem] border-slate-200 bg-white">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
              </div>
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-600">{item.icon}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-[2rem] border-slate-200 bg-white">
        <CardHeader>
          <CardTitle>Son 10 çekim</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kullanıcı</TableHead>
                  <TableHead>Konum</TableHead>
                  <TableHead>Tür</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead className="text-right">Aksiyon</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overview.recentShoots.map((shoot) => (
                  <TableRow key={shoot.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">{shoot.ownerName}</p>
                        <p className="text-xs text-slate-500">{shoot.ownerEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>{shoot.location}</TableCell>
                    <TableCell>{shoot.type}</TableCell>
                    <TableCell>{shoot.status}</TableCell>
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
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[2rem] border-slate-200 bg-white">
        <CardHeader>
          <CardTitle>Kullanıcı listesi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kullanıcı</TableHead>
                  <TableHead>E-posta</TableHead>
                  <TableHead>Çekim sayısı</TableHead>
                  <TableHead>Kredi</TableHead>
                  <TableHead>Kayıt tarihi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overview.users.map((userItem) => (
                  <TableRow key={userItem.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">{userItem.fullName || userItem.companyName || "-"}</p>
                        <p className="text-xs text-slate-500">{userItem.companyName || "-"}</p>
                      </div>
                    </TableCell>
                    <TableCell>{userItem.email}</TableCell>
                    <TableCell>{userItem.shootCount}</TableCell>
                    <TableCell>{userItem.credits}</TableCell>
                    <TableCell>{formatDate(userItem.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
