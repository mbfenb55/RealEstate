import type { PrismaClient } from "@prisma/client";

import { mapShootToRecord } from "@/lib/shoots";
import type { ShootRecord } from "@/types";

export type AdminOverviewShoot = ShootRecord & {
  ownerId: string;
  ownerEmail: string;
  ownerName: string;
  ownerCompanyName: string | null;
};

export type AdminOverviewUser = {
  id: string;
  email: string;
  fullName: string | null;
  companyName: string | null;
  credits: number;
  createdAt: string;
  shootCount: number;
};

export type AdminOverviewStats = {
  totalUsers: number;
  totalShoots: number;
  totalRevenue: number;
  processingShoots: number;
  readyShoots: number;
  failedShoots: number;
};

export type AdminOverviewData = {
  stats: AdminOverviewStats;
  recentShoots: AdminOverviewShoot[];
  allShoots: AdminOverviewShoot[];
  users: AdminOverviewUser[];
};

function toOwnerName(user: { fullName: string | null; companyName: string | null; email: string }) {
  return user.fullName || user.companyName || user.email;
}

function mapShootWithOwner(
  shoot: {
    userId: string;
    user: {
      email: string;
      fullName: string | null;
      companyName: string | null;
    };
  } & Parameters<typeof mapShootToRecord>[0]
): AdminOverviewShoot {
  const record = mapShootToRecord(shoot);

  return {
    ...record,
    ownerId: shoot.userId,
    ownerEmail: shoot.user.email,
    ownerName: toOwnerName(shoot.user),
    ownerCompanyName: shoot.user.companyName
  };
}

export async function getAdminOverviewData(prisma: PrismaClient): Promise<AdminOverviewData> {
  const [
    totalUsers,
    totalShoots,
    revenueAggregate,
    statusBreakdown,
    recentShoots,
    allShoots,
    users,
    shootCounts
  ] = await Promise.all([
    prisma.user.count(),
    prisma.shoot.count(),
    prisma.payment.aggregate({
      where: { status: "SUCCESS" },
      _sum: { amount: true }
    }),
    prisma.shoot.groupBy({
      by: ["status"],
      _count: { _all: true }
    }),
    prisma.shoot.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 10
    }),
    prisma.shoot.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" }
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" }
    }),
    prisma.shoot.groupBy({
      by: ["userId"],
      _count: { _all: true }
    })
  ]);

  const shootCountsByUserId = new Map(shootCounts.map((item) => [item.userId, item._count._all]));
  const statusCounts = statusBreakdown.reduce(
    (accumulator, item) => {
      accumulator[item.status] = item._count._all;
      return accumulator;
    },
    {
      PROCESSING: 0,
      READY: 0,
      FAILED: 0
    }
  );

  return {
    stats: {
      totalUsers,
      totalShoots,
      totalRevenue: Number(revenueAggregate._sum.amount ?? 0),
      processingShoots: statusCounts.PROCESSING,
      readyShoots: statusCounts.READY,
      failedShoots: statusCounts.FAILED
    },
    recentShoots: recentShoots.map(mapShootWithOwner),
    allShoots: allShoots.map(mapShootWithOwner),
    users: users.map((user) => ({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      companyName: user.companyName,
      credits: user.credits,
      createdAt: user.createdAt.toISOString(),
      shootCount: shootCountsByUserId.get(user.id) ?? 0
    }))
  };
}
