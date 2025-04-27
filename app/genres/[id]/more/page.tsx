"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { getMangaByTag, getMangaTags } from "@/lib/api"
import MangaCard from "@/components/manga-card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Loader2 } from "lucide-react"

export default function GenreMorePage() {
  const params = useParams()
  const id = params.id as string

  const [manga, setManga] = useState<any[]>([])
  const [tag, setTag] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)

  const limit = 24

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      try {
        // Fetch tag info
        const tags = await getMangaTags()
        const foundTag = tags.find((t: any) => t.id === id)
        setTag(foundTag)

        // Fetch first page of manga
        const result = await getMangaByTag(id, limit, 0)
        setManga(result.data || [])
        setTotal(result.total || 0)
        setHasMore((result.total || 0) > limit)
      } catch (error) {
        console.error("Error fetching genre data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const loadMore = async () => {
    if (loading || !hasMore) return

    setLoading(true)

    try {
      const offset = page * limit
      const result = await getMangaByTag(id, limit, offset)

      if (result.data && result.data.length > 0) {
        setManga((prev) => [...prev, ...result.data])
        setPage((prev) => prev + 1)
        setHasMore((result.total || 0) > (page + 1) * limit)
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
          <p>Loading manga...</p>
        </div>
      </div>
    )
  }

  const genreName = tag?.attributes?.name?.en || "Genre"

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/genres/${id}`}
          className="mb-4 flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to {genreName}
        </Link>
        <h1 className="text-3xl font-bold">{genreName} Manga</h1>
        <p className="mt-4 text-sm">
          Showing {manga.length} of {total} titles
        </p>
      </div>

      {manga.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {manga.map((item: any) => (
            <MangaCard key={item.id} manga={item} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border p-8 text-center">
          <h2 className="mb-2 text-xl font-semibold">No manga found</h2>
          <p className="text-muted-foreground">There are no manga available in this genre.</p>
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
