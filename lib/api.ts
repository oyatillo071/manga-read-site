const BASE_URL = "https://api.mangadex.org";

// Store the API key as a constant
const DEFAULT_API_KEY = process.env.NEXT_PUBLIC_MANGA_KEY;

// Add this at the top of the file
const FALLBACK_COVER_URL = "/placeholder.svg?height=400&width=300";

export function buildCoverUrl(
  mangaId: string,
  coverArt: { attributes: { fileName: string } } | null,
  size?: 300 | 600
): string {
  if (!coverArt || !coverArt.attributes?.fileName) {
    return FALLBACK_COVER_URL;
  }
  const { fileName } = coverArt.attributes;
  // Replace api. with uploads. to form static URL
  const base = BASE_URL.replace("api.", "uploads.");
  let url = `${base}/covers/${mangaId}/${fileName}`;
  if (size) url += `.${size}.jpg`;
  return url;
}
// Helper function to get API key (from store or use default)
function getApiKey() {
  try {
    const storedKey =
      typeof window !== "undefined" &&
      localStorage.getItem("manga-verse-storage")
        ? JSON.parse(localStorage.getItem("manga-verse-storage") || "{}")?.state
            ?.apiKey
        : null;

    return storedKey || DEFAULT_API_KEY;
  } catch (error) {
    return DEFAULT_API_KEY;
  }
}

// Direct API fetch function - prioritize API data over fallbacks
async function fetchFromApi(url: string, options: RequestInit = {}) {
  try {
    // Add API key to headers if available
    const apiKey = getApiKey();
    if (apiKey) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${apiKey}`,
      };
    }

    console.log(`Fetching from: ${url}`);
    const response = await fetch(url, options);

    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Network Error:", error);
    throw error;
  }
}

// Get featured manga
export async function getFeaturedManga(limit = 12) {
  try {
    const data = await fetchFromApi(
      `${BASE_URL}/manga?limit=${limit}&includes[]=cover_art&includes[]=author&order[followedCount]=desc&contentRating[]=safe`,
      { cache: "no-store" }
    );
    return data.data || [];
  } catch (error) {
    console.error("Error fetching featured manga:", error);
    return [];
  }
}

// Get popular manga
export async function getPopularManga(limit = 12) {
  try {
    const data = await fetchFromApi(
      `${BASE_URL}/manga?limit=${limit}&includes[]=cover_art&includes[]=author&order[rating]=desc&contentRating[]=safe`,
      { cache: "no-store" }
    );
    return data.data || [];
  } catch (error) {
    console.error("Error fetching popular manga:", error);
    return [];
  }
}

// Get recently updated manga
export async function getRecentlyUpdatedManga(limit = 12) {
  try {
    const data = await fetchFromApi(
      `${BASE_URL}/manga?limit=${limit}&includes[]=cover_art&includes[]=author&order[updatedAt]=desc&contentRating[]=safe`,
      { cache: "no-store" }
    );
    return data.data || [];
  } catch (error) {
    console.error("Error fetching recently updated manga:", error);
    return [];
  }
}

// Get manga by ID
export async function getMangaById(id: string) {
  try {
    const data = await fetchFromApi(
      `${BASE_URL}/manga/${id}?includes[]=cover_art&includes[]=author&includes[]=artist&includes[]=tag`,
      { cache: "no-store" }
    );
    return data.data;
  } catch (error) {
    console.error("Error fetching manga details:", error);
    return null;
  }
}

// Get manga chapters
export async function getMangaChapters(
  mangaId: string,
  translatedLanguage = "en"
) {
  try {
    const data = await fetchFromApi(
      `${BASE_URL}/manga/${mangaId}/feed?translatedLanguage[]=${translatedLanguage}&order[volume]=desc&order[chapter]=desc&includes[]=scanlation_group`,
      { cache: "no-store" }
    );
    return data.data || [];
  } catch (error) {
    console.error("Error fetching manga chapters:", error);
    return [];
  }
}

// Get chapter pages
export async function getChapterPages(chapterId: string) {
  try {
    // First try with authentication
    const apiKey = getApiKey();
    const options: RequestInit = {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      cache: "no-store",
    };

    // Try to fetch with authentication first
    let response = await fetch(
      `${BASE_URL}/at-home/server/${chapterId}`,
      options
    );

    // If that fails, try without authentication as a fallback
    if (!response.ok) {
      console.warn(
        `Authenticated request failed for chapter ${chapterId}, trying without auth`
      );
      response = await fetch(`${BASE_URL}/at-home/server/${chapterId}`, {
        cache: "no-store",
      });
    }

    if (!response.ok) {
      console.error(
        `Failed to fetch chapter pages: ${response.status} ${response.statusText}`
      );
      throw new Error(`Failed to fetch chapter pages: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching chapter pages:", error);
    throw error;
  }
}

// Search manga
export async function searchManga(
  query: string,
  limit = 20,
  offset = 0,
  filters: any = {}
) {
  try {
    let url = `${BASE_URL}/manga?limit=${limit}&offset=${offset}&includes[]=cover_art&includes[]=author`;

    if (query) {
      url += `&title=${encodeURIComponent(query)}`;
    }

    // Add content rating filter
    if (filters.contentRating && filters.contentRating.length) {
      filters.contentRating.forEach((rating: string) => {
        url += `&contentRating[]=${rating}`;
      });
    } else {
      url += "&contentRating[]=safe";
    }

    // Add status filter
    if (filters.status && filters.status.length) {
      filters.status.forEach((status: string) => {
        url += `&status[]=${status}`;
      });
    }

    // Add tags filter
    if (filters.includedTags && filters.includedTags.length) {
      filters.includedTags.forEach((tag: string) => {
        url += `&includedTags[]=${tag}`;
      });
    }

    const data = await fetchFromApi(url, { cache: "no-store" });
    return data;
  } catch (error) {
    console.error("Error searching manga:", error);
    return { data: [], total: 0 };
  }
}

// Get random manga
export async function getRandomManga() {
  try {
    const data = await fetchFromApi(
      `${BASE_URL}/manga/random?includes[]=cover_art&includes[]=author`,
      {
        cache: "no-store",
      }
    );
    return data.data;
  } catch (error) {
    console.error("Error fetching random manga:", error);
    return null;
  }
}

// Get manga tags/genres
export async function getMangaTags() {
  try {
    const data = await fetchFromApi(`${BASE_URL}/manga/tag`, {
      cache: "no-store",
    });
    return data.data || [];
  } catch (error) {
    console.error("Error fetching manga tags:", error);
    return [];
  }
}

// Get manga by tag
export async function getMangaByTag(tagId: string, limit = 20, offset = 0) {
  try {
    const data = await fetchFromApi(
      `${BASE_URL}/manga?limit=${limit}&offset=${offset}&includes[]=cover_art&includes[]=author&includedTags[]=${tagId}&contentRating[]=safe`,
      { cache: "no-store" }
    );
    return data;
  } catch (error) {
    console.error("Error fetching manga by tag:", error);
    return { data: [], total: 0 };
  }
}

// Check API Key
export async function checkApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/manga?limit=1`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    return response.ok;
  } catch (error) {
    console.error("Error validating API key:", error);
    return false;
  }
}
