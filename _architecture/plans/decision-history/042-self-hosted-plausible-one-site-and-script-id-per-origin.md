# Decision 042 — Self-hosted Plausible, one site and script id per origin

Date: 06-10-2026
Status: DECIDED

## Problem

The owner wants one analytics dashboard for the front page, Mutants Rising and future projects, European GDPR compliant, self-hosted.

## Options considered

- Plausible CE (Elixir app, Postgres, ClickHouse, about 300 to 400 MB RAM extra).
- Lighter tools (GoatCounter, Umami): fewer features, weaker dashboard. Not chosen.
- Host on the vault server, on the Mutants Rising server (1 GB RAM, lean), or a new Linode.

## Decision

Plausible CE v3.2.1 on the owner's vault server (chosen because an outage there is the owner's own problem), in its own repo `JooKoi-plausible` (sibling checkout), reached through the vault stack's Caddy The hostname is deliberately neutral because ad-block lists match words like analytics and stats. No cookies, no consent banner. Memory limits make Plausible the first thing killed. Each origin is its own Plausible site with its own script id: `src/index.html` picks the id by `location.hostname` (`jookoi.com` and `www.jookoi.com` get one, everything else including GitHub Pages gets the other). One site with one id also counted both origins, but separate sites keep stats clean. Secrets live only on the server.

## Why not alternatives

Mutants Rising's box has about 230 MB free. A new Linode costs money for a hobby setup. The lighter tools were not wanted over the dashboard.

## Next step

Watch the server's `plausible-telemetry report` (documented in the `JooKoi-plausible` README) after a week of traffic. If the GitHub Pages copy is retired for the apex, drop the hostname switch. Mutants Rising still needs its snippet.
