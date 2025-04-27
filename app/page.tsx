import { Suspense } from "react"
import type { Metadata } from "next"
import { siteConfig } from "@/lib/site-config"
import HeroSection from "@/components/hero-section"
import FeaturedManga from "@/components/featured-manga"
import PopularManga from "@/components/popular-manga"
import RecentlyUpdated from "@/components/recently-updated"
import GenreSection from "@/components/genre-section"
import RandomMangaButton from "@/components/random-manga-button"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = {
  title: `Home | ${siteConfig.name}`,
  description: `Discover and read the latest manga, manhua, and manhwa on ${siteConfig.name}`,
}

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-6">
      <HeroSection />

      <div className="my-8 flex items-center justify-between">
        <h2 className="text-3xl font-bold">Featured Manga</h2>
        <RandomMangaButton />
      </div>

      <Suspense fallback={<MangaGridSkeleton />}>
        <FeaturedManga />
      </Suspense>

      <div className="my-8 flex items-center justify-between">
        <h2 className="text-3xl font-bold">Popular Now</h2>
        <a href="/popular" className="text-primary hover:underline">
          More
        </a>
      </div>

      <Suspense fallback={<MangaGridSkeleton />}>
        <PopularManga />
      </Suspense>

      <div className="my-8 flex items-center justify-between">
        <h2 className="text-3xl font-bold">Recently Updated</h2>
        <a href="/recent" className="text-primary hover:underline">
          More
        </a>
      </div>

      <Suspense fallback={<MangaGridSkeleton />}>
        <RecentlyUpdated />
      </Suspense>

      <div className="my-8">
        <h2 className="mb-4 text-3xl font-bold">Browse by Genre</h2>
        <GenreSection />
      </div>
    </main>
  )
}

function MangaGridSkeleton() {
  return (
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
  )
}
