import { defineConfig } from "tsdown";

export default defineConfig({
  deps: {
    alwaysBundle: [],
    onlyBundle: [],
    neverBundle: ["astro"]
  },
  dts: { generator: "oxc" },
  format: ["cjs", "esm"],
  target: "esnext"
});
