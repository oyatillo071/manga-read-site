"use client"

import { useState, useEffect } from "react"
import { getPopularManga } from "@/lib/api"
import MangaCard from "@/components/manga-card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function PopularPage() {
  const [manga, setManga] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const limit = 24

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      try {
        const data = await getPopularManga(limit)
        setManga(data || [])
        setHasMore(data && data.length >= limit)
      } catch (error) {
        console.error("Error fetching popular manga:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const loadMore = async () => {
    if (loading || !hasMore) return

    setLoading(true)

    try {
      const nextPage = page + 1
      const offset = page * limit

      // In a real implementation, we would pass the offset to the API
      // For now, we'll just fetch more popular manga
      const data = await getPopularManga(limit)

      if (data && data.length > 0) {
        // Filter out duplicates
        const newManga = data.filter((item: any) => !manga.some((existing) => existing.id === item.id))

        if (newManga.length > 0) {
          setManga((prev) => [...prev, ...newManga])
          setPage(nextPage)
        } else {
          setHasMore(false)
        }
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error("Error loading more manga:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading && manga.length === 0) {
    return (
      <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 py-8">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading popular manga...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Popular Manga</h1>

      {manga.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {manga.map((item: any) => (
            <MangaCard key={item.id} manga={item} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border p-8 text-center">
          <h2 className="mb-2 text-xl font-semibold">No manga found</h2>
          <p className="text-muted-foreground">There are no popular manga available at the moment.</p>
        </div>
      )}

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <Button onClick={loadMore} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
