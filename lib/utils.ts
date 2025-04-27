import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(input: string | number | Date): string {
  const date = new Date(input);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function truncate(str: string, length: number): string {
  if (!str) return "";
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function isAdult(birthDate: Date): boolean {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age >= 18;
}

export function getImageUrl(coverArt: any): string {
  if (!coverArt || !coverArt.attributes) {
    // For sample manga with simple structure
    if (coverArt && coverArt.type === "cover_art" && coverArt.id) {
      return `/placeholder.svg?height=400&width=300&text=${coverArt.id}`;
    }
    return "/placeholder.svg?height=400&width=300";
  }

  try {
    const fileName = coverArt.attributes.fileName;
    if (!fileName) return "/placeholder.svg?height=400&width=300";

    // For direct cover art relationship
    if (coverArt.type === "cover_art") {
      // For sample data
      if (fileName === "sample-cover.jpg") {
        return "https://uploads.mangadex.org/covers/32d76d19-8a05-4db0-9fc2-e0b0648fe9d0/sample-cover.jpg";
      }
      if (fileName === "sample-cover-2.jpg") {
        return "https://uploads.mangadex.org/covers/a96676e5-8ae2-425e-b549-7f15dd34a6d8/sample-cover-2.jpg";
      }
      if (fileName === "sample-cover-3.jpg") {
        return "https://uploads.mangadex.org/covers/37f5cce0-8070-4ada-96e5-fa24b1bd4861/sample-cover-3.jpg";
      }

      const mangaId = coverArt.relationships?.find(
        (rel: any) => rel.type === "manga"
      )?.id;
      if (mangaId) {
        return `https://uploads.mangadex.org/covers/${mangaId}/${fileName}`;
      }
    }

    // For cover art in manga relationships
    const mangaId = coverArt.id;
    if (mangaId) {
      return `https://uploads.mangadex.org/covers/${mangaId}/${fileName}`;
    }

    return "/placeholder.svg?height=400&width=300";
  } catch (error) {
    console.error("Error generating image URL:", error);
    return "/placeholder.svg?height=400&width=300";
  }
}

export const mangaStatuses = [
  { value: "reading", label: "Reading" },
  { value: "on_hold", label: "On Hold" },
  { value: "plan_to_read", label: "Plan to Read" },
  { value: "dropped", label: "Dropped" },
  { value: "re_reading", label: "Re-reading" },
  { value: "completed", label: "Completed" },
];

export const languages = [
  { value: "en", label: "English" },
  { value: "ru", label: "Russian" },
  { value: "uz", label: "Uzbek" },
];
