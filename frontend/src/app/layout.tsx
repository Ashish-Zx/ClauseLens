import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClauseLens — Document Intelligence & Contract Analysis",
  description:
    "Production-grade layout-aware contract intelligence powered by Docling, Hybrid RRF, Cross-Encoder Reranking, and Ragas automated evaluation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[#FAFAFA] text-zinc-900 flex flex-col antialiased selection:bg-zinc-900 selection:text-white"
      >
        {children}
      </body>
    </html>
  );
}
