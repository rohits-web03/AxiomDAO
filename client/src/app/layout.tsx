import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/mode-provider"
import { headers } from 'next/headers'
import getConfig from "next/config";
import { cookieToInitialState } from 'wagmi'
import Provider from "../components/Providers";
import ConnectionProviderLayout from "@/components/ConnectionProviderLayout"
import { Toaster } from "@/components/ui/toaster";
import { type ReactNode } from 'react'
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AxiomDAO",
  description: "AI-driven Governance System",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const initialState = cookieToInitialState(
    getConfig(),
    (await headers()).get('cookie')
  )
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster />
          <Provider initialState={initialState}>
            <ConnectionProviderLayout>
              {children}
            </ConnectionProviderLayout>
          </Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
