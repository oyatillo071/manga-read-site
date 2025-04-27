"use client";

import { useState, useEffect } from "react";
import { getPopularManga } from "@/lib/api";
import MangaCard from "@/components/manga-card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function PopularPage() {
  const [manga, setManga] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const limit = 24;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const offset = (page - 1) * limit;
        const data = await getPopularManga(limit, offset);
        setManga(data || []);
        setHasMore(data && data.length >= limit);
        setTotalPages(Math.ceil(100 / limit));
      } catch (error) {
        console.error("Error fetching popular manga:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page]);

  const nextPage = () => {
    if (loading || !hasMore) return;

    setPage((prev) => prev + 1);
  };

  const prevPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const goToPage = (pageNum: number) => {
    setPage(pageNum);
  };

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  if (loading && manga.length === 0) {
    return (
      <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 py-8">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading popular manga...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Popular Manga</h1>

      {manga.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {manga.map((item: any) => (
            <MangaCard key={item.id} manga={item} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border p-8 text-center">
          <h2 className="mb-2 text-xl font-semibold">No manga found</h2>
          <p className="text-muted-foreground">
            There are no popular manga available at the moment.
          </p>
        </div>
      )}

      <div className="mt-8 flex justify-center items-center gap-4">
        <Button onClick={prevPage} disabled={loading || page <= 1}>
          Prev
        </Button>

        <div className="flex gap-2">
          {pageNumbers.map((pageNum) => (
            <Button
              key={pageNum}
              onClick={() => goToPage(pageNum)}
              disabled={loading || page === pageNum}
              className={`${
                page === pageNum ? "bg-primary text-white" : "bg-gray-200"
              }`}
            >
              {pageNum}
            </Button>
          ))}
        </div>

        <Button onClick={nextPage} disabled={loading || !hasMore}>
          Next
        </Button>
      </div>
    </div>
  );
}
