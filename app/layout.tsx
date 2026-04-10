import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InesPNJ · Donation goals",
  description: "Donation goals du stream caritatif Make-A-Wish d'InesPNJ",
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
    <html lang="fr">
      <body className="stars font-body antialiased">{children}</body>
    </html>
  );
}
