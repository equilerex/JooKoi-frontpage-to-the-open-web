# Decision 039 — Record grid row height enter and leave animation

Date: 02-10-2026 01:55

Status: DECIDED

## Problem

The user wants rows on /search to grow from zero height when they appear and collapse to zero when they leave. Decision 036 rejected height animation after severe freezes, but those came from a bad implementation that had also dropped virtual scrolling, not from the animation itself.

## Options considered

Enter-only with virtual scroll (rejected by the user, who wanted both). Opacity-only fade (decision 036, the previous state). Cell-level grid-row height animation with leaving rows retained for one animation (chosen).

## Decision

joo-record-grid gets animateRows and rowKey. Each cell wraps its content in a one-row grid whose track animates 0fr to 1fr, with the cell padding animating alongside; the tr is never animated. Rows are matched by rowKey between updates. Removed rows stay in the table value flagged leave for 220ms, then are dropped, so the virtual scroller still sees one plain list. At most 30 rows animate per change. Reduced motion swaps instantly. Supersedes the no-height clause of decision 036.

## Why not the alternatives

Animating the tr height does not work for display table-row. A deferred-removal list is the only way to animate leave under p-table, because it drops removed rows at once.

Addendum 02-10-2026: the search grid also gets virtualScrollOptions { autoSize: false } and a fixed viewport-fill scrollHeight (max(24rem, 100dvh - hud - space-8)). PrimeNG autoSize measured layout after every change (a 194ms forced reflow at 6x CPU) and collapsed the scroller to the empty-message row (600px to 67px, 0.22 layout shift) when results hit zero. Only the search grid is virtual; library pages have no virtual scroller.

## Next step

Watch scrolling and fast typing on /search for jank; lower the 30-row cap or the duration if it shows.
