// "use client";
import type { Metadata } from "next";
import { getMangaById, getMangaChapters } from "@/lib/api";
import MangaDetails from "@/components/manga-details";
import ChapterList from "@/components/chapter-list";
import MangaComments from "@/components/manga-comments";
import RelatedManga from "@/components/related-manga";
import { Skeleton } from "@/components/ui/skeleton";

interface MangaPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: MangaPageProps): Promise<Metadata> {
  const manga = await getMangaById(params.id);

  if (!manga) {
    return {
      title: "Manga Not Found",
    };
  }

  const title =
    manga.attributes?.title?.en ||
    manga.attributes?.title?.["ja-ro"] ||
    Object.values(manga.attributes?.title || {})[0];

  const description =
    manga.attributes?.description?.en ||
    manga.attributes?.description?.["ja-ro"] ||
    Object.values(manga.attributes?.description || {})[0] ||
    "";

  return {
    title: `${title} | MangaVerse`,
    description: description.substring(0, 160),
    openGraph: {
      title: `${title} | MangaVerse`,
      description: description.substring(0, 160),
      type: "article",
    },
  };
}

export default async function MangaPage({ params }: MangaPageProps) {
  const resolvedParams = await params;
  const manga = await getMangaById(resolvedParams.id);

  if (!manga) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-[300px_1fr] lg:grid-cols-[350px_1fr]">
          <Skeleton className="aspect-[2/3] w-full" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
        <div className="mt-8">
          <h2 className="mb-4 text-2xl font-bold">Chapters</h2>
          <div className="rounded-lg border p-6 text-center">
            <p className="text-muted-foreground">
              Unable to load chapters. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const chapters = await getMangaChapters(resolvedParams.id); // Use resolvedParams.id here as well

  return (
    <div className="container mx-auto px-4 py-8">
      <MangaDetails manga={manga} />
      <div className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">Chapters</h2>
        <ChapterList mangaId={resolvedParams.id} chapters={chapters} />
      </div>
      <div className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">Comments</h2>
        <MangaComments mangaId={resolvedParams.id} />
      </div>
      <div className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">You May Also Like</h2>
        <RelatedManga manga={manga} />
      </div>
    </div>
  );
}
