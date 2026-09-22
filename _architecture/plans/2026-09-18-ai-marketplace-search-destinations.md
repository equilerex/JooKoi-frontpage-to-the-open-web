# AI marketplace search destinations

Session: 2026-09-18. Status: Search↗ searches this row's skill set, not a global dump.

## Context

A table row is one skill set or one marketplace. Name is GitHub (or homepage). The right-hand key is never GitHub. It opens a marketplace URL with `?q=` filled from the query box (`searchterm` in the examples is `{q}`).

Search↗ always includes a query param (`?q=` in the examples; `ssdsd` / `test` are the typed value). Never a listing path, never GitHub.

1. That row's marketplace search if it accepts a query param: `https://www.skills.sh/?q={q}`.
2. Else `https://mcpservers.org/agent-skills/author/{github-owner}?q={q}` (`openai` → the GitHub owner, `test` → the box value).
3. Else Open to `url` (rows with no query-param search and no GitHub owner).

## Link roles

| Field       | Column / action | Meaning                                                                   |
| ----------- | --------------- | ------------------------------------------------------------------------- |
| `url`       | Name            | Author landing: GitHub repo if known, else homepage                       |
| `searchUrl` | Right-hand key  | `{q}` URL scoped to this row. Open (no query) still goes here, not GitHub |
| `sourceUrl` | Src (optional)  | GitHub/README when distinct from `url`                                    |

## AI-marketplace wiring (this pass)

- **skills.sh** — Vercel marketplace. Search↗: `https://www.skills.sh/?q={q}`. Src: `vercel-labs/skills`.
- **MCP Servers** — global MCP catalog. Search↗: `https://mcpservers.org/search?query={q}`.
- **vercel-labs/agent-skills** — Vercel marketplace search: `https://www.skills.sh/?q={q}`. Name is GitHub.
- **obra / addyosmani / mattpocock / cloudflare / openai/plugins** — no own `?q=` marketplace. Search↗ is `https://mcpservers.org/agent-skills/author/{owner}?q={q}`. Name is GitHub.
- **mdskills.ai** — Name is their homepage. Search↗: `https://www.mdskills.ai/skills?q={q}`.
- **Agensi** — Name is their homepage. Search↗: `https://www.agensi.io/search?q={q}`.
- **MCP Market** — Name is their homepage. Search↗: `https://mcpmarket.com/search?q={q}`.

## UI

Home and search tables gain a **Src** column. Empty when `sourceUrl` is absent. Hidden below 1024px as a secondary column.

## Build order

1. Add optional `sourceUrl` on `Source`.
2. Rewire AI-marketplace fixture entries and add skills.sh + mcpservers.org.
3. Map Src on home and search row templates.
4. Verify F6 / `/search?category=ai-marketplace&q=…` outbound hrefs in the running app.

## Implementation deviations

- Right-hand key used to fall back to `url` (GitHub) when the query box was empty. It now always follows `searchUrl` and keeps `?q=`.
- Library listing paths (`skills.sh/{owner}/{repo}?q=`) are not search URLs. Only `https://www.skills.sh/?q={q}` or `https://mcpservers.org/agent-skills/author/{owner}?q={q}`.
- Src hide is `td[data-col='src']` only; table headers have no `data-col`.
- Signals SRCH chip is leftover capability tagging, not the Search↗ contract.
