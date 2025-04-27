"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/lib/store";
import { getChapterPages, getMangaById, getMangaChapters } from "@/lib/api";
import { ChevronLeft, ChevronRight, Play, Pause, Settings } from "lucide-react";
import MangaReaderSettings from "@/components/manga-reader-settings";
import { useLanguage } from "@/components/language-provider";

interface MangaReaderPageProps {
  params: {
    id: string;
    chapterId: string;
  };
}

// Improved retry function for fetching chapter data
const fetchChapterWithRetry = async (chapterId: string, retries = 3) => {
  let lastError;
  let delay = 1000;

  for (let i = 0; i < retries; i++) {
    try {
      const data = await getChapterPages(chapterId);
      if (data) return data;

      // If we get null but no error was thrown, still consider it a failure
      console.warn(`Attempt ${i + 1} returned no data`);
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      lastError = error;
    }

    // Wait with exponential backoff before retrying
    console.log(`Waiting ${delay}ms before retry ${i + 2}`);
    await new Promise((resolve) => setTimeout(resolve, delay));
    delay *= 2; // Double the delay for next attempt
  }

  throw (
    lastError || new Error("Failed to fetch chapter after multiple attempts")
  );
};

export default function MangaReaderPage({ params }: MangaReaderPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user, library, updateLastRead, readerSettings } = useStore();

  const [manga, setManga] = useState<any>(null);
  const [chapter, setChapter] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [pages, setPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [autoScrolling, setAutoScrolling] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch manga details
        const mangaData = await getMangaById(params.id);
        setManga(mangaData);

        // Fetch all chapters
        const chaptersData = await getMangaChapters(params.id);
        setChapters(chaptersData);

        // Find current chapter
        const currentChapter = chaptersData.find(
          (c: any) => c.id === params.chapterId
        );
        setChapter(currentChapter);

        if (!currentChapter) {
          console.error("Chapter not found in chapters list");
          toast({
            title: t("common.error"),
            description: t("reader.chapterNotFound"),
            variant: "destructive",
          });
          setPages([]);
          setLoading(false);
          return;
        }

        // Fetch chapter pages with retry
        try {
          const pagesData = await fetchChapterWithRetry(params.chapterId);

          if (pagesData && pagesData.chapter) {
            const baseUrl = pagesData.baseUrl;

            // Choose quality based on user settings
            let pageFilenames;
            const quality = readerSettings.imageQuality;

            if (quality === "low" || quality === "medium") {
              pageFilenames =
                pagesData.chapter.dataSaver || pagesData.chapter.data;
            } else {
              pageFilenames =
                pagesData.chapter.data || pagesData.chapter.dataSaver;
            }

            if (!pageFilenames || pageFilenames.length === 0) {
              throw new Error("No pages found in chapter data");
            }

            const pageUrls = pageFilenames.map((filename: string) => {
              const qualityPath =
                quality === "low" || quality === "medium"
                  ? "data-saver"
                  : "data";
              return `${baseUrl}/${qualityPath}/${pagesData.chapter.hash}/${filename}`;
            });

            setPages(pageUrls);
          } else {
            throw new Error("Invalid chapter data format");
          }
        } catch (chapterError) {
          console.error("Failed to fetch chapter pages:", chapterError);
          toast({
            title: t("common.error"),
            description: t("reader.errorLoadingChapter"),
            variant: "destructive",
          });
          setPages([]);
        }
      } catch (error) {
        console.error("Failed to fetch manga reader data:", error);
        toast({
          title: t("common.error"),
          description: t("reader.failedToLoad"),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Clean up auto-scroll on unmount
    return () => {
      if (autoScrollRef.current) {
        window.cancelAnimationFrame(autoScrollRef.current);
      }
    };
  }, [params.id, params.chapterId, toast, readerSettings.imageQuality, t]);

  // Update reading progress in library
  useEffect(() => {
    if (user && manga && chapter && currentPage > 0) {
      updateLastRead(manga.id, chapter.id, currentPage);
    }
  }, [user, manga, chapter, currentPage, updateLastRead]);

  // Auto-scroll functionality
  useEffect(() => {
    if (!autoScrolling || !containerRef.current) {
      if (autoScrollRef.current) {
        window.cancelAnimationFrame(autoScrollRef.current);
        autoScrollRef.current = null;
      }
      return;
    }

    const scrollSpeed = readerSettings.autoScrollSpeed;
    let lastTime = 0;

    const scroll = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const elapsed = timestamp - lastTime;

      if (elapsed > 16) {
        // Limit to ~60fps
        containerRef.current?.scrollBy({
          top: scrollSpeed,
          behavior: "auto",
        });
        lastTime = timestamp;
      }

      autoScrollRef.current = window.requestAnimationFrame(scroll);
    };

    autoScrollRef.current = window.requestAnimationFrame(scroll);

    return () => {
      if (autoScrollRef.current) {
        window.cancelAnimationFrame(autoScrollRef.current);
      }
    };
  }, [autoScrolling, readerSettings.autoScrollSpeed]);

  // Handle navigation to next/previous chapters
  const navigateToChapter = (direction: "next" | "prev") => {
    if (!chapters.length || !chapter) return;

    const currentIndex = chapters.findIndex((c: any) => c.id === chapter.id);
    if (currentIndex === -1) return;

    const targetIndex =
      direction === "next" ? currentIndex - 1 : currentIndex + 1;

    // Check if target index is valid
    if (targetIndex >= 0 && targetIndex < chapters.length) {
      const targetChapter = chapters[targetIndex];
      router.push(`/manga/${params.id}/chapter/${targetChapter.id}`);
    } else {
      toast({
        title:
          direction === "next"
            ? t("reader.lastChapter")
            : t("reader.firstChapter"),
        description:
          direction === "next"
            ? t("reader.reachedLastChapter")
            : t("reader.reachedFirstChapter"),
      });
    }
  };

  // Handle page navigation
  const navigateToPage = (pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < pages.length) {
      setCurrentPage(pageIndex);

      // Scroll to the page
      const pageElement = document.getElementById(`page-${pageIndex}`);
      if (pageElement) {
        pageElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  // Handle infinite scroll
  const handleScroll = () => {
    if (!containerRef.current || !readerSettings.infiniteScroll) return;

    const container = containerRef.current;
    const scrollPosition = container.scrollTop + container.clientHeight;
    const scrollHeight = container.scrollHeight;

    // If we're near the bottom of the current chapter
    if (scrollHeight - scrollPosition < 200 && !loading) {
      // Check if there's a next chapter
      const currentIndex = chapters.findIndex((c: any) => c.id === chapter.id);
      if (currentIndex > 0) {
        // Remember chapters are sorted in reverse order
        const nextChapter = chapters[currentIndex - 1];
        router.push(`/manga/${params.id}/chapter/${nextChapter.id}`);
      }
    }

    // Update current page based on scroll position
    if (pages.length > 0) {
      const pageElements = Array.from(
        document.querySelectorAll(".manga-reader-image")
      );

      for (let i = 0; i < pageElements.length; i++) {
        const element = pageElements[i] as HTMLElement;
        const rect = element.getBoundingClientRect();

        // If the page is in view
        if (rect.top < window.innerHeight / 2 && rect.bottom > 0) {
          setCurrentPage(i);
          break;
        }
      }
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [chapter, chapters, pages, loading]);

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl space-y-4">
          <Skeleton className="h-[80vh] w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    );
  }

  if (!manga || !chapter) {
    return (
      <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-8">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">
            {t("reader.chapterNotFound")}
          </h1>
          <p className="mb-6 text-muted-foreground">
            {t("reader.chapterCouldNotBeLoaded")}
          </p>
          <Button onClick={() => router.push(`/manga/${params.id}`)}>
            {t("reader.backToManga")}
          </Button>
        </div>
      </div>
    );
  }

  if (pages.length === 0 && !loading) {
    return (
      <FallbackChapterView
        manga={manga}
        chapter={chapter}
        onRetry={() => {
          setLoading(true);
          fetchChapterWithRetry(params.chapterId)
            .then((pagesData) => {
              if (pagesData && pagesData.chapter) {
                const baseUrl = pagesData.baseUrl;
                const pageFilenames =
                  pagesData.chapter.dataSaver || pagesData.chapter.data;
                const pageUrls = pageFilenames.map(
                  (filename: string) =>
                    `${baseUrl}/data-saver/${pagesData.chapter.hash}/${filename}`
                );
                setPages(pageUrls);
              }
            })
            .catch((error) => {
              console.error("Retry failed:", error);
              toast({
                title: t("common.error"),
                description: t("reader.failedToLoadPages"),
                variant: "destructive",
              });
            })
            .finally(() => setLoading(false));
        }}
      />
    );
  }

  const chapterNumber = chapter.attributes.chapter || "N/A";
  const chapterTitle =
    chapter.attributes.title || `${t("reader.chapter")} ${chapterNumber}`;
  const mangaTitle =
    manga.attributes?.title?.en ||
    manga.attributes?.title?.["ja-ro"] ||
    Object.values(manga.attributes?.title || {})[0];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Reader header */}
      <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Button
            variant="ghost"
            onClick={() => router.push(`/manga/${params.id}`)}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            {t("reader.backToManga")}
          </Button>

          <div className="text-center">
            <h1 className="text-sm font-medium">{mangaTitle}</h1>
            <p className="text-xs text-muted-foreground">
              {t("reader.chapter")} {chapterNumber}
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-5 w-5" />
            <span className="sr-only">{t("reader.settings")}</span>
          </Button>
        </div>
      </div>

      {/* Reader content */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto"
        onScroll={handleScroll}
      >
        <div className="manga-reader-container py-8">
          {pages.map((pageUrl, index) => (
            <div key={index} id={`page-${index}`} className="relative w-full">
              <Image
                src={pageUrl || "/placeholder.svg"}
                alt={`${t("reader.page")} ${index + 1}`}
                width={800}
                height={1200}
                className="manga-reader-image"
                priority={index < 3}
                unoptimized
              />
              <div className="absolute bottom-2 right-2 rounded bg-background/70 px-2 py-1 text-xs backdrop-blur-sm">
                {index + 1} / {pages.length}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reader controls */}
      <div className="sticky bottom-0 z-10 border-t bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Button
            variant="outline"
            onClick={() => navigateToChapter("prev")}
            disabled={
              chapters.findIndex((c: any) => c.id === chapter.id) ===
              chapters.length - 1
            }
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            {t("reader.previousChapter")}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant={autoScrolling ? "default" : "outline"}
              size="icon"
              onClick={() => setAutoScrolling(!autoScrolling)}
            >
              {autoScrolling ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              <span className="sr-only">
                {autoScrolling
                  ? t("reader.pauseAutoScroll")
                  : t("reader.startAutoScroll")}
              </span>
            </Button>

            {autoScrolling && (
              <div className="auto-scroll-controls">
                <div className="flex items-center gap-2 px-2">
                  <span className="text-xs">{t("reader.speed")}</span>
                  <Slider
                    value={[readerSettings.autoScrollSpeed]}
                    min={1}
                    max={10}
                    step={1}
                    className="w-32"
                    onValueChange={(value) => {
                      useStore.getState().updateReaderSettings({
                        autoScrollSpeed: value[0],
                      });
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <Button
            variant="outline"
            onClick={() => navigateToChapter("next")}
            disabled={chapters.findIndex((c: any) => c.id === chapter.id) === 0}
          >
            {t("reader.nextChapter")}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <MangaReaderSettings open={showSettings} onOpenChange={setShowSettings} />
    </div>
  );
}

// Add a fallback UI component for when pages can't be loaded
function FallbackChapterView({
  manga,
  chapter,
  onRetry,
}: {
  manga: any;
  chapter: any;
  onRetry: () => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto flex min-h-[70vh] flex-col items-center justify-center px-4 py-8">
      <div className="max-w-md text-center">
        <h2 className="mb-4 text-2xl font-bold">
          {t("reader.unableToLoadChapter")}
        </h2>
        <p className="mb-6 text-muted-foreground">
          {t("reader.troubleLoadingChapter")}
        </p>
        <ul className="mb-6 list-disc text-left text-muted-foreground">
          <li>{t("reader.temporaryApiIssues")}</li>
          <li>{t("reader.chapterUnavailable")}</li>
          <li>{t("reader.networkConnectivity")}</li>
        </ul>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button onClick={onRetry}>{t("reader.tryAgain")}</Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            {t("reader.goBack")}
          </Button>
        </div>
      </div>
    </div>
  );
}
