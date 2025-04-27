import { getMangaByTag, getMangaTags } from "@/lib/api"
import MangaCard from "@/components/manga-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

interface GenrePageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: GenrePageProps) {
  const tags = await getMangaTags()
  const tag = tags.find((t: any) => t.id === params.id)

  if (!tag) {
    return {
      title: "Genre Not Found | MangaVerse",
      description: "The genre you're looking for could not be found.",
    }
  }

  const genreName = tag.attributes.name.en

  return {
    title: `${genreName} Manga | MangaVerse`,
    description: `Browse ${genreName} manga on MangaVerse`,
  }
}

export default async function GenrePage({ params }: GenrePageProps) {
  const tags = await getMangaTags()
  const tag = tags.find((t: any) => t.id === params.id)

  if (!tag) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Genre Not Found</h1>
        <p className="mb-4">The genre you're looking for could not be found.</p>
        <Link href="/genres">
          <Button>Back to Genres</Button>
        </Link>
      </div>
    )
  }

  const genreName = tag.attributes.name.en
  const genreDescription = tag.attributes.description?.en || ""

  const result = await getMangaByTag(params.id, 24)
  const manga = result.data || []
  const total = result.total || 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/genres" className="mb-4 flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Genres
        </Link>
        <h1 className="text-3xl font-bold">{genreName} Manga</h1>
        {genreDescription && <p className="mt-2 text-muted-foreground">{genreDescription}</p>}
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

      {total > manga.length && (
        <div className="mt-8 flex justify-center">
          <Link href={`/genres/${params.id}/more`}>
            <Button>Load More</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
