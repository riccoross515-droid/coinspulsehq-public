import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";
import { WalletContent } from "../../components/dashboard/WalletContent";

// Removed force-dynamic - React Query handles freshness
// export const dynamic = "force-dynamic";

async function getWalletData() {
  const user = await getCurrentUser();
  const userData = user ? await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      investments: true,
      transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10
      }
    }
  }) : null;
  
  const assets = await prisma.cryptoAsset.findMany({
    include: {
      networks: true
    }
  });

  return {
    user: userData ? {
      ...userData,
      balance: Number(userData.balance),
      investments: userData.investments.map(inv => ({
        ...inv,
        amount: Number(inv.amount),
        profit: Number(inv.profit)
      })),
      transactions: userData.transactions.map(tx => ({
        ...tx,
        amount: Number(tx.amount)
      }))
    } : null,
    transactions: userData?.transactions.map(tx => ({
      ...tx,
      amount: Number(tx.amount)
    })) || [],
    assets
  };
}

export default async function WalletPage() {
  const { user, transactions, assets } = await getWalletData();

  if (!user) return null;

  const initialData = {
    balance: Number(user.balance),
    transactions: transactions,
    assets: assets,
    investments: user.investments
  };

  return (        
    <WalletContent initialData={initialData} />
  );
}
