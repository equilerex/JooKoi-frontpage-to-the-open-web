# Decision 023 — Hero wordmark is the sentence lockup

Date: 2026-09-16

Status: DECIDED

<!-- Status is one of: DECIDED | TRIAL | REJECTED | DEFERRED | SUPERSEDED
     A superseding decision gets its own number. The superseded file's status changes
     and its body gains a pointer — it is never edited away or deleted.
     All five sections below are required. -->

## Problem

The mockup's hero wordmark template, `Open<b>Web</b>`, reads as a single compound brand ("OPENWEB"). The product is *front page to the open web*, a statement about what the page is for, not a brand to be recognised — the compound reading inverts that intent, while "open web" still needs to be present and prominent and `JooKoi` does not belong on screen at all.

## Options considered

Three lockups, all buildable from the existing `eyebrow-label` and `logotype` components:

- **A — sentence lockup:** eyebrow "FRONT PAGE TO THE" over logotype "OPEN WEB", read top to bottom as one sentence; the mockup's eyebrow text (`FRONT PAGE TERMINAL · 412 SOURCES INDEXED`) gives up its slot and the source count moves to the header status strip.
- **B — statement beneath:** logotype "OPEN WEB" with a statement line below repeating "front page to the open web · N sources indexed".
- **C — above and below:** eyebrow above, logotype, then a stats line below, directly over the launcher console.

## Decision

A — the sentence lockup (D7). The header brand becomes a small "OPEN WEB", `JOOKOI` drops out of the UI entirely, and the source count moves to the header status strip (`412 SRC ONLINE`).

## Why not the alternatives

B repeats "open web" twice in three lines. C stacks three type sizes directly above the lede and the launcher console, which is already the densest region of the page.

## Next step

None. Full detail and the mockup markup for all three options: `_architecture/plans/2026-09-16-phase-3-content-and-features.md`, "Wordmark and page identity".
