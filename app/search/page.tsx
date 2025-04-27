"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Skeleton } from "@/components/ui/skeleton"
import { SearchIcon, Filter } from "lucide-react"
import { searchManga, getMangaTags } from "@/lib/api"
import { useLanguage } from "@/components/language-provider"
import MangaCard from "@/components/manga-card"
import { useStore } from "@/lib/store"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const { language, t } = useLanguage()
  const { user } = useStore()

  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [tags, setTags] = useState<any[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [status, setStatus] = useState<string>("")
  const [contentRating, setContentRating] = useState<string[]>(["safe"])
  const [showFilters, setShowFilters] = useState(false)

  const limit = 24

  // Fetch tags for filtering
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const data = await getMangaTags()
        // Group tags by category
        const groupedTags = data.reduce((acc: any, tag: any) => {
          const group = tag.attributes.group
          if (!acc[group]) {
            acc[group] = []
          }
          acc[group].push(tag)
          return acc
        }, {})

        setTags(data)
      } catch (error) {
        console.error("Failed to fetch tags:", error)
      }
    }

    fetchTags()
  }, [])

  // Search when query or filters change
  useEffect(() => {
    if (searchParams.get("q")) {
      setQuery(searchParams.get("q") || "")
      handleSearch()
    }
  }, [searchParams])

  const handleSearch = async (newPage = 1) => {
    setLoading(true)
    setPage(newPage)

    try {
      const offset = (newPage - 1) * limit

      const filters: any = {
        includedTags: selectedTags,
        contentRating,
      }

      if (status) {
        filters.status = [status]
      }

      const result = await searchManga(query, limit, offset, filters)
      setResults(result.data)
      setTotal(result.total)
    } catch (error) {
      console.error("Search error:", error)
      setResults([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  const handleTagToggle = (tagId: string) => {
    setSelectedTags((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]))
  }

  const handleContentRatingChange = (rating: string) => {
    setContentRating((prev) => (prev.includes(rating) ? prev.filter((r) => r !== rating) : [...prev, rating]))
  }

  const clearFilters = () => {
    setSelectedTags([])
    setStatus("")
    setContentRating(["safe"])
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Search Manga</h1>

      <div className="mb-6 flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch()
              }
            }}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={() => handleSearch()}>Search</Button>

          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-1">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-6 rounded-lg border p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium">Filters</h2>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <h3 className="mb-2 font-medium">Status</h3>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Any status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any status</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="hiatus">Hiatus</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <h3 className="mb-2 font-medium">Content Rating</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rating-safe"
                    checked={contentRating.includes("safe")}
                    onCheckedChange={() => handleContentRatingChange("safe")}
                  />
                  <Label htmlFor="rating-safe">Safe</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rating-suggestive"
                    checked={contentRating.includes("suggestive")}
                    onCheckedChange={() => handleContentRatingChange("suggestive")}
                    disabled={!user?.showAdultContent}
                  />
                  <Label htmlFor="rating-suggestive">Suggestive {!user?.showAdultContent && "(18+ only)"}</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rating-erotica"
                    checked={contentRating.includes("erotica")}
                    onCheckedChange={() => handleContentRatingChange("erotica")}
                    disabled={!user?.showAdultContent}
                  />
                  <Label htmlFor="rating-erotica">Erotica {!user?.showAdultContent && "(18+ only)"}</Label>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <h3 className="mb-2 font-medium">Tags</h3>
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="genres">
                  <AccordionTrigger>Genres</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                      {tags
                        .filter((tag) => tag.attributes.group === "genre")
                        .map((tag) => (
                          <div key={tag.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`tag-${tag.id}`}
                              checked={selectedTags.includes(tag.id)}
                              onCheckedChange={() => handleTagToggle(tag.id)}
                            />
                            <Label htmlFor={`tag-${tag.id}`}>
                              {tag.attributes.name[language] || tag.attributes.name.en}
                            </Label>
                          </div>
                        ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="themes">
                  <AccordionTrigger>Themes</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                      {tags
                        .filter((tag) => tag.attributes.group === "theme")
                        .map((tag) => (
                          <div key={tag.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`tag-${tag.id}`}
                              checked={selectedTags.includes(tag.id)}
                              onCheckedChange={() => handleTagToggle(tag.id)}
                            />
                            <Label htmlFor={`tag-${tag.id}`}>
                              {tag.attributes.name[language] || tag.attributes.name.en}
                            </Label>
                          </div>
                        ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="format">
                  <AccordionTrigger>Format</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                      {tags
                        .filter((tag) => tag.attributes.group === "format")
                        .map((tag) => (
                          <div key={tag.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`tag-${tag.id}`}
                              checked={selectedTags.includes(tag.id)}
                              onCheckedChange={() => handleTagToggle(tag.id)}
                            />
                            <Label htmlFor={`tag-${tag.id}`}>
                              {tag.attributes.name[language] || tag.attributes.name.en}
                            </Label>
                          </div>
                        ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button onClick={() => handleSearch()}>Apply Filters</Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array(12)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="aspect-[2/3] w-full rounded-md" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
        </div>
      ) : results.length > 0 ? (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {results.length} of {total} results
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {results.map((manga) => (
              <MangaCard key={manga.id} manga={manga} showBadge />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <Button variant="outline" onClick={() => handleSearch(page - 1)} disabled={page === 1}>
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber

                  if (totalPages <= 5) {
                    pageNumber = i + 1
                  } else if (page <= 3) {
                    pageNumber = i + 1
                  } else if (page >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i
                  } else {
                    pageNumber = page - 2 + i
                  }

                  return (
                    <Button
                      key={i}
                      variant={page === pageNumber ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSearch(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  )
                })}

                {totalPages > 5 && page < totalPages - 2 && (
                  <>
                    <span className="mx-1">...</span>
                    <Button variant="outline" size="sm" onClick={() => handleSearch(totalPages)}>
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>

              <Button variant="outline" onClick={() => handleSearch(page + 1)} disabled={page === totalPages}>
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-lg border p-8 text-center">
          <h2 className="mb-2 text-xl font-semibold">No results found</h2>
          <p className="text-muted-foreground">Try adjusting your search or filters to find what you're looking for.</p>
        </div>
      )}
    </div>
  )
}
