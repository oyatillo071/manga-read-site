import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { truncate } from "@/lib/utils";
import { buildCoverUrl } from "@/lib/api";

interface MangaCardProps {
  manga: any;
  showBadge?: boolean;
}

export default function MangaCard({
  manga,
  showBadge = false,
}: MangaCardProps) {
  if (!manga) return null;

  const coverRel = manga.relationships?.find(
    (r: any) => r.type === "cover_art"
  );
  const coverUrl = buildCoverUrl(manga.id, coverRel || null, undefined);

  const titles = manga.attributes?.title || {};
  const title = titles.en || titles[Object.keys(titles)[0]] || "Unknown Title";

  const status = manga.attributes?.status;

  return (
    <Link href={`/manga/${manga.id}`}>
      <Card className="overflow-hidden transition-all hover:scale-105 hover:shadow-md">
        <div className="relative aspect-[2/3] w-full overflow-hidden">
          <Image
            src={coverUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
            unoptimized
          />
          {showBadge && status && (
            <div className="absolute right-2 top-2">
              <Badge variant="secondary" className="capitalize">
                {status}
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-3">
          <h3 className="font-medium line-clamp-1 leading-tight">
            {truncate(title, 40)}
          </h3>
        </CardContent>
      </Card>
    </Link>
  );
}
