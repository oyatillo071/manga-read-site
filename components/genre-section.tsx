"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getMangaTags } from "@/lib/api"
import { useLanguage } from "@/components/language-provider"

export default function GenreSection() {
  const { language } = useLanguage()
  const [tags, setTags] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTags = async () => {
      setLoading(true)
      try {
        const data = await getMangaTags()
        // Filter to only show genre tags
        const genreTags = data.filter((tag: any) => tag.attributes.group === "genre")
        setTags(genreTags)
      } catch (error) {
        console.error("Failed to fetch tags:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTags()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array(10)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {tags.slice(0, 20).map((tag) => (
        <Link key={tag.id} href={`/genres/${tag.id}`}>
          <Button variant="outline" className="w-full justify-start truncate">
            {tag.attributes.name[language] || tag.attributes.name.en}
          </Button>
        </Link>
      ))}
      <Link href="/genres">
        <Button variant="outline" className="w-full justify-start truncate">
          View All Genres
        </Button>
      </Link>
    </div>
  )
}
