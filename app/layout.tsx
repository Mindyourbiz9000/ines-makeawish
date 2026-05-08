import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Inter, Pacifico } from "next/font/google";
import "./globals.css";

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const display = Pacifico({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "InesPNJ",
  description: "InesPNJ · Stream caritatif Make-A-Wish",
  icons: {
    icon: "/inespnjv2.png",
    apple: "/inespnjv2.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${body.variable} ${display.variable}`}>
      <body className="stars font-body antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
