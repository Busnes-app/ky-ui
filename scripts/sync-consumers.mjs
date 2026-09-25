import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(await readFile(join(packageRoot, "package.json"), "utf8"));
const rootArg = process.argv.find((arg) => arg.startsWith("--root="));
const consumerRoot = resolve(rootArg ? rootArg.slice("--root=".length) : join(packageRoot, ".."));
const checkOnly = process.argv.includes("--check");
const consumers = {
  "kybookmarks-server": "frontend/src/ky-ui",
  "kydns-server": "internal/web/static/ky-ui",
  "kyrecovery-server": "internal/server/static/ky-ui",
  "kysignon-server": "web/src/ky-ui",
  "kyvault-audit": "frontend/src/ky-ui",
  "kynotes-server": "web/src/ky-ui",
  "kypost-server": "frontend/src/ky-ui",
};
const version = `${packageJson.version}\n`;
const files = ["tokens.css", "navigation.css"];
let failures = 0;

for (const [repo, relativeTarget] of Object.entries(consumers)) {
  const target = join(consumerRoot, repo, relativeTarget);
  if (!checkOnly) await mkdir(target, { recursive: true });
  for (const file of files) {
    const source = join(packageRoot, "src", file);
    const destination = join(target, file);
    if (checkOnly) {
      try {
        const [actual, expected] = await Promise.all([readFile(destination, "utf8"), readFile(source, "utf8")]);
        if (actual !== expected) { console.error(`${repo}: ${file} is out of date`); failures++; }
      } catch { console.error(`${repo}: ${file} is missing`); failures++; }
    } else await cp(source, destination);
  }
  const versionFile = join(target, "VERSION");
  if (checkOnly) {
    try { if (await readFile(versionFile, "utf8") !== version) { console.error(`${repo}: VERSION is out of date`); failures++; } }
    catch { console.error(`${repo}: VERSION is missing`); failures++; }
  } else await writeFile(versionFile, version);
}
if (failures) process.exitCode = 1;
