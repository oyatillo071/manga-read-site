"use client"

import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/components/language-provider"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"

import { useEffect, useState } from "react"
import { useStore } from "@/lib/store"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const { apiKey, setApiKey } = useStore()

  useEffect(() => {
    // Set the default API key if none exists
    if (!apiKey) {
      setApiKey("personal-client-07c79c4f-d8da-4d98-8a23-8e5031297b5e-fb70a7d1")
    }
    // We don't need to show the API key modal anymore since we're using a default key
  }, [apiKey, setApiKey])

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`min-h-screen bg-background antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <LanguageProvider>
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <div className="flex-1">{children}</div>
              <Footer />
            </div>
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
