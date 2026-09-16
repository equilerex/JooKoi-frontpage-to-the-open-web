# Decision 019 — AI skill marketplaces are a category value, not a second entity

Date: 2026-09-16

Status: DECIDED

<!-- Status is one of: DECIDED | TRIAL | REJECTED | DEFERRED | SUPERSEDED
     A superseding decision gets its own number. The superseded file's status changes
     and its body gains a pointer — it is never edited away or deleted.
     All five sections below are required. -->

## Problem

AI skill marketplaces (`mdskills.ai`, `agensi.io`, `mcpmarket.com`, and the skill-library repos) are the feature that motivated Phase 3. They need a place in the data model.

## Options considered

- A second entity type for AI marketplaces, separate from the ordinary curated-website record.
- A `category` value (`'ai-marketplace'`) on the ordinary `Source` record.

## Decision

AI skill marketplaces are a category value on the ordinary source record (D3), not a second entity.

## Why not the alternatives

A second entity duplicates the dataset and the rendering path for no real gain — home's quick key and search's category filter both become pre-applied filters over the same records either way. Matches "one dataset, many views" in `.agents/context/product-concept.md` §35.

## Next step

None. The home quick-key (`F6`, `key--hot`) and the search page's Category filter both read `category === 'ai-marketplace'` on the shared fixture.
