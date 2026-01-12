import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  );
}
