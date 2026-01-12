import prisma from "@/lib/prisma";
import { AssetsManager } from "@/app/components/admin/AssetsManager";

export const dynamic = "force-dynamic";

export default async function AdminAssetsPage() {
  const assets = await prisma.cryptoAsset.findMany({
    include: { networks: true },
    orderBy: { symbol: "asc" },
  });

  return <AssetsManager initialAssets={assets} />;
}
