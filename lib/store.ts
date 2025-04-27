import { create } from "zustand"
import { persist } from "zustand/middleware"

export type User = {
  id: string
  email: string
  username: string
  name: string
  avatar?: string
  birthDate?: string
  showAdultContent: boolean
  isAdmin: boolean
}

export type MangaStatus = "reading" | "on_hold" | "plan_to_read" | "dropped" | "re_reading" | "completed"

export type MangaInLibrary = {
  id: string
  status: MangaStatus
  lastReadChapter?: string
  lastReadPage?: number
  dateAdded: string
  dateUpdated: string
}

export type Comment = {
  id: string
  userId: string
  username: string
  avatar?: string
  mangaId: string
  content: string
  createdAt: string
}

export type Like = {
  userId: string
  mangaId: string
}

// Update the ReaderSettings type to include imageQuality
export type ReaderSettings = {
  autoScrollSpeed: number
  infiniteScroll: boolean
  imageQuality: "low" | "medium" | "high"
}

type State = {
  user: User | null
  apiKey: string | null
  library: MangaInLibrary[]
  comments: Comment[]
  likes: Like[]
  readerSettings: ReaderSettings
  theme: "light" | "dark" | "system"
  language: "en" | "ru" | "uz"
  login: (user: User) => void
  logout: () => void
  setApiKey: (key: string) => void
  updateUser: (user: Partial<User>) => void
  addToLibrary: (manga: MangaInLibrary) => void
  updateMangaStatus: (mangaId: string, status: MangaStatus) => void
  updateLastRead: (mangaId: string, chapterId: string, page: number) => void
  removeFromLibrary: (mangaId: string) => void
  addComment: (comment: Comment) => void
  removeComment: (commentId: string) => void
  toggleLike: (mangaId: string) => void
  updateReaderSettings: (settings: Partial<ReaderSettings>) => void
  setTheme: (theme: "light" | "dark" | "system") => void
  setLanguage: (language: "en" | "ru" | "uz") => void
}

export const useStore = create<State>()(
  persist(
    (set) => ({
      user: null,
      apiKey: null,
      library: [],
      comments: [],
      likes: [],
      // Then update the default readerSettings in the store
      readerSettings: {
        autoScrollSpeed: 1,
        infiniteScroll: true,
        imageQuality: "low", // Default to low for better compatibility
      },
      theme: "system",
      language: "en",

      login: (user) => set({ user }),

      logout: () => set({ user: null }),

      setApiKey: (key) => set({ apiKey: key }),

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),

      addToLibrary: (manga) =>
        set((state) => ({
          library: [...state.library.filter((m) => m.id !== manga.id), manga],
        })),

      updateMangaStatus: (mangaId, status) =>
        set((state) => ({
          library: state.library.map((manga) =>
            manga.id === mangaId ? { ...manga, status, dateUpdated: new Date().toISOString() } : manga,
          ),
        })),

      updateLastRead: (mangaId, chapterId, page) =>
        set((state) => ({
          library: state.library.map((manga) =>
            manga.id === mangaId
              ? {
                  ...manga,
                  lastReadChapter: chapterId,
                  lastReadPage: page,
                  dateUpdated: new Date().toISOString(),
                }
              : manga,
          ),
        })),

      removeFromLibrary: (mangaId) =>
        set((state) => ({
          library: state.library.filter((manga) => manga.id !== mangaId),
        })),

      addComment: (comment) =>
        set((state) => ({
          comments: [...state.comments, comment],
        })),

      removeComment: (commentId) =>
        set((state) => ({
          comments: state.comments.filter((comment) => comment.id !== commentId),
        })),

      toggleLike: (mangaId) =>
        set((state) => {
          if (!state.user) return state

          const userId = state.user.id
          const existingLike = state.likes.find((like) => like.userId === userId && like.mangaId === mangaId)

          return {
            likes: existingLike
              ? state.likes.filter((like) => !(like.userId === userId && like.mangaId === mangaId))
              : [...state.likes, { userId, mangaId }],
          }
        }),

      updateReaderSettings: (settings) =>
        set((state) => ({
          readerSettings: { ...state.readerSettings, ...settings },
        })),

      setTheme: (theme) => set({ theme }),

      setLanguage: (language) => set({ language }),
    }),
    {
      name: "manga-verse-storage",
    },
  ),
)
