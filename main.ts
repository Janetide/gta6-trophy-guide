// gta6-trophy-guide: entry program.
//
// Copies the guide (app/) and its screenshots (screenshots/) from this
// repository into the output directory, then writes dossier.json there with
// the kit's buildDossier library. Node 22, standard library only.
//
// The output directory comes from MAKEFUN_OUTPUT_DIR, or /output when that
// is unset. The directory itself is never removed: it is created when
// missing and only its contents are cleared, so a second run over files
// copied in read-only still succeeds.

import { chmodSync, cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

// Caps from the competition gate: dossier text, screenshots, app size.
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
} as const;

// Where this program lives is the repository root, whatever the cwd is.
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)));

function outputDir(): string {
  const fromEnv = process.env.MAKEFUN_OUTPUT_DIR;
  return resolve(fromEnv && fromEnv.trim() !== "" ? fromEnv : "/output");
}

// Make every entry below a directory writable, then remove it. Copied
// files arrive read-only, so plain removal would fail a second run.
function makeWritableDeep(target: string): void {
  const info = statSync(target, { throwIfNoEntry: false });
  if (!info) return;
  if (info.isDirectory()) {
    for (const child of readdirSync(target)) makeWritableDeep(join(target, child));
    chmodSync(target, 0o755);
  } else {
    chmodSync(target, 0o644);
  }
}

function clearContents(dir: string): void {
  mkdirSync(dir, { recursive: true });
  for (const child of readdirSync(dir)) {
    const path = join(dir, child);
    makeWritableDeep(path);
    rmSync(path, { recursive: true, force: true });
  }
}

function copyEntry(name: string, fromRoot: string, toRoot: string): void {
  const from = join(fromRoot, name);
  const to = join(toRoot, name);
  if (!existsSync(from)) throw new Error(`main: missing ${name}/ in ${fromRoot}`);
  cpSync(from, to, { recursive: true });
}

// Fail fast when the guide's entry page is missing, before anything is
// copied, so a broken repo never produces a half-written output.
function checkEntryPage(repoRoot: string): void {
  const page = join(repoRoot, "app", "index.html");
  if (!existsSync(page)) throw new Error(`main: missing app/index.html in ${repoRoot}`);
}

function main(): void {
  const out = outputDir();
  checkEntryPage(REPO_ROOT);
  clearContents(out);
  copyEntry("app", REPO_ROOT, out);
  copyEntry("screenshots", REPO_ROOT, out);
  const dossier = buildDossier(out, DOSSIER_CAPS);
  writeFileSync(join(out, "dossier.json"), dossier);
  const written = statSync(join(out, "dossier.json")).size;
  console.log(`wrote ${out} (app, screenshots, dossier.json ${written} bytes)`);
}

main();
