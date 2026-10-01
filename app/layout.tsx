import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Bricolage_Grotesque, Pacifico } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

const heading = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-heading",
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
  description: "InesPNJ · Streameuse Twitch · #freeines",
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
    <html
      lang="fr"
      className={`${GeistSans.variable} ${heading.variable} ${display.variable}`}
    >
      <body className="stars font-body antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
