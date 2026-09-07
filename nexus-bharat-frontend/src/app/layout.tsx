import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/common/QueryProvider";
import { AppLayout } from "@/components/layout/AppLayout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NEXUS-Bharat | Criminal Network Analysis Platform",
  description: "AI-Powered Criminal Knowledge Graph, Cross-Case Fusion & Threat Intelligence Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} light h-full`}>
      <body className="min-h-full bg-[#F8FAFC] text-[#0F172A] font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
        <QueryProvider>
          <AppLayout>{children}</AppLayout>
        </QueryProvider>
      </body>
    </html>
  );
}
