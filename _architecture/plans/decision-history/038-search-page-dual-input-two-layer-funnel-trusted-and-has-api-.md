# Decision 038 — Search page: dual input, two-layer funnel, Trusted and Has API hidden from UI

Date: 02-10-2026 01:13

Status: DECIDED

## Problem

The search page had a separate sidebar keyword filter and a single query box, Trusted-only and Has API toggles the user does not want, and the category filter had moved into the sidebar.

## Options considered

Two separate console boxes side by side (rejected: user wanted one combined widget). One frame with two zones (chosen). Keep category in the sidebar (rejected: user wants it between the inputs and the table).

## Decision

joo-dual-console-input: left zone filters rows (kw), right zone is the query (q) appended to each row outbound link, plus an Open 5 key that opens the first five rows. Category chips (multi-select, counts) sit in themed columns (AI & tooling, Culture & play, News & world pulse, Money & movement, plus Other for unlisted slugs) between the input and the table. Below them a collapsible Types layer lists only the types of the selected categories (all types when none is selected, 150+, so it is collapsed until a category is picked) and drops selected types that fall out of scope. Types are grouped into themed columns by keyword rules in curated-websites/type-groups.ts (first match wins, unmatched go to Other) because Source.type is free text, 150+ values. The expand key is a joo-hardware-key with a status light, the expanded layer sits in a corner-bracketed region. The types layer stays collapsed until the user opens it (picking a category does not expand it) and uses CSS columns so groups keep their own height. URL: category=a,b and type=x,y. Trusted only and Has API are hidden from the UI; trustScore and public-api stay in the data. Header search (?q=) now fills only the query box, it does not filter.

## Why not the alternatives

The data fields stay because the user said to hide, not remove, them. Bulk open uses window.open per row, so popup blockers may ask once.

## Next step

None. Supersedes the fix wave 2 note in search.page.ts, where q and kw were separate sidebar and results fields.
