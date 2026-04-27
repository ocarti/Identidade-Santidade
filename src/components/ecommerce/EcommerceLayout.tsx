import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MarqueeBanner } from "@/components/MarqueeBanner";
import type { ReactNode } from "react";

export function EcommerceLayout({ children, compact }: { children: ReactNode; compact?: boolean }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className={`${compact ? "pt-12" : "pt-24"} pb-16`}>{children}</main>
      <Footer />
      <MarqueeBanner />
    </div>
  );
}
