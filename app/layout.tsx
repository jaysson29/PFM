import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Personal Finance Management App",
  description: "One stop solution to manage your personal finances.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning={true}>
        <body className={`${inter.className}`}>
          {/* header */}
          <Header />

          <main className="min-h-screen">{children}</main>

          <Toaster richColors />
          {/* header */}
          <footer className="bg-blue-50 py-12">
            <div className="container mx-auto px-4 text-center text-gray-600">
              <p>Made by Jason Bishop</p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
