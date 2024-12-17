import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

interface FavoritesStore {
  favoriteIds: string[]
  addFavorite: (noteId: string) => void
  removeFavorite: (noteId: string) => void
  isFavorite: (noteId: string) => boolean
}

// Check if window is defined to handle server-side rendering
const isServer = typeof window === "undefined"

export const useFavorites = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favoriteIds: [],
      addFavorite: (noteId) =>
        set((state) => ({
          favoriteIds: [...state.favoriteIds, noteId],
        })),
      removeFavorite: (noteId) =>
        set((state) => ({
          favoriteIds: state.favoriteIds.filter((id) => id !== noteId),
        })),
      isFavorite: (noteId) =>
        get().favoriteIds.includes(noteId),
    }),
    {
      name: "favorites-storage",
      storage: isServer
        ? createJSONStorage(() => ({
            getItem: () => null,
            setItem: () => null,
            removeItem: () => null,
          }))
        : createJSONStorage(() => localStorage),
    }
  )
)
