import { getPopularManga } from "@/lib/api";
import MangaCard from "@/components/manga-card";

export default async function PopularManga() {
  const manga = await getPopularManga(12);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {manga.map((item: any) => {
        return <MangaCard key={item.id} manga={item} />;
      })}
    </div>
  );
}
