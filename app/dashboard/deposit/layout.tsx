import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Deposit Bitcoin | CoinsPulse",
  description: "Deposit Bitcoin to your CoinsPulse account",
};

export default function DepositLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {children}
    </div>
  );
}
