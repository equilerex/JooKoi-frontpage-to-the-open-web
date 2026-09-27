# Decision 018 — Page scope is home, search, learn

Date: 2026-09-16

Status: DECIDED

<!-- Status is one of: DECIDED | TRIAL | REJECTED | DEFERRED | SUPERSEDED
     A superseding decision gets its own number. The superseded file's status changes
     and its body gains a pointer — it is never edited away or deleted.
     All five sections below are required. -->

## Problem

`_architecture/sitemap.yaml`'s original MVP set is `home`, `search_results`, `browse`, `source_detail`. Phase 3 has to pick which of these actually get built now.

## Options considered

- Build all four sitemap MVP pages.
- Build home, search and learn only, deferring `browse` and `source_detail`.

## Decision

Page scope is home, search and learn (D2). This supersedes the sitemap's MVP set. `browse` and `source_detail` move to (stay) `parked` in `_architecture/sitemap.yaml`; `education_home`/`education_topic` move from `parked` to built.

## Why not the alternatives

`browse` is query-less discovery that only pays off at a dataset size this app does not have yet. `source_detail` is a whole page template for records that are currently one-liners in the fixture. Learn earns its place instead because its content already exists and is written (`JooKoi-developer-stack`'s AI-tooling crash course).

## Next step

Revisit `browse` and `source_detail` once the fixture's record count and detail depth justify a dedicated page each.
