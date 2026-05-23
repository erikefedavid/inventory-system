import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StockPilot - Inventory & Stock Management System for SMEs",
  description: "Real-time automated inventory tracking, low-stock alerts, supplier tracking, purchase orders, and detailed analytics reports for small and medium enterprises.",
  keywords: "inventory system, stock management, SME, stock pilot, real-time analytics, purchase order tracking, audit logs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-50" suppressHydrationWarning>
      <body className="h-full font-sans antialiased text-text-primary selection:bg-accent-blue/10 selection:text-accent-blue">
        {children}
      </body>
    </html>
  );
}
