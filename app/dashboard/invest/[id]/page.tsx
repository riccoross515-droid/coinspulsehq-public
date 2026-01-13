import { InvestmentDetailsClient } from "@/app/components/dashboard/InvestmentDetailsClient";

// Removed force-dynamic - React Query handles freshness
// export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <InvestmentDetailsClient id={id} />;
}
