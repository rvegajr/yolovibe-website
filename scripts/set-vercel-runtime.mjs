// @astrojs/vercel for Astro 4 only knows Node 18 and 20. On any newer Node it
// writes "nodejs18.x", which Vercel no longer accepts, so stamp the runtime of
// the Node that ran the build into every function config.
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const runtime = `nodejs${process.versions.node.split(".")[0]}.x`;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      walk(path);
    } else if (name === ".vc-config.json") {
      const config = JSON.parse(readFileSync(path, "utf8"));
      if (config.runtime?.startsWith("nodejs") && config.runtime !== runtime) {
        console.log(`${path}: ${config.runtime} -> ${runtime}`);
        config.runtime = runtime;
        writeFileSync(path, JSON.stringify(config, null, 2));
      }
    }
  }
}

const functions = ".vercel/output/functions";
if (existsSync(functions)) walk(functions);
