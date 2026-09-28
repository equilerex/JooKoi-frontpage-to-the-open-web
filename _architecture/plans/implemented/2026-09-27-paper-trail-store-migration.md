# Paper-trail store migration

Session: 27-09-2026 16:52. Status: complete. Decisions triaged (9 kept in plans/decision-history/, 28 deleted or folded into live docs), finished plans moved to plans/implemented/.

## Context

The current `jookoi-paper-trail` script reads `_architecture/items.yaml`. This repo is still on the legacy layout: `_architecture/items.json` (v2 store, 65 items: 3 now, 38 parked, 22 done, 2 dropped), `_architecture/TODO.md` (context header only), `_architecture/plans/decisions/` (37 ADRs, 001 to 037). Result: `count` reports `now 0 parked 0`, and every "park it with the script" rule in `AGENTS.md` silently writes nowhere, or worse, would start a second store in `items.yaml` beside the JSON one.

The procedure is the skill's `references/legacy-migration.md`. This plan records the repo-specific scope and the calls that procedure leaves open. It does not restate the procedure.

## Scope

| Legacy artifact | Target | Notes |
|---|---|---|
| `_architecture/items.json` | `_architecture/items.yaml` | Field-by-field conversion per the reference. `repo: jookoi-frontpage-to-the-open-web`. All 65 items kept with their IDs. Done and dropped items stay in the store until the first `flush`. |
| `_architecture/TODO.md` | `ARCHITECTURE.md` or `AGENTS.md` | Its one Context paragraph is standing context. Most of it is already in `AGENTS.md` (Stage line) and `ARCHITECTURE.md`. Fold the rest (perf status, CI Lighthouse `continue-on-error` note) where it belongs, then delete. |
| `_architecture/BACKLOG.md` | none | Already deleted in the working tree. Confirm nothing in it is missing from `items.json` via `find` on its last committed version. |
| `_architecture/plans/decisions/` (37 files) | live docs or `plans/decision-history/` | Classified per the reference's table. See "Decision triage" below. |
| `_architecture/archive/2026-09.md`, `archive/index.md` | stay | Flushed TODO history in markdown. Not an items archive, the reference does not convert it. |
| References to the old paths | current layout | 12 hits for `items.json`, `BACKLOG.md`, `TODO.md`, `plans/decisions` in `AGENTS.md`, `ARCHITECTURE.md`, `.agents/context/*.md`. About 300 "decision NNN" / "ADR NNN" mentions across the repo, handled per file during decision triage. |

## Decision triage

37 files is the bulk of the work and the reason this is a plan rather than a one-turn chore. Expected shape, to be confirmed file by file:

- Integrated or Promote: most of 003 to 015 (stack, layout, styles, testing, state), whose rules already live in `ARCHITECTURE.md`, `engineering-guidelines.md` and folder `CONTEXT.md` files.
- Redundant or superseded: 017 (hand-written fixture) once `2026-09-27-sources-data-pipeline` lands, 020 (reversed by the q-no-longer-filters call recorded in parked item t036), 024 (superseded by 028).
- Keep in `decision-history/`: the ones with rejected alternatives nobody would reconstruct. Likely 001, 002, 004, 006, 011, 031, 032, 033.

The triage table is presented to the user and approved per row before any file is deleted. This is the reference's step 4 and it is a hard stop.

`AGENTS.md` cites "decisions `003`–`010`" as settled structure in two places. Those citations get repointed to the live docs that hold the rules, or to `decision-history/` for the survivors.

## Open question for the user

The repo carries an untracked copy of the skill at `.agents/skills/jookoi-paper-trail/` that differs from the global install at `~/.claude/skills/jookoi-paper-trail/` (`SKILL.md`, the hooks, `references/store-format.md`). Decide which one is canonical before migrating, since the store format comes from it: keep the repo copy in sync with the global install, or delete the repo copy and rely on the global one.

## Build order

1. Resolve the skill-copy question above.
2. Convert `items.json` to `items.yaml`, round-trip every item, verify counts and fields. Remove `items.json`.
3. Decision triage table, user approval, apply, write `decision-history/index.md`.
4. Fold `TODO.md` into live docs, delete it.
5. Fix every remaining mention of the old paths. `check` and `sweep` clean.
6. Add the four sibling plans' work items (`2026-09-27-sources-data-pipeline`, `-source-link-verification`, `-browser-search-integration`, `-a1-gate-answer`) and mark t013 Data pipeline and t045 Cut source-fixture from main as covered by the pipeline plan.

No `git add`, `git mv` or commits. The user commits.

## Implementation deviations

- **Skill copy.** Canonical source is `jookoi-ai-market/plugins/jookoi-dev/skills/jookoi-paper-trail`. The repo copy had drifted because the lint Stop hook ran prettier over untracked `.agents/skills/` files, which made the copy look newer than the source and `sync-skills.mjs` then skipped it. Fixed by adding `.agents/skills` to `.prettierignore` and copying the skill fresh into the repo, `~/.claude/skills` and `~/.agents/skills`. The full `sync-skills.mjs --force` was not run because it would also overwrite the repo's modified `jookoi-angular-performance`.
- **Decision triage split in two.** All 37 files were first moved unchanged to `plans/decision-history/`, links repointed and `index.md` written, so no link is ever broken. The per-row triage (delete, promote, keep) follows as its own item because it needs user approval per row.
- **Timestamps** in `items.json` were already ISO 8601 UTC. Converted 65 of 65 with zero field mismatches. The unconverted JSON is kept outside the repo in the session scratchpad only, since it was never committed.
- **`TODO.md`** had nothing the store and `ARCHITECTURE.md` did not already hold except the stage summary, which replaced the stale Stage line in `AGENTS.md`.
- **Left untouched:** `plans/decisions/` mentions inside `content/library/` (vendored from `JooKoi-developer-stack`, they describe that repo), its generated modules, `llm-progress-complete.jsonl` (append-only log), `.claude/settings.local.json`.
- Decision 027 was missing `## Options considered`, flagged by `check`. Added from the two options its own Problem section names.
- **Decision triage and plan reorganization completed.** 9 decisions kept in `plans/decision-history/` (001, 002, 004, 006, 011, 027, 031, 032, 033), 28 deleted or folded into live docs, index.md updated, and finished plans moved to `plans/implemented/`.
