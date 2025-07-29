import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from '@/lib/theme-context'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: "AI Fitness Assistant - Your Personal Fitness Coach",
  description: "Get personalized workout plans, nutrition advice, and expert guidance with our AI-powered fitness assistant. Available 24/7 to help you achieve your fitness goals.",
  keywords: "AI fitness, workout plans, nutrition advice, personal trainer, fitness coach",
  authors: [{ name: "AI Fitness Assistant Team" }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-white dark:bg-dark-900 text-gray-900 dark:text-gray-100 antialiased">
        <ThemeProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}