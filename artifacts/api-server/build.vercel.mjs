/**
 * Vercel-specific esbuild config.
 *
 * Bundles api/index.ts (Express serverless handler) into api/index.js,
 * inlining all workspace packages and npm dependencies so the output is
 * a single self-contained file Vercel can deploy without further bundling.
 *
 * pino-http is NOT used with transports in production (NODE_ENV=production),
 * so pino writes directly to stdout without any worker threads.
 * We therefore skip esbuildPluginPino to avoid extra worker files being
 * emitted into api/ and treated as separate Vercel function routes.
 */
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";

globalThis.require = createRequire(import.meta.url);

const artifactDir = path.dirname(fileURLToPath(import.meta.url));

async function buildVercel() {
  const result = await esbuild({
    entryPoints: [path.resolve(artifactDir, "api/index.ts")],
    platform: "node",
    bundle: true,
    format: "esm",
    outfile: path.resolve(artifactDir, "api/index.js"),
    logLevel: "info",
    // Only externalize true native binaries / optional native add-ons
    external: [
      "*.node",
      "bufferutil",
      "utf-8-validate",
      "cpu-features",
      "kerberos",
      "mongodb-client-encryption",
    ],
    sourcemap: false,
    // Suppress warnings about dynamic requires inside bundled packages
    logOverride: {
      "unsupported-dynamic-import": "silent",
      "require-resolve-not-external": "silent",
    },
    banner: {
      js: `import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';
globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);
`,
    },
  });

  if (result.errors.length > 0) {
    console.error("Build errors:", result.errors);
    process.exit(1);
  }

  console.log("✅  Vercel handler bundled → api/index.js");
}

buildVercel().catch((err) => {
  console.error(err);
  process.exit(1);
});
