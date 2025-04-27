"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStore } from "@/lib/store"
import { getMangaById } from "@/lib/api"
import { Loader2 } from "lucide-react"
import MangaGrid from "@/components/manga-grid"

export default function UserLikes() {
  const router = useRouter()
  const { user, likes } = useStore()
  const [loading, setLoading] = useState(true)
  const [mangaData, setMangaData] = useState<any[]>([])
  const [sortBy, setSortBy] = useState<string>("title")

  useEffect(() => {
    const fetchMangaData = async () => {
      if (!likes.length || !user) {
        setMangaData([])
        setLoading(false)
        return
      }

      // Filter likes by current user
      const userLikes = likes.filter((like) => like.userId === user.id)

      if (userLikes.length === 0) {
        setMangaData([])
        setLoading(false)
        return
      }

      setLoading(true)

      try {
        // Fetch manga details for each liked manga
        const mangaPromises = userLikes.map((like) => getMangaById(like.mangaId))
        const mangaResults = await Promise.all(mangaPromises)

        setMangaData(mangaResults.filter(Boolean))
      } catch (error) {
        console.error("Error fetching liked manga:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMangaData()
  }, [likes, user])

  // Sort manga
  const sortedManga = [...mangaData].sort((a, b) => {
    if (sortBy === "title") {
      const titleA =
        a.attributes?.title?.en || a.attributes?.title?.["ja-ro"] || Object.values(a.attributes?.title || {})[0] || ""
      const titleB =
        b.attributes?.title?.en || b.attributes?.title?.["ja-ro"] || Object.values(b.attributes?.title || {})[0] || ""
      return titleA.localeCompare(titleB)
    }
    return 0
  })

  if (!user) {
    router.push("/login")
    return null
  }

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading your likes...</p>
        </div>
      </div>
    )
  }

  if (mangaData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Likes</CardTitle>
          <CardDescription>You haven't liked any manga yet</CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-[200px] flex-col items-center justify-center">
          <p className="mb-4 text-center text-muted-foreground">Like manga to keep track of your favorites</p>
          <button onClick={() => router.push("/")} className="text-primary hover:underline">
            Browse Manga
          </button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <CardTitle>Your Likes</CardTitle>
          <CardDescription>
            {mangaData.length} {mangaData.length === 1 ? "manga" : "manga"} liked
          </CardDescription>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <MangaGrid manga={sortedManga} />
      </CardContent>
    </Card>
  )
}
