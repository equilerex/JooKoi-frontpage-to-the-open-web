// PreToolUse hook: refuses production build commands.
//
// AGENTS.md puts production builds outside the agent loop entirely and gives
// them to CI. That rule is one sentence, and it lost once already: a subagent
// has no browser tools, so its only feedback loop was the build, and it
// reached for the build even when the brief said not to. Prose loses to
// incentives. This is the mechanism instead of the sentence.
//
// It denies rather than warns. A warning reaches the caller as a suggestion,
// and the caller it is aimed at is the one ignoring the suggestion. The
// escape hatch is a file, not a flag, so it is a deliberate act rather than a
// reflex.
//
// Fail-open by design: anything this script cannot parse is allowed through.
// A guardrail that wedges the session on a malformed input is worse than the
// behaviour it prevents.

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

if (existsSync(join(root, '.claude', 'allow-build'))) process.exit(0);

let command = '';
try {
  command = JSON.parse(readFileSync(0, 'utf8'))?.tool_input?.command ?? '';
} catch {
  process.exit(0);
}
if (typeof command !== 'string' || command === '') process.exit(0);

// A command line is a list of commands joined by separators. Check each one at
// its start, so a build mentioned inside an echo or a grep is not a build.
//
// Quoted spans are emptied first. A quote commonly contains a separator and a
// build at once — a commit message, a test fixture, a JSON payload — and
// without this the guard denies the call that merely describes a build. That
// false positive is not hypothetical: it denied the first run of this script's
// own test suite.
const startsWithBuild = (segment) => {
  const stripped = segment.trim().replace(/^(?:[A-Za-z_][A-Za-z0-9_]*=\S*\s+)+/, '');
  return (
    /^(?:npx\s+)?ng\s+build\b/.test(stripped) ||
    /^(?:pnpm|npm|yarn|bun)\s+(?:run\s+)?(?:build|watch)\b/.test(stripped)
  );
};

const unquoted = command.replace(/'[^']*'/g, "''").replace(/"[^"]*"/g, '""');
const isBuild = unquoted.split(/&&|\|\||[;\n|]/).some(startsWithBuild);

if (!isBuild) process.exit(0);

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason:
        'Production builds are outside the agent loop in this repo — CI runs them, and the running dev server is the feedback loop to use instead (AGENTS.md, "Iteration loop"). If the work itself is the build — bundle analysis, budget tuning, prerender debugging — create .claude/allow-build and run the command again.',
    },
  }) + '\n',
);
