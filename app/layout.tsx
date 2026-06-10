import type React from "react"
import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"
import "./globals.css"
import "../styles/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import HamburgerMenu from "@/components/HamburgerMenu"

const inter = Inter({ subsets: ["latin"], display: "swap" })
const poppins = Poppins({ weight: ["700", "900"], subsets: ["latin"], display: "swap", variable: "--font-poppins" })

export const metadata: Metadata = {
  title: "Ishaan Dhiman - Personal Website",
  description: "Full Stack Developer passionate about creating beautiful, functional web experiences",
  generator: 'v0.dev',
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload the GLB so the browser fetches it in parallel with JS */}
        <link rel="preload" href="/2024_lbsilhouette_works_murcielago_gt_evo.glb" as="fetch" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <HamburgerMenu />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

