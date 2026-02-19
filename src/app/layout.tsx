import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PharmaGuard - Pharmacogenomic Risk Prediction",
  description: "AI-powered pharmacogenomic analysis with CPIC-aligned recommendations for precision medicine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Spectral:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased relative">
        <div className="pointer-events-none fixed inset-0 -z-10 premium-backdrop">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>
        {children}
      </body>
    </html>
  );
}
