import prisma from "@/lib/prisma";
import { InvestmentsClient } from "@/app/components/admin/InvestmentsClient";

export const dynamic = "force-dynamic";

export default async function AdminInvestmentsPage() {
  const investments = await prisma.investment.findMany({
    where: { status: "ACTIVE" },
    include: { user: true },
    orderBy: { startDate: "desc" },
  });

  return <InvestmentsClient investments={investments} />;
}
