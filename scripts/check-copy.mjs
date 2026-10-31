#!/usr/bin/env node
// Scans the repo for em dashes, en dashes, emojis and banned phrases.
// Usage: node scripts/check-copy.mjs [paths...]
// With no paths it scans the default roots below.
// Exit code 1 if any error-level issue is found. Warnings are printed only.
//
// To exempt a block (for example a list of banned words in documentation),
// put a line containing check-copy:off before it and check-copy:on after it.
import fs from 'node:fs';
import path from 'node:path';
import { findCopyIssues } from './copy-rules.mjs';

const DEFAULT_ROOTS = ['src', 'docs', 'prisma', 'tasks', 'scripts', 'CLAUDE.md', 'BUILD_PROMPT.md', 'README.md'];
const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'dist', 'build', 'coverage', 'public', 'generated', '.vercel', '.amplify']);
const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.md', '.mdx', '.json', '.css', '.html', '.txt', '.prisma', '.yml', '.yaml']);
const SKIP_FILES = new Set(['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock']);

function collect(target, out) {
  if (!fs.existsSync(target)) return;
  const stat = fs.statSync(target);
  if (stat.isDirectory()) {
    if (SKIP_DIRS.has(path.basename(target))) return;
    for (const entry of fs.readdirSync(target)) collect(path.join(target, entry), out);
  } else if (EXTENSIONS.has(path.extname(target)) && !SKIP_FILES.has(path.basename(target))) {
    out.push(target);
  }
}

function scanFile(file) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const results = [];
  let off = false;
  lines.forEach((line, i) => {
    if (line.includes('check-copy:off')) { off = true; return; }
    if (line.includes('check-copy:on')) { off = false; return; }
    if (off) return;
    for (const issue of findCopyIssues(line)) {
      results.push({ ...issue, file, line: i + 1, col: issue.index + 1, text: line.trim() });
    }
  });
  return results;
}

const roots = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_ROOTS;
const files = [];
roots.forEach((r) => collect(r, files));

const all = files.flatMap(scanFile);
const errors = all.filter((r) => r.level === 'error');
const warnings = all.filter((r) => r.level === 'warn');

for (const r of [...errors, ...warnings]) {
  const tag = r.level === 'error' ? 'ERROR' : 'warn ';
  console.log(`${tag} ${r.file}:${r.line}:${r.col}  ${r.message}`);
  console.log(`      ${r.text.slice(0, 140)}`);
}

console.log(`\nchecked ${files.length} files: ${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
