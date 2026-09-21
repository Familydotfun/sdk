import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["cjs", "esm"],
  sourcemap: true,
  clean: true,
  outDir: "dist",
  // Declarations are emitted separately by `tsc` (see build script).
  dts: false,
});
