import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

interface FavoriteNote {
  id: string
  title: string
  emoji: string
  workspaceId: string
}

interface FavoritesStore {
  favorites: FavoriteNote[]
  addFavorite: (note: FavoriteNote) => void
  removeFavorite: (noteId: string) => void
  isFavorite: (noteId: string) => boolean
}

// Check if window is defined to handle server-side rendering
const isServer = typeof window === "undefined"

export const useFavorites = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (note) =>
        set((state) => ({
          favorites: [...state.favorites, note],
        })),
      removeFavorite: (noteId) =>
        set((state) => ({
          favorites: state.favorites.filter((note) => note.id !== noteId),
        })),
      isFavorite: (noteId) =>
        get().favorites.some((note) => note.id === noteId),
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
