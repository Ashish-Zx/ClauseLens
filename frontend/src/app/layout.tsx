import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClauseLens | Enterprise Document Intelligence & Contract Analysis",
  description:
    "Production-grade layout-aware contract analysis powered by Docling, Hybrid RRF, Cross-Encoder Reranking, and Ragas automated evaluation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}

