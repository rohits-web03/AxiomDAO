import type { Metadata } from "next";
import { ThemeProvider } from "@/components/mode-provider"
import { Geist, Geist_Mono } from "next/font/google";
import Provider from "../components/Providers";
import { type ReactNode } from 'react'
import { headers } from 'next/headers'
import { cookieToInitialState } from 'wagmi'
import getConfig from "next/config";
import "./globals.css";
import ConnectionProviderLayout from "@/components/ConnectionProviderLayout";

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
