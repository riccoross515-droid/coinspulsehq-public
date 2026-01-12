import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { TransactionsManager } from "@/app/components/admin/TransactionsManager";

export const dynamic = "force-dynamic";

interface AdminDashboardProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminDashboard({ searchParams }: AdminDashboardProps) {
  const params = await searchParams; // Await searchParams in Next.js 15+ if needed, or normal object in 14. 
  // Note: Future Next.js versions make searchParams async. Safe to await or treat as promise if typed so.
  // Actually, let's treat it as standard prop for now, but type definitions suggest Promise in newer versions.
  // We'll handle it defensively.
  
  const q = typeof params.q === 'string' ? params.q : undefined;
  const type = typeof params.type === 'string' && params.type !== 'ALL' ? params.type : undefined;
  const status = typeof params.status === 'string' && params.status !== 'ALL' ? params.status : undefined;

  const where: Prisma.TransactionWhereInput = {};
  
  if (type) where.type = type;
  if (status) where.status = status;
  
  if (q) {
    where.OR = [
      { txHash: { contains: q } }, // Case insensitive usually depends on DB collation
      { id: { contains: q } },
      { 
        user: { 
          email: { contains: q } 
        } 
      }
    ];
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Sanitize data for client components (Convert Decimals to Numbers)
  const sanitizedTransactions = transactions.map(tx => ({
    ...tx,
    amount: Number(tx.amount),
    user: tx.user ? {
      ...tx.user,
      balance: Number(tx.user.balance)
    } : null
  }));

  return <TransactionsManager transactions={sanitizedTransactions} />;
}
