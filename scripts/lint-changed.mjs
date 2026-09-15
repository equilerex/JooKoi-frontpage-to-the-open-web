// Stop hook: formats and lints the files this session changed.
//
// AGENTS.md makes lint and format automatic precisely so they are never a task
// step and never run by hand. This is that mechanism.
//
// Changed files only. A repo-wide run reports on code the session never
// touched, which trains the reader to ignore it — and it is why `pnpm run
// format` is banned here: with no .prettierignore it rewrites pnpm-lock.yaml.
//
// Never exits non-zero. A Stop hook that fails blocks the turn, and a
// formatting complaint is not worth trapping an agent mid-task over; the
// report goes to stdout and the work continues.

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const CODE = /\.(?:ts|html|css|scss|mjs|js|json)$/;
const SKIP = /(?:^|\/)(?:pnpm-lock\.yaml|package-lock\.json|dist|\.angular)\//;

// Windows cannot spawn a `.cmd` shim without a shell, so every command goes
// through one — which means building the line as a string, not as argv.
const localBin = (name) => {
  const path = join(
    root,
    'node_modules',
    '.bin',
    name + (process.platform === 'win32' ? '.cmd' : ''),
  );
  return `"${path}"`;
};

const git = (args) => {
  const out = spawnSync(`git ${args}`, { cwd: root, shell: true, encoding: 'utf8' });
  return out.status === 0 ? (out.stdout ?? '').split('\n') : [];
};

const files = [
  ...new Set([...git('diff --name-only HEAD'), ...git('ls-files --others --exclude-standard')]),
]
  .map((file) => file.trim())
  .filter(
    (file) => file !== '' && CODE.test(file) && !SKIP.test(file) && existsSync(join(root, file)),
  );

if (files.length === 0) process.exit(0);

const quoted = files.map((file) => `"${file}"`).join(' ');
const prettier = spawnSync(`${localBin('prettier')} --write ${quoted}`, {
  cwd: root,
  shell: true,
  encoding: 'utf8',
});

const lintable = files.filter((file) => /\.(?:ts|html)$/.test(file));
const eslint =
  lintable.length > 0
    ? spawnSync(`${localBin('eslint')} ${lintable.map((f) => `"${f}"`).join(' ')}`, {
        cwd: root,
        shell: true,
        encoding: 'utf8',
      })
    : null;

if (eslint && eslint.status !== 0) {
  process.stdout.write(
    `lint-changed: eslint reported problems in the files this session touched. Formatting was applied; no fix was attempted.\n${eslint.stdout ?? ''}${eslint.stderr ?? ''}`,
  );
} else if (prettier.status !== 0) {
  process.stdout.write(`lint-changed: prettier failed.\n${prettier.stderr ?? ''}`);
} else {
  process.stdout.write(
    `lint-changed: formatted and linted ${files.length} changed file(s), clean.\n`,
  );
}
