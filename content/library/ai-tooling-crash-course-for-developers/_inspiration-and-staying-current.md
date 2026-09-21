# Staying Current — Newsletters, People, Communities

Who and where to follow for staying current on AI-assisted dev tooling. Nothing goes in this file without meeting the evidence bar: named practitioners with a real, checkable identity (org affiliation, public repo, publication history), current docs, or repo-health signals. For verified tools/repos/products themselves, see [`_ai-tooling-recommendations.md`](./_ai-tooling-recommendations.md). Process notes live in `decisions/`.

---

## Newsletters

- [TLDR AI](https://tldr.tech/ai) — daily digest, ~1.1M subscribers. Breadth over depth; good for not missing a major release, not for understanding one.
- [Latent Space](https://www.latent.space) — Substack, swyx + Alessio Fanelli. The defining "AI Engineer" publication; same brand runs the podcast and Discord below. Closest thing to a beat-reporting operation for this specific space.
- [The Batch](https://www.deeplearning.ai/the-batch/) — DeepLearning.AI / Andrew Ng. General AI-industry framing, not dev-tooling-practice specific — peripheral, not core.
- Ben's Bites — established AI product/tool newsletter, product-launch and funding-news focus rather than technical practice (exact current URL not confirmed, search before subscribing).
- [Interconnects by Nathan Lambert](https://www.interconnects.ai) — 79k+ subscribers. Real ML-research background (Berkeley AI, Meta, DeepMind, HuggingFace) — writes about training/alignment research with the technical depth of someone who's done the work, not summarized it.
- [Ahead of AI by Sebastian Raschka](https://magazine.sebastianraschka.com) — same author as the YouTube channel below; paper-to-practice explainers from someone with a real research and textbook-authoring background, not a news aggregator.

## People to follow

X/social handles are inherently a lower evidence bar than repos/docs — real accounts posting real content, not vetted authorities. Split below by whether the content is actually about *building* something — a tool, a skill, an agent, an automation, code or no-code — versus commentary/coaching that isn't. Each entry states specifically what it's good for.

### Core — building tools, skills, and agents (code or no-code)

- **Andrej Karpathy** — [YouTube](https://www.youtube.com/@AndrejKarpathy), [@karpathy](https://x.com/karpathy). Former Tesla AI director, OpenAI founding member. The "Zero to Hero" series builds a neural net and then an LLM from scratch in code, no slideware — the most technically rigorous "how transformers actually work" education available from any single source. Highest-confidence entry on this whole list.
- **Sebastian Raschka** — [YouTube](https://www.youtube.com/@SebastianRaschka), Ahead of AI Substack above. ML researcher and staff member at Lightning AI, author of multiple deep-learning textbooks including a from-scratch LLM-building book. Reliable bridge between new papers and practical implementation — technically literate, not hype-summarizing.
- **[@simonw](https://x.com/simonw)** (Simon Willison) — creator of [Datasette](https://datasette.io/), long-running independent writer on local models, CLI tooling, and LLM security. Dates everything, links primary sources, states uncertainty explicitly rather than hedging vaguely. The highest signal-to-hype ratio individual voice on this entire list.
- **[@swyx](https://x.com/swyx)** (Shawn Wang) — Latent Space co-host, ex-AWS/Temporal/Airbyte before going independent. Coined/popularized "AI Engineer" as a distinct role. Tracks dev-environment and agent-harness shifts in real time — less a single-topic expert, more the person watching the whole tooling ecosystem move.
- **Greg Kamradt** — [YouTube (Data Independent)](https://www.youtube.com/@DataIndependent), [gregkamradt.com](https://gregkamradt.com/media). Creator of the "Needle in a Haystack" test — now a standard benchmark for LLM long-context retrieval, [used and cited across the industry](https://arize.com/blog/the-needle-in-a-haystack-test-evaluating-the-performance-of-llm-rag-systems/) including by model vendors themselves. Data Independent covers hands-on RAG/agent-framework build-alongs. Worth following specifically for context-window and retrieval-evaluation methodology.
- **Sam Witteveen** — YouTube (exact current handle not confirmed, search "Sam Witteveen AI"), [@Sam_Witteveen](https://x.com/Sam_Witteveen). Co-founder of Red Dragon AI, a working AI company in Singapore. One of the earlier LangChain-era educators; channel now covers agentic-application patterns and local/open-source model walkthroughs. A practicing company co-founder narrating real build decisions, not tutorial content alone.
- **Mervin Praison** — [YouTube](https://www.youtube.com/@mervinpraison), [mer.vin](https://mer.vin/), [github.com/MervinPraison](https://github.com/MervinPraison). Creator of [PraisonAI](https://github.com/MervinPraison/PraisonAI), a multi-agent orchestration framework supporting 100+ LLMs with built-in memory/RAG. Real, checkable identity and active repo. Relevant specifically if evaluating multi-agent frameworks — a first-party source on that framework's own design tradeoffs, narrower relevance outside that.
- **@skirano** (Pietro Schirano) — [profiled by Replit's own blog](https://replit.com/blog/pietro-schirano) as a notable independent builder; known for fast, design-literate AI-assisted app-building demonstrations on X. Real identity, but the content is technique-and-demo, not documented methodology — useful for seeing what's currently possible in AI-assisted UI building; treat as inspiration, not a source to cite claims from.
- **[@realrileybrown](https://www.instagram.com/realrileybrown)** (Riley Brown) — 329K followers, real person, associated with the VibeCode app/newsletter, one of the more visible faces popularizing "vibe coding" — building real software with AI assistance, no traditional dev background required. Useful for tracking that workflow and vocabulary as it evolves; the "$9M app" figure circulating about him comes from marketing-adjacent blogs, not an audited source, so weight the outcome claims separately from the technique itself.
- **@nick_saraev** — 550K followers, real person, founder of Maker School — an AI-automation-agency community teaching n8n/Zapier-style agent and workflow building. No-code, but it's genuinely about constructing agents/automations, which is this list's actual subject. Caveat is on the packaging, not the content category: this is a paid course/community business, and several independent "is this legit" review sites exist specifically because of that — read the technique, weight the outcome claims skeptically.
- **@nathanhodgson_** (TikTok) — 141.8K followers, real and active, Make/Zapier-centric AI-automation-building content — same category as nick_saraev, same caveat on outcome claims vs. technique. Note: original source had this as `@nathanhodgson.ai`, corrected to `@nathanhodgson_`.
- **The Cognitive Revolution** (Nathan Labenz) — podcast. Long-form interviews where guests are often the actual researchers or builders behind a given model or paper, not press-circuit talking heads — gets more technical candor than most coverage of the same announcement.

### Adjacent — real and checkable, but not about building  

Kept for completeness, not endorsed at the same level as the section above. The distinguishing feature here isn't "no-code" or "not a developer" — it's that the content itself isn't instructional about constructing a tool, skill, or agent; it's commentary, career content, or using an AI product as an end user.

- **[@thevarunmayya](https://www.instagram.com/thevarunmayya)** (Varun Mayya) — 1M+ followers, real entrepreneur (founder, Avalon Labs; previously connected to Furlenco). Broad startup/career/tech commentary — general tech-culture awareness, not building instruction.
- **@sabrina_ramonov** — real, founder of [Blotato](https://www.blotato.com/about) (an AI content-distribution tool — she has built something), but the audience-facing content is mostly "how to use AI for content/marketing output" rather than "how to build an agent or skill." Worth a second look specifically for how Blotato itself is built, less so for the broader content stream.
- **[@mavgpt](https://mavgpt.ai)** (Maverick Maltin) — real, prompt-engineering/AI-productivity creator. Actionable technique underneath (persona framing, multi-persona "Board of Directors" prompting, chain-of-thought breakdowns) but packaged as viral-hook marketing funneling to paid guides — treat as a prompting-technique source, not a build-instruction source.
- **[@gayatri.tech](https://in.linkedin.com/in/gayatriagrawal)** (Gayatri Agrawal) — real, AI/ML background, founder of AI-services startup ALTRD. Content is workflow/adoption-focused (where AI fits in business ops, tool-to-task fit, AI literacy) rather than hands-on building; short-form format trades off technical depth. Funnels to consulting work, not courses.

## Communities (Discord/Reddit/etc.)

- **Latent Space Discord** — tied to the Latent Space brand above.
- **Anthropic Developers Discord** — official Anthropic community.
- **OpenAI Developers Discord** — official OpenAI community.
- **Cursor Community Discord** — official Cursor community.
- [r/LocalLLaMA](https://www.reddit.com/r/LocalLLaMA/) — open-weights/local-hardware focus, fast honest benchmarking of new claims.
- [r/mcp](https://www.reddit.com/r/mcp/) — smaller/newer, MCP-specific.
- [r/PromptEngineering](https://www.reddit.com/r/PromptEngineering/)
- [ODS.ai](https://ods.ai) (Open Data Science) — long-running practitioner ML community, Telegram-based.
