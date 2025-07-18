import type { Metadata } from "next";
import { Poppins, JetBrains_Mono } from "next/font/google";
import Image from "next/image"; 
import "./globals.css";

// Cấu hình font chữ chính (Poppins)
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

// Cấu hình font chữ cho code (JetBrains Mono)
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LLT Shop",
   description: "LLT Shop - Nơi mua sắm đáng tin cậy",
  icons: {
    icon: "/favicon.png", // hoặc .ico / .png nếu bạn có
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased min-h-screen bg-white">
        {children}
      </body>
    </html>
  );
}