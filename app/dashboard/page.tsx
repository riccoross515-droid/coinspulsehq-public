import { DashboardClient } from "@/app/components/dashboard/DashboardClient";

export default function DashboardPage() {
  const hour = new Date().getHours();
  const greeting = hour >= 5 && hour < 12 ? { text: "Good morning", emoji: "☀️" } : 
                  hour >= 12 && hour < 17 ? { text: "Good afternoon", emoji: "🌤️" } : 
                  { text: "Good evening", emoji: "🌙" };

  return (
    <DashboardClient
      userName="Trader" // DashboardClient will update this when data loads
      greeting={greeting}
    />
  );
}
