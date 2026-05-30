import { copyFileSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const clientRoot = resolve(currentDir, "..");
const repoRoot = resolve(clientRoot, "..");
const sourceDir = resolve(repoRoot, "dist/story-data");
const targetDir = resolve(clientRoot, "assets/resources/story-data");

mkdirSync(targetDir, { recursive: true });

for (const fileName of readdirSync(sourceDir)) {
  if (fileName.endsWith(".json")) {
    copyFileSync(resolve(sourceDir, fileName), resolve(targetDir, fileName));
  }
}

console.log(`Synced story data from ${sourceDir} to ${targetDir}`);
