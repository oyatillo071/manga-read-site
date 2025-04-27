"use client"

import { useState, useEffect } from "react"
import { searchManga } from "@/lib/api"
import MangaCard from "@/components/manga-card"
import { Skeleton } from "@/components/ui/skeleton"

interface RelatedMangaProps {
  manga: any
}

export default function RelatedManga({ manga }: RelatedMangaProps) {
  const [relatedManga, setRelatedManga] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRelatedManga = async () => {
      setLoading(true)
      setError(null)
      try {
        // Get tags from the manga
        const tags = manga.attributes?.tags || []

        if (tags.length === 0) {
          setRelatedManga([])
          setLoading(false)
          return
        }

        // Select up to 3 random tags to find related manga
        const randomTags = tags
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.min(3, tags.length))
          .map((tag: any) => tag.id)

        // Search for manga with these tags
        const result = await searchManga("", 12, 0, {
          includedTags: randomTags,
          contentRating: ["safe"],
        })

        if (!result.data || result.data.length === 0) {
          setRelatedManga([])
          setError("No related manga found")
        } else {
          // Filter out the current manga
          const filtered = result.data.filter((item: any) => item.id !== manga.id)
          setRelatedManga(filtered.slice(0, 6))
        }
      } catch (error) {
        console.error("Failed to fetch related manga:", error)
        setError("Failed to load related manga")
        setRelatedManga([])
      } finally {
        setLoading(false)
      }
    }

    fetchRelatedManga()
  }, [manga])

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="aspect-[2/3] w-full rounded-md" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
      </div>
    )
  }

  if (error || relatedManga.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-center">
        <p className="text-muted-foreground">{error || "No related manga found."}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {relatedManga.map((item) => (
        <MangaCard key={item.id} manga={item} />
      ))}
    </div>
  )
}
