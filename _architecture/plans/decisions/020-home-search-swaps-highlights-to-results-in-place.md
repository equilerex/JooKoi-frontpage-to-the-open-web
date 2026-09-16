# Decision 020 — Home search swaps highlights to results in place

Date: 2026-09-16

Status: DECIDED

<!-- Status is one of: DECIDED | TRIAL | REJECTED | DEFERRED | SUPERSEDED
     A superseding decision gets its own number. The superseded file's status changes
     and its body gains a pointer — it is never edited away or deleted.
     All five sections below are required. -->

## Problem

Typing a query into the home launcher console needs somewhere to show live results.

## Options considered

- An overlay/dropdown results panel positioned over the launcher, with outside-click handling and a focus trap.
- Swapping the existing "Trusted highlights" panel's content in place for ranked results.

## Decision

Typing on home swaps the highlights table to results in place (D4): same component, same position, content swaps and the panel retitles with a match count. Submitting (Enter or the Launch key) navigates to `/search?q=…`.

## Why not the alternatives

An overlay needs its own positioning, outside-click handling and a focus trap — real UI complexity for a launcher whose result set is already framed by an existing panel.

## Next step

None. Implemented in `home.page.ts` as a live-bound signal over the shared fixture.
