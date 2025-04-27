"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Heart, BookOpen, ChevronDown, AlertTriangle } from "lucide-react";
import { useStore, type MangaStatus } from "@/lib/store";
import { useLanguage } from "@/components/language-provider";
import { mangaStatuses } from "@/lib/utils";
import AdultContentWarning from "@/components/adult-content-warning";
import { Skeleton } from "@/components/ui/skeleton";
import { buildCoverUrl } from "@/lib/api";

interface MangaDetailsProps {
  manga: any;
}

export default function MangaDetails({ manga }: MangaDetailsProps) {
  const { user, library, likes, addToLibrary, updateMangaStatus, toggleLike } =
    useStore();
  const { language, t } = useLanguage();
  const [showAdultWarning, setShowAdultWarning] = useState(false);

  if (!manga) {
    return (
      <div className="grid gap-6 md:grid-cols-[300px_1fr] lg:grid-cols-[350px_1fr]">
        <Skeleton className="aspect-[2/3] w-full" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  const coverRelationship = manga.relationships?.find(
    (rel: any) => rel.type === "cover_art"
  );
  // const coverUrl = getImageUrl(coverRelationship);
  const coverRel = manga.relationships?.find(
    (r: any) => r.type === "cover_art"
  ) as { attributes: { fileName: string } } | null;
  const coverUrl = buildCoverUrl(manga.id, coverRel, undefined);

  const titles = manga.attributes?.title || {};
  const title: string =
    typeof titles.en === "string"
      ? titles.en
      : typeof titles[Object.keys(titles)[0]] === "string"
      ? titles[Object.keys(titles)[0]]
      : "Unknown Title";

  // const title =
  //   manga.attributes?.title?.en ||
  //   manga.attributes?.title?.["ja-ro"] ||
  //   Object.values(manga.attributes?.title || {}).length > 0
  //     ? Object.values(manga.attributes?.title || {})[0]
  //     : "Unknown Title";

  const description =
    manga.attributes?.description?.[language] ||
    manga.attributes?.description?.en ||
    manga.attributes?.description?.["ja-ro"] ||
    (Object.values(manga.attributes?.description || {}).length > 0
      ? Object.values(manga.attributes?.description || {})[0]
      : "No description available.");

  const status = manga.attributes?.status || "unknown";
  const tags = manga.attributes?.tags || [];

  const authorRel = manga.relationships?.find(
    (rel: any) => rel.type === "author"
  );
  const authorName = authorRel?.attributes?.name || "Unknown Author";

  const artistRel = manga.relationships?.find(
    (rel: any) => rel.type === "artist"
  );
  const artistName = artistRel?.attributes?.name || "Unknown Artist";

  const isAdult =
    manga.attributes?.contentRating === "suggestive" ||
    manga.attributes?.contentRating === "erotica";

  const mangaInLibrary = library.find((item) => item.id === manga.id);
  const isLiked = likes.some(
    (like) => like.mangaId === manga.id && like.userId === user?.id
  );

  const handleReadClick = () => {
    if (isAdult && user && !user.showAdultContent) {
      setShowAdultWarning(true);
      return;
    }

    // Navigate to first chapter
    // This would be implemented with actual chapter navigation
  };

  const handleStatusChange = (status: MangaStatus) => {
    if (!user) return;

    if (mangaInLibrary) {
      updateMangaStatus(manga.id, status);
    } else {
      addToLibrary({
        id: manga.id,
        status,
        dateAdded: new Date().toISOString(),
        dateUpdated: new Date().toISOString(),
      });
    }
  };

  const handleLikeToggle = () => {
    if (!user) return;
    toggleLike(manga.id);
  };

  return (
    <div className="grid gap-6 md:grid-cols-[300px_1fr] lg:grid-cols-[350px_1fr]">
      <div className="flex flex-col gap-4">
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg">
          <Image
            src={coverUrl || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 350px"
            priority
          />
          {isAdult && (
            <div className="absolute right-2 top-2">
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                <span>18+</span>
              </Badge>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={handleReadClick} className="w-full">
            <BookOpen className="mr-2 h-4 w-4" />
            {t("manga.readNow")}
          </Button>

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex-1">
                  <span>
                    {mangaInLibrary
                      ? t(`manga.${mangaInLibrary.status}`)
                      : t("manga.addToLibrary")}
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {mangaStatuses.map((status) => (
                  <DropdownMenuItem
                    key={status.value}
                    onClick={() =>
                      handleStatusChange(status.value as MangaStatus)
                    }
                  >
                    {t(`manga.${status.value}`)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant={isLiked ? "default" : "outline"}
              size="icon"
              onClick={handleLikeToggle}
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              <span className="sr-only">{isLiked ? "Unlike" : "Like"}</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">{title}</h1>

        <div className="flex flex-wrap gap-2">
          {status && (
            <Badge variant="outline" className="capitalize">
              {status}
            </Badge>
          )}

          {tags.map((tag: any) => (
            <Link key={tag.id} href={`/genres/${tag.id}`}>
              <Badge variant="secondary" className="cursor-pointer">
                {tag.attributes.name[language] || tag.attributes.name.en}
              </Badge>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-medium">{t("manga.author")}:</span>{" "}
            {authorName}
          </div>
          <div>
            <span className="font-medium">{t("manga.artist")}:</span>{" "}
            {artistName}
          </div>
        </div>

        <div className="mt-4">
          <h2 className="mb-2 text-xl font-semibold">
            {t("manga.description")}
          </h2>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {(description.split("\n") as string[]).map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}

            {/* {description.split("\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))} */}
          </div>
        </div>
      </div>

      <AdultContentWarning
        open={showAdultWarning}
        onOpenChange={setShowAdultWarning}
      />
    </div>
  );
}
