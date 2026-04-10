import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ines - Make a Wish | Donation goals",
  description: "Donation goals du stream caritatif Make-A-Wish d'Ines",
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
