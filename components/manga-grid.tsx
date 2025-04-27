"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getImageUrl, truncate, mangaStatuses } from "@/lib/utils"
import { ChevronDown, BookOpen } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

interface MangaGridProps {
  manga: any[]
  showStatus?: boolean
  onStatusChange?: (mangaId: string, status: string) => void
}

export default function MangaGrid({ manga, showStatus = false, onStatusChange }: MangaGridProps) {
  const { t } = useLanguage()

  if (!manga || manga.length === 0) {
    return <div className="text-center text-muted-foreground">{t("common.noMangaFound")}</div>
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {manga.map((item) => (
        <MangaGridItem
          key={item.id}
          manga={item}
          showStatus={showStatus}
          libraryData={item.libraryData}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  )
}

interface MangaGridItemProps {
  manga: any
  showStatus?: boolean
  libraryData?: any
  onStatusChange?: (mangaId: string, status: string) => void
}

function MangaGridItem({ manga, showStatus, libraryData, onStatusChange }: MangaGridItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { t } = useLanguage()

  if (!manga) return null

  const coverRelationship = manga.relationships?.find((rel: any) => rel.type === "cover_art")
  const coverUrl = getImageUrl(coverRelationship)

  const title =
    manga.attributes?.title?.en ||
    manga.attributes?.title?.["ja-ro"] ||
    (Object.values(manga.attributes?.title || {}).length > 0
      ? Object.values(manga.attributes?.title || {})[0]
      : t("common.unknownTitle"))

  const status = manga.attributes?.status
  const currentStatus = libraryData?.status

  const handleStatusChange = (status: string) => {
    if (onStatusChange) {
      onStatusChange(manga.id, status)
    }
  }

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-md">
      <div
        className="relative aspect-[2/3] w-full overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          src={coverUrl || "/placeholder.svg?height=400&width=300"}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
          unoptimized
        />

        {showStatus && status && (
          <div className="absolute right-2 top-2">
            <Badge variant="secondary" className="capitalize">
              {t(`manga.${status}`) || status}
            </Badge>
          </div>
        )}

        {isHovered && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70 p-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <Link href={`/manga/${manga.id}`} className="w-full">
              <Button variant="default" size="sm" className="w-full">
                <BookOpen className="mr-2 h-4 w-4" />
                {t("common.viewDetails")}
              </Button>
            </Link>

            {showStatus && onStatusChange && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full bg-white/10 text-white hover:bg-white/20">
                    {currentStatus ? (
                      <span>{t(`manga.${currentStatus}`) || currentStatus.replace("_", " ")}</span>
                    ) : (
                      t("manga.addToLibrary")
                    )}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {mangaStatuses.map((status) => (
                    <DropdownMenuItem key={status.value} onClick={() => handleStatusChange(status.value)}>
                      {t(`manga.${status.value}`) || status.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}

        {libraryData?.lastReadChapter && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-center text-xs text-white">
            <span>{t("manga.continueReading")}</span>
          </div>
        )}
      </div>
      <CardContent className="p-3">
        <h3 className="font-medium leading-tight">{truncate(title, 40)}</h3>
        {showStatus && currentStatus && (
          <p className="mt-1 text-xs text-muted-foreground">
            {t(`manga.${currentStatus}`) || currentStatus.replace("_", " ")}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
