import { getFeaturedManga } from "@/lib/api"
import MangaCard from "@/components/manga-card"

export default async function FeaturedManga() {
  const manga = await getFeaturedManga(12)

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {manga.map((item: any) => (
        <MangaCard key={item.id} manga={item} />
      ))}
    </div>
  )
}
