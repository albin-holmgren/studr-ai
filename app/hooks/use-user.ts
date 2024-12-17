import { useRouteLoaderData } from "@remix-run/react"
import type { User } from "~/lib/types"

export function useUser() {
  const data = useRouteLoaderData("root") as { user: User }
  return data?.user
}
