"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, BookOpen } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

interface ChapterListProps {
  mangaId: string;
  chapters: any[];
}

export default function ChapterList({ mangaId, chapters }: ChapterListProps) {
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Sort chapters
  const sortedChapters = [...chapters].sort((a, b) => {
    const aChapter = Number.parseFloat(a.attributes.chapter || "0");
    const bChapter = Number.parseFloat(b.attributes.chapter || "0");

    return sortOrder === "desc" ? bChapter - aChapter : aChapter - bChapter;
  });

  // Filter chapters by search query
  const filteredChapters = sortedChapters.filter((chapter) => {
    const chapterNumber = chapter.attributes.chapter || "";
    const chapterTitle = chapter.attributes.title || "";
    const query = searchQuery.toLowerCase();

    return (
      chapterNumber.includes(query) ||
      chapterTitle.toLowerCase().includes(query)
    );
  });

  if (chapters.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-center">
        <p className="text-muted-foreground">No chapters available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[600px] rounded-lg overflow-y-auto">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search chapters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={sortOrder}
          onValueChange={(value) => setSortOrder(value as "asc" | "desc")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Newest First</SelectItem>
            <SelectItem value="asc">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {filteredChapters.length === 0 ? (
          <div className="rounded-lg border p-6 text-center">
            <p className="text-muted-foreground">
              No chapters found matching your search.
            </p>
          </div>
        ) : (
          filteredChapters.map((chapter) => {
            const chapterNumber = chapter.attributes.chapter || "N/A";
            const chapterTitle =
              chapter.attributes.title || `Chapter ${chapterNumber}`;
            const publishDate = new Date(
              chapter.attributes.publishAt || chapter.attributes.updatedAt
            );

            const scanlationGroup = chapter.relationships?.find(
              (rel: any) => rel.type === "scanlation_group"
            );
            const groupName =
              scanlationGroup?.attributes?.name || "Unknown Group";

            return (
              <Link
                key={chapter.id}
                href={`/manga/${mangaId}/chapter/${chapter.id}`}
                className="block"
              >
                <div className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50">
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-medium">
                        Chapter {chapterNumber}
                      </span>
                      {chapter.attributes.title && (
                        <span className="text-sm text-muted-foreground">
                          - {chapter.attributes.title}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{groupName}</span>
                      <span>•</span>
                      <span>{publishDate.toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="ml-2">
                    <BookOpen className="h-4 w-4" />
                    <span className="sr-only">Read</span>
                  </Button>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
