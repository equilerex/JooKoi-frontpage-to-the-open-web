# Decision 034 — Stop-hook formatter covers md and yaml; items.yaml prettier-ignored

Date: 29-09-2026 03:24

Status: DECIDED

<!-- Status is one of: DECIDED | TRIAL | REJECTED | DEFERRED | SUPERSEDED
     A superseding decision gets its own number. The superseded file's status changes
     and its body gains a pointer. A decision already stated in ARCHITECTURE.md or
     AGENTS.md is folded in and the file deleted instead.
     All five sections below are required. -->

## Problem

`pnpm run format:check` failed on 11 `.md` and `.yaml` files. The Stop hook `scripts/lint-changed.mjs` only formatted `ts|html|css|scss|mjs|js|json`, so Markdown and YAML edits were never formatted and the check broke.

## Options considered

- Extend the hook filter to `md|ya?ml`.
- Add a git `pre-commit` hook (husky or lint-staged). Also catches edits made outside a session, but adds a dependency.

## Decision

Extend the hook filter to `md|ya?ml`. Add `_architecture/items.yaml` to `.prettierignore`: the paper-trail script owns it and rewrites it unformatted, so formatting it would fail again after every write.

## Why not the alternatives

A pre-commit hook needs a new package (minimal-dependencies rule) and was not asked for. Still open: edits made outside a Claude session are not formatted.

## Next step

None unless a format:check failure reappears from hand edits; then reconsider a pre-commit hook.
