import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://michaeldolejs.com",
  trailingSlash: "never",
  build: { format: "directory" },
});
