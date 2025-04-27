// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { Button } from "@/components/ui/button";
// import { useLanguage } from "@/components/language-provider";
// import { getRandomManga } from "@/lib/api";
// import { getImageUrl } from "@/lib/utils";

// export default function HeroSection() {
//   const { t } = useLanguage();
//   const [featuredManga, setFeaturedManga] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchRandomManga = async () => {
//       setLoading(true);
//       try {
//         const manga = await getRandomManga();
//         setFeaturedManga(manga);
//       } catch (error) {
//         console.error("Failed to fetch random manga for hero:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchRandomManga();
//   }, []);

//   if (loading) {
//     return (
//       <div className="relative h-[50vh] w-full overflow-hidden rounded-lg bg-gradient-to-r from-primary-900 to-primary-700 md:h-[60vh]">
//         <div className="absolute inset-0 flex items-center justify-center">
//           <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
//         </div>
//       </div>
//     );
//   }

//   if (!featuredManga) {
//     return (
//       <div className="relative h-[50vh] w-full overflow-hidden rounded-lg bg-gradient-to-r from-primary-900 to-primary-700 md:h-[60vh]">
//         <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
//           <h1 className="mb-4 text-4xl font-bold md:text-5xl lg:text-6xl">
//             {t("common.welcome")} {t("common.to")} MangaVerse
//           </h1>
//           <p className="mb-6 max-w-2xl text-lg md:text-xl">
//             {t("common.discover")} {t("common.and")} {t("common.read")}{" "}
//             {t("common.the")} {t("common.latest")} {t("common.manga")}
//           </p>
//           <div className="flex gap-4">
//             <Link href="/search">
//               <Button size="lg" variant="default">
//                 {t("common.browse")} {t("common.manga")}
//               </Button>
//             </Link>
//             <Link href="/popular">
//               <Button
//                 size="lg"
//                 variant="outline"
//                 className="bg-transparent text-white hover:bg-white/20 hover:text-white"
//               >
//                 {t("common.popular")} {t("common.manga")}
//               </Button>
//             </Link>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const coverRelationship = featuredManga.relationships?.find(
//     (rel: any) => rel.type === "cover_art"
//   );
//   const coverUrl = getImageUrl(coverRelationship);
//   const title =
//     featuredManga.attributes?.title?.en ||
//     featuredManga.attributes?.title?.["ja-ro"] ||
//     Object.values(featuredManga.attributes?.title || {})[0];
//   const description =
//     featuredManga.attributes?.description?.en ||
//     featuredManga.attributes?.description?.["ja-ro"] ||
//     Object.values(featuredManga.attributes?.description || {})[0] ||
//     "";

//   return (
//     <div className="relative h-[50vh] w-full overflow-hidden rounded-lg md:h-[60vh]">
//       <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 to-primary-700/70"></div>
//       <Image
//         src={coverUrl || "/placeholder.svg"}
//         alt={title}
//         fill
//         className="object-cover"
//         priority
//       />
//       <div className="absolute inset-0 flex flex-col items-start justify-center p-6 text-white md:p-12">
//         <h1 className="mb-2 max-w-2xl text-3xl font-bold md:text-4xl lg:text-5xl">
//           {title}
//         </h1>
//         <p className="mb-6 max-w-xl text-sm md:text-base">
//           {description.length > 200
//             ? `${description.substring(0, 200)}...`
//             : description}
//         </p>
//         <div className="flex gap-4">
//           <Link href={`/manga/${featuredManga.id}`}>
//             <Button size="lg" variant="default">
//               {t("manga.readNow")}
//             </Button>
//           </Link>
//           <Link href={`/manga/${featuredManga.id}`}>
//             <Button
//               size="lg"
//               variant="outline"
//               className="bg-transparent text-white hover:bg-white/20 hover:text-white"
//             >
//               {t("common.details")}
//             </Button>
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";
import { buildCoverUrl, getRandomManga } from "@/lib/api";

export default function HeroSection() {
  const { t } = useLanguage();
  const [featuredManga, setFeaturedManga] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRandomManga = async () => {
      setLoading(true);
      try {
        const manga = await getRandomManga();
        setFeaturedManga(manga);
      } catch (error) {
        console.error("Failed to fetch random manga for hero:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRandomManga();
  }, []);

  if (loading) {
    return (
      <div className="relative h-[50vh] w-full overflow-hidden rounded-lg bg-gradient-to-r from-primary-900 to-primary-700 md:h-[60vh]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!featuredManga) {
    return (
      <div className="relative h-[50vh] w-full overflow-hidden rounded-lg bg-gradient-to-r from-primary-900 to-primary-700 md:h-[60vh]">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl lg:text-6xl">
            {t("common.welcome")} {t("common.to")} MangaVerse
          </h1>
          <p className="mb-6 max-w-2xl text-lg md:text-xl">
            {t("common.discover")} {t("common.and")} {t("common.read")}{" "}
            {t("common.the")} {t("common.latest")} {t("common.manga")}
          </p>
          <div className="flex gap-4">
            <Link href="/search">
              <Button size="lg" variant="default">
                {t("common.browse")} {t("common.manga")}
              </Button>
            </Link>
            <Link href="/popular">
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent text-white hover:bg-white/20 hover:text-white"
              >
                {t("common.popular")} {t("common.manga")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const coverRel = featuredManga.relationships?.find(
    (rel: any) => rel.type === "cover_art"
  );
  const coverUrl = buildCoverUrl(featuredManga.id, coverRel || null);
  const titles = featuredManga.attributes?.title || {};
  const title = titles.en || titles[Object.keys(titles)[0]] || "Unknown Title";

  const descriptions = featuredManga.attributes?.description || {};
  const description =
    descriptions.en || descriptions[Object.keys(descriptions)[0]] || "";

  return (
    <div className="relative h-[50vh] w-full overflow-hidden rounded-lg md:h-[60vh]">
      <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 to-primary-700/70"></div>
      <Image
        src={coverUrl || "/placeholder.svg"}
        alt={title}
        fill
        className="object-cover"
        priority
        unoptimized // manga o'zi optimizatsiyadan o'tmagan bo'lishi mumkin
      />
      <div className="absolute inset-0 flex flex-col items-start justify-center p-6 text-white md:p-12">
        <h1 className="mb-2 max-w-2xl text-3xl font-bold md:text-4xl lg:text-5xl">
          {title}
        </h1>
        <p className="mb-6 max-w-xl text-sm md:text-base">
          {description.length > 200
            ? `${description.substring(0, 200)}...`
            : description}
        </p>
        <div className="flex gap-4">
          <Link href={`/manga/${featuredManga.id}`}>
            <Button size="lg" variant="default">
              {t("manga.readNow")}
            </Button>
          </Link>
          <Link href={`/manga/${featuredManga.id}`}>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent text-white hover:bg-white/20 hover:text-white"
            >
              {t("common.details")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
