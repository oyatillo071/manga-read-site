"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Shuffle } from "lucide-react"
import { getRandomManga } from "@/lib/api"
import { useLanguage } from "@/components/language-provider"

export default function RandomMangaButton() {
  const router = useRouter()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)

  const handleRandomManga = async () => {
    setLoading(true)
    try {
      const manga = await getRandomManga()
      if (manga && manga.id) {
        router.push(`/manga/${manga.id}`)
      }
    } catch (error) {
      console.error("Failed to get random manga:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRandomManga}
      disabled={loading}
      className="flex items-center gap-1"
    >
      <Shuffle className="h-4 w-4" />
      <span>{t("manga.random")}</span>
    </Button>
  )
}
