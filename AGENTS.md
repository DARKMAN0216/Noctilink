# AGENTS.md

## Project

Project name: **Noctilink**  
Chinese title: **夜链**  
Repository name: `noctilink`

Noctilink is an urban anomaly narrative game built around multi-perspective storytelling, causal timelines, world-state changes, replayable branching endings, and chapter-level canon progression.

The current development stage is **v0.1 MVP**.

---

## Current MVP Scope

The v0.1 MVP is intentionally small.

### Included

- Prologue + Chapter 1
- A perspective only
- Text adventure flow
- Choice-based branching
- Attribute checks
- World-state reads and writes
- Multiple chapter-closed endings
- One canon ending per chapter
- Ending archive
- Basic causal event records
- Local save system
- YAML story source files
- JSON runtime data generated from YAML
- StoryTool validation and build pipeline

### Excluded for v0.1

Do **not** implement or generate code/content for the following unless explicitly requested:

- B/C playable perspectives
- Commercialization
- Paid perspective unlocks
- Ads
- Shop UI
- Payment
- Orders
- Entitlements
- Cloud save
- Full backend
- Multiplayer
- Combat system
- Large map exploration
- Gacha
- Complex equipment system
- Full causal graph editor
- Cross-perspective causal replay

---

## Technology Stack

### Client

- Cocos Creator 3.x
- TypeScript

### Content

- Markdown for design documents
- YAML for editable story source files
- JSON for runtime story data

### Tools

- C# / .NET CLI tool named `StoryTool`
- Used for validation, YAML-to-JSON build, story graph checks, schema checks, reachability checks

### Backend

Backend is **deferred** in v0.1.

The planned backend stack is:

- C# / .NET
- ASP.NET Core Web API
- EF Core
- PostgreSQL

Do not implement backend code unless explicitly requested.

---

## Repository Structure

Use this structure unless the user explicitly changes it:

```text
noctilink/
  client/
  server/
  tools/
    StoryTool/
  content/
    chapters/
    characters/
    variables/
  docs/
    00_project_brief.md
    01_world_bible.md
    02_character_bible.md
    03_story_rules.md
    04_tech_architecture.md
    05_story_node_schema.md
    06_world_state_schema.md
    07_causal_graph_rules.md
    08_save_system.md
    11_mvp_scope_and_ending_rules.md
  AGENTS.md
  README.md
```

---

## Important Documents

Before generating or modifying code/content, read the relevant documents:

- `docs/04_tech_architecture.md`
- `docs/05_story_node_schema.md`
- `docs/06_world_state_schema.md`
- `docs/07_causal_graph_rules.md`
- `docs/08_save_system.md`
- `docs/11_mvp_scope_and_ending_rules.md`

If a task touches story node structure, read `05_story_node_schema.md` first.

If a task touches variables or state, read `06_world_state_schema.md` first.

If a task touches endings or cause tracking, read `07_causal_graph_rules.md` first.

If a task touches saving/loading, read `08_save_system.md` first.

---

## Core Architecture Rules

### 1. Do not hardcode story branches in TypeScript

Do not write story logic like this:

```ts
if (choice === "x" && sanity > 20) {
  nextNode = "ch01_a_010";
}
```

Story flow, conditions, effects, endings, and causal records must come from story data.

The client should interpret validated JSON data produced from YAML.

---

### 2. Story data must be YAML-first

Editable story content should be written in YAML under `content/`.

Runtime content should be generated JSON.

Do not manually author runtime JSON unless the user explicitly asks.

---

### 3. Conditions must be structured

Use structured condition objects.

Preferred:

```yaml
requirements:
  all:
    - var: attributes.A.insight
      op: ">="
      value: 3
```

Avoid raw script expressions such as:

```yaml
condition: "A.insight >= 3 && world.door_open"
```

---

### 4. Effects must be structured

Use effect arrays.

Example:

```yaml
effects:
  - type: attribute.add
    target: attributes.A.sanity
    value: -1
  - type: world.set
    target: world.flags.a_knows_anomaly_exists
    value: true
```

---

## Story Node Rules

Follow `docs/05_story_node_schema.md`.

Every story node must have:

- `id`
- `chapter`
- `pov`
- `node_kind`
- `title`
- `text`, unless it is a pure router node

A normal story node must have at least one of:

- `choices`
- `next`
- `ending`
- `routes`

Do not create dead nodes.

Use node IDs like:

```text
ch01_a_001
ch01_a_router_final
ch01_a_ending_misunderstanding_node
```

For v0.1, `pov` should be `A` only.

---

## Ending Rules

Follow `docs/11_mvp_scope_and_ending_rules.md` and `docs/05_story_node_schema.md`.

Noctilink does not allow all endings to continue into the next chapter.

Each chapter can have multiple endings, but they are divided into:

### closed

A chapter-closed ending.

Rules:

- Enters the ending archive
- Does not unlock the next chapter
- Does not write `canon_state`
- May unlock archive clues or archive entries
- Must have an ending review cause and replay hint

### canon

The mainline-progressing ending.

Rules:

- Enters the ending archive
- Unlocks the next chapter
- Must write `canon_state`
- Must include `canon_path`
- Each chapter should have exactly one canon ending

Do not call closed endings “fake endings” in player-facing text.

Use terms like:

- route closed
- chapter closed
- closed ending
- retreat ending
- misunderstanding ending
- pollution ending
- canon ending

---

## World State Rules

Follow `docs/06_world_state_schema.md`.

All variables must be registered before use.

Do not create variables ad hoc inside story nodes.

Valid top-level namespaces for v0.1:

```text
attributes
world
clues
relationships
archive
progress
```

Do not introduce these namespaces in v0.1:

```text
entitlements
orders
ads
shop
```

Only variables with `canon_allowed: true` may be written into `canon_state`.

Do not put process variables such as exact sanity, stamina, money, or arbitrary scene flags into `canon_state` unless the schema explicitly permits it.

---

## Current v0.1 Variable Scope

The current MVP defines only A's attributes:

```text
attributes.A.status
attributes.A.sanity
attributes.A.stamina
attributes.A.money
attributes.A.insight
attributes.A.pollution
```

Do not define `attributes.B.*` or `attributes.C.*` yet unless explicitly requested.

---

## Causal Record Rules

Follow `docs/07_causal_graph_rules.md`.

Causal records are used to explain why endings happen.

Valid causal categories:

```text
choice
clue
attribute
world_state
route
ending
unknown
```

Valid visibility values:

```text
known
unknown
hidden
```

Valid strength values:

```text
strong
weak
```

For v0.1:

- Only show strong causal events to the player.
- Each closed ending must have at least one explainable cause.
- Each canon ending must have a canon path.
- Do not build a complex interactive causal graph yet.
- Prefer a simple ending review screen first.

---

## Save System Rules

Follow `docs/08_save_system.md`.

The save system has four major sections:

```text
meta
runtime
archive
canon
history
```

Rules:

- Runtime stores current play state.
- Archive stores permanent unlocks.
- Canon stores mainline progression anchors.
- History stores choices, causal events, and chapter attempts.
- Closed endings write Archive only.
- Canon endings write Archive + Canon and unlock the next chapter.
- Later chapters inherit Canon State, not the entire Runtime State.

Do not design cloud save in v0.1 unless explicitly requested.

---

## StoryTool Rules

StoryTool should validate at least:

- Duplicate node IDs
- Missing `next` targets
- Undefined variables
- Invalid variable types
- Invalid enum values
- Invalid effect targets
- Invalid ending references
- More than one canon ending per chapter
- Closed endings that unlock next chapter
- Canon endings without `canon_state`
- `canon_state` variables that are not `canon_allowed`
- Missing ending review causes
- Missing canon path for canon endings
- Dead nodes
- Unreachable nodes, unless marked hidden

Do not let StoryTool silently accept invalid content.

---

## Coding Rules

### TypeScript client

- Use TypeScript.
- Keep story logic data-driven.
- Separate engine, state, save, and UI modules.
- Do not directly call platform APIs from story logic.
- Use adapters for platform-specific behavior.
- Keep classes small and testable.

Recommended core modules:

```text
StoryEngine
WorldStateStore
ConditionEvaluator
EffectApplier
CausalGraphManager
SaveManager
SaveProvider
StoryContentLoader
```

### C# tools

- Use C# / .NET.
- Prefer explicit models and validators.
- Make validation errors readable.
- Validation errors should include file path, node ID, field path, and reason.

Example error format:

```text
[StoryTool] content/chapters/ch01/nodes_a.yml: node ch01_a_003 choices[1].next points to missing node ch01_a_999
```

---

## Content Generation Rules

When generating story YAML:

1. Use existing variables only.
2. Use structured `requirements` and `effects`.
3. Use A perspective only for v0.1.
4. Do not introduce B/C playable content.
5. Do not introduce paid fields.
6. Do not introduce ad fields.
7. Every ending must reference an entry in `endings.yml`.
8. Every closed ending needs an ending review and replay hint.
9. The canon ending needs `canon_state` and `canon_path`.
10. Avoid giant branching trees.

---

## Writing Style

Design documents and content notes should be written in Chinese unless the user asks otherwise.

Code identifiers, file names, YAML keys, and API-like names should use English.

Player-facing text should not expose internal implementation terms such as:

```text
canon_state
Runtime State
Archive State
StoryTool
schema
```

Use player-facing terms instead:

```text
结局
档案
线索
路线闭合
主线推进
```

---

## Current Project Decision Summary

The current confirmed decisions are:

```text
Project name: Noctilink
Chinese name: 夜链
Repository: noctilink
Genre: Urban anomaly text adventure
Current MVP: Prologue + Chapter 1
Playable perspective: A only
Commercialization: deferred
Backend: deferred
Save: local only
Story source: YAML
Runtime story data: JSON
Docs: Markdown
Client: Cocos Creator + TypeScript
Tools: C# StoryTool
```

---

## Do Not Do Without Explicit Permission

Do not:

- Add monetization systems.
- Add paid unlocks.
- Add ads.
- Add backend implementation.
- Add B/C playable perspectives.
- Add complex combat.
- Add large map exploration.
- Replace Cocos with Unity.
- Replace TypeScript client with C#.
- Replace YAML story source with hardcoded TypeScript.
- Put closed endings into next-chapter inheritance.
- Allow multiple canon endings in one chapter unless the design document is changed.
- Create unregistered variables.

---

## Preferred Next Steps

When continuing implementation planning, prioritize:

1. StoryTool design
2. Project directory initialization
3. TypeScript story engine interfaces
4. WorldStateStore implementation plan
5. ConditionEvaluator and EffectApplier implementation plan
6. SaveManager implementation plan
7. Minimal Cocos text-player prototype
8. Only then begin Chapter 1 content design
