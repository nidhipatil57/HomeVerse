import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HomeVerse — The Operating System for Modern Communities",
  description:
    "An intelligent Community Operating System that digitizes every aspect of residential communities — from gated societies and apartments to college hostels and PGs. AI-powered management, predictive analytics, and seamless digital experiences.",
  keywords: [
    "society management",
    "hostel management",
    "community OS",
    "smart apartments",
    "resident portal",
    "AI community",
    "HomeVerse",
  ],
  authors: [{ name: "HomeVerse" }],
  openGraph: {
    title: "HomeVerse — Community Operating System",
    description: "The intelligent OS for modern residential communities",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jakarta.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <TooltipProvider delay={200}>
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
