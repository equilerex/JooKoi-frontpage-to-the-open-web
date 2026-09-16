---
name: visual-component-derivation
description: Use when turning a design, mockup or prototype into a component system — derive every component's identity, name and boundary from what it looks like, never from the mockup's markup
---

# Deriving components from the design, not the mockup

## The rule

**A component's identity, name and boundary come from its visual role.** The mockup's HTML structure, DOM nesting, class names and attribute names are ignored when deciding what a component _is_.

The mockup's CSS is still useful — as paint, once a boundary is already settled. The order matters: decide the boundary by looking, then go find the rules that draw it.

## Why markup is the wrong source

A mockup is built to look right, not to express a component tree. Its structure encodes the shortest path to a rendering — a wrapper added to fix alignment, a class reused because it happened to be close enough, a part inlined because extracting it was not worth it at the time.

Deriving components from that inherits every shortcut as an architectural boundary. Worse, it invites confident invention: a nesting relationship in the markup reads as a parent/child component relationship, a shared class prefix reads as a shared abstraction, and neither may exist in the design. Those inventions are hard to spot afterwards because they arrive with evidence attached.

The costs are asymmetric. A wrong colour is a one-line fix. A wrong component boundary is baked into every consumer and is expensive to unpick.

## Process

1. **Render the design and look at it.** Serve the mockup, open every page, capture every breakpoint you intend to support. Do this before reading any CSS. If you have read the stylesheet first, you are no longer deriving from the design — you are confirming it.
2. **Inventory what repeats.** Walk the screenshots and list every visual element that appears more than once. Work bottom-up: smallest indivisible parts first, then the recipes that combine them, then the page-level shells.
3. **Name each part by its design role.** Not by its demo placement, not by its class name. "Hardware key" not `btn`. "Classification badge" not `trust`. Spell names out — the name is the durable artifact.
4. **Define the API from what visibly changes.** Go through every instance of the part across the design and list what differs between them. That list is the inputs. Nothing else is.
5. **Only then open the CSS**, to find the rules that paint each settled boundary.

## The three questions that catch real mistakes

Ask these of every candidate part. Each one caught a genuine error in practice.

**Is this one part or two?** Two instances sharing a class are not automatically one component. If one has visual housing the other lacks — a bezel, a frame, a container treatment — they are different parts, whatever the stylesheet says. Markup routinely hides this by making one version internal to a larger block.

**Is this several parts or one?** The inverse, and the more common error. A part that appears in five places with five different class names may be one component in five placements, differing only by size, accent or state. Markup splits by context; the design does not.

**What actually distinguishes the variants?** Look at the variants side by side and name the difference out loud before writing the input. If the CSS selectors vary by colour, the obvious API is a `color` input — but if the design carries the meaning in border treatment, shape or weight, a colour input silently discards the distinction at the one place it matters. The input is whatever the eye uses to tell them apart.

## Slicing above the component level

The same derivation applies upward. After the parts, identify:

- **Composite patterns** — recurring recipes that combine parts: a framed panel with a head strip, a list row with leading indicator and trailing action, a collapsible section. Named by role, with projection slots rather than data inputs wherever the content varies freely.
- **Page shells** — the outermost grid each page _is_. Derive these by looking at the set of pages and grouping by layout, not by URL or by feature. Several pages usually share one shell.
- **Chrome** — what renders once around every page. The test is literal: if a page can exist without it, it is not chrome.

A page shell and a layout primitive are different things and belong in different places. The shell is what a page _is_; the primitive is something you compose _inside_ one.

## Where the domain boundary falls

A part that looks generic **is** generic, even when the mockup only ever uses it for one kind of content. A badge that happens to show a trust tier is a badge; the domain layer decides which variant a trust tier maps to.

Own the appearance in the design system. Own the mapping in the domain layer. A domain component configures a generic one — it never restyles it.

## After slicing: build or adopt

Deriving the parts tells you what exists, not who writes each one. For anything that is a solved problem, apply a second test in order:

1. Can CSS and theme tokens alone reach the design? → adopt the library component.
2. If not, does it expose a template slot for the part that falls short, so you own that subtree's DOM? → adopt.
3. Neither — the design needs DOM that is neither present nor templatable → build your own.

Two failure modes worth naming. **Looking bespoke is not an argument for building**: a control can look like nothing any library ships and still be a checkbox underneath. And **adopting is not free**: skinning someone else's `<span>` costs more than writing one. The saving has to be real in both directions.

## Red flags

| Thought                                                               | Reality                                                                 |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| "The stylesheet already has a class per component"                    | It has a class per rendering shortcut. Look at the pixels.              |
| "These are nested in the markup, so it's a parent and a child"        | Nesting is a layout fix as often as a relationship.                     |
| "I'll read the CSS first to save time"                                | Then you are confirming the markup's boundaries, not deriving your own. |
| "Same class, so same component"                                       | Check for distinct housing. Split if you find it.                       |
| "Different class and different page, so different components"         | Check whether it is one part in two placements. Merge if it is.         |
| "The variants differ by colour, so `color` is the input"              | Name the difference by eye first. Colour is often not the axis.         |
| "This one only ever holds domain content, so it's a domain component" | If it looks generic it is generic. The domain configures it.            |
| "It looks custom, so we have to build it"                             | Check what it is underneath, not what it looks like.                    |

## Recording the result

Write the inventory down as a table of component, group, visual role, and API surface — the four columns that survive review. Where the derivation disagrees with an earlier code-derived map, state the disagreements explicitly and say which wins. An unexplained rename reads as churn; a stated disagreement reads as a decision.
