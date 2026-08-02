import { defineConfig } from "astro/config";
import lune from "./src";

export default defineConfig({
  srcDir: "./tests/fixtures",
  integrations: [
    lune({
      entrypoint: "./tests/fixtures/entrypoint"
    })
  ]
});
