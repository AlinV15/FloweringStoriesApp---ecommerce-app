// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "./components/ClientLayout"; // actualizează dacă e în altă parte
import { Playfair_Display, Nunito } from "next/font/google";
import { Toaster } from "react-hot-toast";

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "600", "700"]
});

const nunito = Nunito({
  variable: "--font-body",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "Flowering Stories",
  description: "Books, flowers & stationery for poetic souls.",
  icons: {
    icon: "/flowering_stories_logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} ${playfair.variable} antialiased bg-[#fdf8f6] text-gray-900`}>
        <ClientLayout>
          {children}
          <Toaster position="top-right" reverseOrder={false} />
        </ClientLayout>
      </body>
    </html>
  );
}
