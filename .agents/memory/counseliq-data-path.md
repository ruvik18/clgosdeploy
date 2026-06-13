---
name: CounselIQ JSON data path resolution
description: API server esbuild bundles src/ into dist/index.mjs; JSON data files are NOT bundled and must be reached via ../src/data/ relative path from dist/.
---

The api-server esbuild build (build.mjs) produces dist/index.mjs as a single bundle. JSON data files in src/data/ are NOT copied or bundled. The banner sets globalThis.__dirname to the dist/ directory.

**Fix:** In src/data/loader.ts, use:
```ts
const DATA_DIR = resolve(__dirname, "../src/data");
```
This navigates from dist/ up one level and into src/data/.

**Why:** esbuild bundles TS into dist/index.mjs but doesn't handle non-JS assets. Since JSON files are loaded at runtime with readFileSync, they stay at src/data/.

**How to apply:** Any new JSON data files should go in artifacts/api-server/src/data/ and be accessed via the loader.ts DATA_DIR constant.
