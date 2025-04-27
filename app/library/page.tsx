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
import { useLanguage } from "@/components/language-provider"

export default function LibraryPage() {
  const router = useRouter()
  const { user, library, updateMangaStatus } = useStore()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [mangaData, setMangaData] = useState<any[]>([])
  const [activeStatus, setActiveStatus] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("dateUpdated")

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      router.push("/login")
      return
    }

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
        const combinedData = mangaResults
          .filter(Boolean) // Filter out null results
          .map((manga, index) => ({
            ...manga,
            libraryData: library.find((item) => item.id === manga.id),
          }))

        setMangaData(combinedData)
      } catch (error) {
        console.error("Error fetching library manga:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMangaData()
  }, [library, user, router])

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
    return null // Will redirect in useEffect
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>{t("common.loading")}</p>
          </div>
        </div>
      </div>
    )
  }

  if (library.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>{t("common.bookmarks")}</CardTitle>
            <CardDescription>{t("common.dontHaveBookmarks")}</CardDescription>
          </CardHeader>
          <CardContent className="flex min-h-[200px] flex-col items-center justify-center">
            <p className="mb-4 text-center text-muted-foreground">{t("common.startBrowsing")}</p>
            <button onClick={() => router.push("/")} className="text-primary hover:underline">
              {t("common.browseManga")}
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <CardTitle>{t("common.bookmarks")}</CardTitle>
            <CardDescription>
              {library.length} {library.length === 1 ? t("common.manga") : t("common.manga")} {t("common.inCollection")}
            </CardDescription>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("common.sortBy")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dateUpdated">{t("common.lastUpdated")}</SelectItem>
                <SelectItem value="dateAdded">{t("common.dateAdded")}</SelectItem>
                <SelectItem value="title">{t("common.title")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeStatus} onValueChange={setActiveStatus} className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-4 lg:grid-cols-7">
              <TabsTrigger value="all">{t("common.all")}</TabsTrigger>
              <TabsTrigger value="reading">{t("manga.reading")}</TabsTrigger>
              <TabsTrigger value="completed">{t("manga.completed")}</TabsTrigger>
              <TabsTrigger value="plan_to_read">{t("manga.planToRead")}</TabsTrigger>
              <TabsTrigger value="on_hold" className="hidden lg:inline-flex">
                {t("manga.onHold")}
              </TabsTrigger>
              <TabsTrigger value="dropped" className="hidden lg:inline-flex">
                {t("manga.dropped")}
              </TabsTrigger>
              <TabsTrigger value="re_reading" className="hidden lg:inline-flex">
                {t("manga.reReading")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeStatus}>
              {sortedManga.length > 0 ? (
                <MangaGrid manga={sortedManga} showStatus onStatusChange={handleStatusChange} />
              ) : (
                <div className="flex min-h-[200px] flex-col items-center justify-center">
                  <p className="text-center text-muted-foreground">{t("common.noMangaFound")}</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
