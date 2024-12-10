import { defineConfig } from "vite"
import { remixConfig } from "@remix-run/dev"
import { resolve } from "path"

export default defineConfig({
  ...remixConfig,
  resolve: {
    alias: {
      "~": resolve(__dirname, "./app")
    }
  }
})