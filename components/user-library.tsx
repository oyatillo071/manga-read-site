"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStore } from "@/lib/store"
import { getMangaById } from "@/lib/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import MangaGrid from "@/components/manga-grid"

export default function UserLibrary() {
  const router = useRouter()
  const { user, library, updateMangaStatus } = useStore()
  const [loading, setLoading] = useState(true)
  const [mangaData, setMangaData] = useState<any[]>([])
  const [activeStatus, setActiveStatus] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("dateUpdated")

  useEffect(() => {
    const fetchMangaData = async () => {
      if (!library.length) {
        setMangaData([])
        setLoading(false)
        return
      }

      setLoading(true)

      try {
        // Fetch manga details for each manga in library
        const mangaPromises = library.map((item) => getMangaById(item.id))
        const mangaResults = await Promise.all(mangaPromises)

        // Combine library data with manga details
        const combinedData = mangaResults.map((manga, index) => ({
          ...manga,
          libraryData: library[index],
        }))

        setMangaData(combinedData)
      } catch (error) {
        console.error("Error fetching library manga:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMangaData()
  }, [library])

  // Filter manga by status
  const filteredManga =
    activeStatus === "all" ? mangaData : mangaData.filter((manga) => manga.libraryData.status === activeStatus)

  // Sort manga
  const sortedManga = [...filteredManga].sort((a, b) => {
    if (sortBy === "dateAdded") {
      return new Date(b.libraryData.dateAdded).getTime() - new Date(a.libraryData.dateAdded).getTime()
    } else if (sortBy === "dateUpdated") {
      return new Date(b.libraryData.dateUpdated).getTime() - new Date(a.libraryData.dateUpdated).getTime()
    } else if (sortBy === "title") {
      const titleA =
        a.attributes?.title?.en || a.attributes?.title?.["ja-ro"] || Object.values(a.attributes?.title || {})[0] || ""
      const titleB =
        b.attributes?.title?.en || b.attributes?.title?.["ja-ro"] || Object.values(b.attributes?.title || {})[0] || ""
      return titleA.localeCompare(titleB)
    }
    return 0
  })

  const handleStatusChange = (mangaId: string, status: string) => {
    updateMangaStatus(mangaId, status as any)
  }

  if (!user) {
    router.push("/login")
    return null
  }

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading your library...</p>
        </div>
      </div>
    )
  }

  if (library.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Library</CardTitle>
          <CardDescription>You haven't added any manga to your library yet</CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-[200px] flex-col items-center justify-center">
          <p className="mb-4 text-center text-muted-foreground">
            Start browsing and add manga to your library to keep track of what you're reading
          </p>
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
          <CardTitle>Your Library</CardTitle>
          <CardDescription>
            {library.length} {library.length === 1 ? "manga" : "manga"} in your collection
          </CardDescription>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dateUpdated">Last Updated</SelectItem>
              <SelectItem value="dateAdded">Date Added</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeStatus} onValueChange={setActiveStatus} className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-4 lg:grid-cols-7">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="reading">Reading</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="plan_to_read">Plan to Read</TabsTrigger>
            <TabsTrigger value="on_hold" className="hidden lg:inline-flex">
              On Hold
            </TabsTrigger>
            <TabsTrigger value="dropped" className="hidden lg:inline-flex">
              Dropped
            </TabsTrigger>
            <TabsTrigger value="re_reading" className="hidden lg:inline-flex">
              Re-reading
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeStatus}>
            {sortedManga.length > 0 ? (
              <MangaGrid manga={sortedManga} showStatus onStatusChange={handleStatusChange} />
            ) : (
              <div className="flex min-h-[200px] flex-col items-center justify-center">
                <p className="text-center text-muted-foreground">No manga found with this status</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
