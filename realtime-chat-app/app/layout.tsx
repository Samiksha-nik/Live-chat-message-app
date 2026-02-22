import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import { Providers } from "@/app/providers";
import { Navbar } from "@/components/layout/navbar";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import "@/app/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Realtime Chat App",
  description: "Realtime chat application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={cn(
            inter.variable,
            "min-h-screen bg-background text-foreground antialiased"
          )}
        >
          <Providers>
            <Navbar />
            <main className="pb-10 pt-6">
              <Container className="space-y-6">{children}</Container>
            </main>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
