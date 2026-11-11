import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

// Server actions can be called by anyone who can reach the site, whatever the UI shows.
// These tests read the source and fail if an action or page does not check access first.

const ROOT = path.resolve(__dirname, '../../app');
const ADMIN_GUARD = /await requireRole\(/;
const MEMBER_GUARD = /await require(Member|User)\(/;

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const FUNCTION_START = /async function (\w+)\([^)]*\)[^{]*\{\s*\n\s*([^\n]+)/g;

/** Local helpers whose own first statement is a guard, such as checkChange() in users/actions.ts. */
function guardedHelpers(source: string, guard: RegExp) {
  const names = new Set<string>();
  for (const match of source.matchAll(FUNCTION_START)) if (guard.test(match[2])) names.add(match[1]);
  return names;
}

/** Each exported async function in a 'use server' file, and whether its first statement is a guard. */
function serverActions(file: string, guard: RegExp) {
  const source = fs.readFileSync(file, 'utf8');
  if (!/^'use server';/m.test(source)) return [];
  const helpers = [...guardedHelpers(source, guard)];
  const found: { name: string; first: string; guarded: boolean }[] = [];
  for (const match of source.matchAll(/export async function (\w+)\([^)]*\)[^{]*\{\s*\n\s*([^\n]+)/g)) {
    const first = match[2];
    const viaHelper = helpers.some((name) => first.includes(`await ${name}(`));
    found.push({ name: match[1], first, guarded: guard.test(first) || viaHelper });
  }
  return found;
}

/** Server functions declared inline in a page with a 'use server' directive. */
function inlineActions(file: string) {
  const source = fs.readFileSync(file, 'utf8');
  return [...source.matchAll(/async function (\w+)\([^)]*\)[^{]*\{\s*\n\s*'use server';\s*\n\s*([^\n]+)/g)].map((m) => ({ name: m[1], first: m[2] }));
}

const files = walk(ROOT);
const inAdmin = (f: string) => f.includes(`${path.sep}admin${path.sep}`);
const adminActionFiles = files.filter((f) => inAdmin(f) && f.endsWith('actions.ts'));
const builderActionFiles = files.filter((f) => f.includes(`${path.sep}builder${path.sep}actions${path.sep}`) && f.endsWith('.ts'));
const adminPages = files.filter((f) => f.includes(`${path.sep}admin${path.sep}(protected)${path.sep}`) && f.endsWith('page.tsx'));

describe('admin server actions', () => {
  it('finds the action files', () => {
    expect(adminActionFiles.length).toBeGreaterThan(10);
  });

  for (const file of adminActionFiles) {
    for (const action of serverActions(file, ADMIN_GUARD)) {
      it(`${path.relative(ROOT, file)}: ${action.name} checks the admin role first`, () => {
        expect(action.guarded, action.first).toBe(true);
      });
    }
  }

  for (const file of adminPages) {
    for (const action of inlineActions(file)) {
      it(`${path.relative(ROOT, file)}: inline ${action.name} checks the admin role first`, () => {
        expect(action.first).toMatch(ADMIN_GUARD);
      });
    }
  }
});

describe('admin pages', () => {
  for (const file of adminPages) {
    it(`${path.relative(ROOT, file)} calls requireRole`, () => {
      expect(fs.readFileSync(file, 'utf8')).toMatch(ADMIN_GUARD);
    });
  }
});

describe('builder portal server actions', () => {
  it('finds the action files', () => {
    expect(builderActionFiles.length).toBeGreaterThan(4);
  });

  for (const file of builderActionFiles) {
    for (const action of serverActions(file, MEMBER_GUARD)) {
      it(`${path.relative(ROOT, file)}: ${action.name} checks the member first`, () => {
        expect(action.guarded, action.first).toBe(true);
      });
    }
  }

  it('never grants admin rights from a member guard', () => {
    const code = fs
      .readFileSync(path.resolve(__dirname, '../member.ts'), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');
    expect(code).not.toMatch(/requireRole|adminUser\.(create|update|upsert)/);
  });
});

describe('admin-only areas', () => {
  const adminOnly = ['rewards', 'achievements', 'rules', 'privacy', 'audit', 'settings', 'users'];
  for (const area of adminOnly) {
    const areaFiles = files.filter((f) => f.includes(`${path.sep}(protected)${path.sep}${area}${path.sep}`));
    for (const file of areaFiles) {
      it(`${area}/${path.basename(file)} requires the ADMIN role`, () => {
        const calls = [...fs.readFileSync(file, 'utf8').matchAll(/requireRole\(([^)]*)\)/g)].map((m) => m[1]);
        expect(calls.length).toBeGreaterThan(0);
        for (const args of calls) expect(args).toContain("'ADMIN'");
      });
    }
  }
});
