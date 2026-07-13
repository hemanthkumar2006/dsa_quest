# DSA Quest — Game Design Document

*A gamified, RPG-style platform for learning Data Structures & Algorithms without burning out or losing interest.*

## 1. Core Concept

DSA Quest turns algorithm practice into an RPG world. Instead of a flat list of problems, learners explore **regions** mapped to canonical DSA patterns, sourced from well-known sheets (Striver's A2Z, NeetCode 150, RisingBrain, etc.). Progression, streaks, multiplayer, and reflection mechanics are layered on top so the loop that keeps people in a video game — mastery, social competition, visible progress — is the same loop that gets them fluent in DSA.

**Design principle:** every gamification element should map to an evidence-based learning or habit-formation mechanic. No mechanic is "just for fun" — it should also be doing work (retention, transfer, spaced repetition, or accountability).

---

## 2. World & Progression Structure

### 2.1 Regions (mapped to patterns, not just topics)

| Order | Region | Pattern |
|---|---|---|
| 1 | Array Coast | Arrays / prefix sums |
| 2 | Two-Pointer Straits | Two pointers |
| 3 | Sliding Window Valley | Sliding window |
| 4 | Stack Spire | Stacks / monotonic stack |
| 5 | Binary Search Peaks | Binary search |
| 6 | Linked List Labyrinth | Linked lists |
| 7 | Tree Territory | Trees / BST |
| 8 | Heap Highlands | Heaps / priority queues |
| 9 | Backtracking Badlands | Backtracking |
| 10 | Graph Galaxy (incl. Union-Find sub-wing) | Graph traversal (BFS/DFS), disjoint set union |
| 11 | Greedy Grasslands | Greedy algorithms |
| 12 | DP Dungeon (1D → 2D wings) | Dynamic programming |

This order mirrors the difficulty/dependency sequencing used by Striver's A2Z sheet, with two deliberate deviations from a naive topic list:

- **Greedy before DP.** The classic learning moment in DSA is trying a greedy approach, watching it fail on a counterexample (e.g., 0/1 knapsack vs. fractional knapsack), and then learning DP as the fix. Sequencing Greedy first preserves that contrast — DP lands as "the fix for where greedy breaks" rather than "greedy but harder." Greedy also has a gentler conceptual ramp since it doesn't require the recursion/memoization mental model DP needs.
- **Union-Find folded into Graph Galaxy, not standalone.** Union-Find isn't really its own topic — it's a graph technique (cycle detection, Kruskal's MST, connected components). Keeping it as a sub-wing of Graph Galaxy instead of a separate late-game region keeps it connected to the graph problems it's actually used to solve.

So: **completing the map = completing the curriculum**, in an order chosen for concept dependencies, not just alphabetical or sheet-default ordering.

### 2.2 Region Structure
- Each region has multiple **levels**, each level = a curated problem from an established sheet.
- Each region ends in a **boss fight**: a hard problem requiring 2+ patterns combined (tests transfer, not memorization — the key gap between "solved 200 problems" and "actually learned DSA").
- **Soft gates**: unlock the next region at ~70% region completion, not 100%, so a single nasty problem can't wall someone off and cause a quit.
- **Non-linear exploration**: some regions can be tackled in parallel once prerequisites are loosely met.

### 2.3 Onboarding & Personalization
- **Placement test**: 5–10 problems on first entry to estimate skill level and drop the player into the right region instead of forcing a zero-start.
- **Adaptive difficulty**: struggling → surface an easier variant of the same pattern; breezing through → skip ahead. Keeps players in their own flow zone.
- **Weak-pattern heatmap**: personal dashboard showing shakiest patterns (via time-to-solve, hint usage, retries) so practice is targeted, not random.

---

## 3. Learning Mechanics

- **Spaced repetition dungeon** — solved problems resurface on an SRS (Anki-style) schedule instead of being solved once and forgotten. Likely the single highest-leverage retention mechanic in the whole design.
- **Pattern grimoire** — after solving, reveal "you just used Sliding Window" and add it to a collectible spellbook. Makes abstract pattern-recognition into something tangible to collect.
- **Tiered hints** — cost in-game currency, so real struggle is encouraged before revealing, without leaving anyone permanently stuck.
- **Post-solve reflection quiz** — "which pattern did you use?" Cheap to build, strong metacognitive payoff.
- **Buggy-code levels** — debug/step through broken code instead of writing from scratch. Adds variety and gives a lower-cognitive-load day option.
- **Teach-back mode** — after solving, explain the solution to an NPC or another player (text or recorded). The protégé effect is one of the strongest known retention boosts.
- **Editorial unlock** — after solving (or after N failed attempts), unlock community solutions/editorials, Codewars-style.
- **Mock interview dungeon** (late-game) — timed, proctored simulation: problem + verbal explanation + follow-ups. Doubles as real interview prep.

---

## 4. Streak & Retention Systems

- **Streak freezes/shields** — earned or bought with in-game currency; one missed day doesn't nuke the streak or the motivation.
- **Daily quest** — one guaranteed problem for XP; keeps the minimum viable day tiny.
- **Weekly world boss** — everyone's daily solves contribute to a shared HP bar for a communal boss fight, turning solo grinding into something collective.
- **Anti-burnout design** — suggest rest days, offer light "off-season" content, avoid streak-shame messaging. Missing a day should never feel like "starting over."
- **Cosmetic-only rewards** — skins, avatar gear, region banners. Keeps progression rewarding without gating actual learning content.

---

## 5. Multiplayer & Social

- **Real-time duels** — same problem, race to first correct submission, spectate live typing/cursor (reference: CodinGame's Clash of Code).
- **Co-op boss fights** — split a large problem into subproblems across 2 players.
- **Guilds** — shared streak goals and leaderboards; social accountability consistently outperforms solo willpower.
- **Ghost racing** — async race against a friend's replay.
- **Seasonal ranked ladder** — Elo-style, with placement matches; gives long-term players a reason to return after finishing the map.
- **Guild wars / cross-guild seasonal events** — periodic large-scale competitions between guilds.

---

## 6. Contests

- **Weekly timed contest** per region theme, Codeforces-style scoring (speed + correctness).
- **Monthly grand tournament** — bracket format, friends/guilds.
- **Speedrun leaderboards** — per-problem optimization race for players who like min-maxing runtime/space.

---

## 7. Content & Maintainability

### 7.1 Pattern Tagging Rules

Every problem is tagged with:
- **Primary pattern** (mandatory, single value) — determines which region/level the problem lives in. This is the pattern the problem is *meant* to teach.
- **Secondary patterns** (optional, multi-value) — many real problems blend patterns (e.g., a sliding window problem that also needs a hashmap for frequency counting). Secondary tags don't move the problem out of its region, but they're what make cross-pattern **boss fights** possible without a special "combo problem" category — a boss fight is just a problem whose secondary tags reach back into patterns the player has already cleared.

This also answers the practical "how do I pick which problem goes in which level" question: pull candidate problems from Striver/NeetCode/RisingBrain, group by primary tag, sort each group by difficulty, and that sorted order *is* the level sequence within the region.

### 7.2 Problem Metadata Schema

```json
{
  "id": "arr-002",
  "title": "Two Sum",
  "region": "array-coast",
  "primary_pattern": "hashmap-lookup",
  "secondary_patterns": ["two-pointers"],
  "difficulty": "easy",
  "source_sheet": "neetcode-150",
  "source_url": "https://leetcode.com/problems/two-sum/",
  "level_index": 2,
  "is_boss": false,
  "companies_tags": ["general"],
  "hints": [
    { "cost": 5, "text": "What if you stored each number's index as you scan?" },
    { "cost": 10, "text": "Try a hashmap of value -> index, checking target - current for each element." }
  ],
  "srs_interval_days": [1, 3, 7, 21],
  "estimated_time_minutes": 15
}
```

Notes:
- `region` + `level_index` place the problem on the map; `is_boss` flags region-ending problems (these should always carry 2+ secondary patterns).
- `srs_interval_days` drives the spaced repetition dungeon (Section 3) — when a problem resurfaces after being solved.
- `source_sheet` + `source_url` keep provenance clear when pulling from Striver/NeetCode/RisingBrain, useful both for licensing hygiene and for letting players cross-reference the original sheet.

### 7.3 Anti-cheat
Basic plagiarism/similarity detection between simultaneous duel or contest submissions.

---

## 8. Accessibility

- Colorblind-safe palettes.
- Adjustable or removable timers for anxiety-prone users.
- Text-to-speech for problem statements.
- Adjustable font sizing.

---

## 9. Why This Works (Design Rationale)

| Mechanic | Problem it solves |
|---|---|
| Regions = patterns | Curriculum coherence; avoids random problem-hopping |
| Boss fights | Tests transfer, not memorization |
| Soft gates | Prevents hard-stop quitting on one bad problem |
| Spaced repetition | Prevents "solved and forgotten" |
| Tiny daily quest | Protects the *habit* of showing up, not volume |
| Guilds / duels | Social accountability beats solo willpower |
| Streak freezes | Prevents all-or-nothing collapse after one missed day |
| Teach-back mode | Protégé effect strengthens retention |
| Adaptive difficulty | Keeps players in flow, avoids boredom or despair |

---

## 10. Open Questions / Next Steps

- **Tech stack & judge/execution engine architecture** (sandboxing, multi-language support, test case management).
- **Monetization model** (if any) — cosmetics-only is recommended to avoid pay-to-win perception.
- **V1 scope** — recommended to launch with a single region, streaks, and one multiplayer duel mode as a playable prototype before building the full map.
- **Mobile/offline mode** — for flashcard-style pattern recall on the go.

---

## 11. Suggested V1 Scope (Prototype)

To avoid over-building before validating the core loop:
1. One region (e.g., Array Coast) with ~10 levels + 1 boss fight.
2. Daily quest + basic streak (no freezes yet).
3. Pattern grimoire (simple collectible log).
4. One multiplayer mode: real-time duel.
5. Placement test skipped for v1 — everyone starts at level 1.

Expand outward from there once the core loop (solve → learn pattern → streak → duel) proves sticky.

---

## 12. Platform Decision

**Build as a web app first, not mobile.**

- Faster to build solo — no app store review, one deployment target instead of separate iOS/Android codebases.
- Easiest to demo for internship applications — a link a recruiter can click beats an app they have to install.
- DSA practice is a keyboard-and-desk activity; coding on a phone keyboard is a poor experience. Mobile only makes sense later as a companion app for spaced-repetition flashcard review (Section 3), not for solving problems.
- Diversifies the portfolio — the Unity pipeline already demonstrates hands-on/visual/3D work; a web app shows full-stack and systems thinking instead of doubling down on the same skill set.

A lightweight mobile companion (React Native/Flutter) for viewing the pattern grimoire and doing quick flashcard reviews on the go is a reasonable v2+ addition, not part of the core game.

---

## 13. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + TypeScript (Vite) | Component reuse across regions/levels/duel UI; type safety with no code reviewer on a solo project |
| Styling/UI | Tailwind CSS | Fast to build game-like UI without fighting CSS |
| In-browser code editor | Monaco Editor | Same engine as VS Code; free, syntax highlighting/autocomplete out of the box |
| Backend | Node.js + Express, or FastAPI (Python) | Either works; Python if the backend should double as DSA practice, Node for one language (TS) end-to-end |
| Realtime (duels, ghost racing, spectating) | Socket.IO or raw WebSockets | Required for live duels and shared world-boss state |
| Database | PostgreSQL | Relational fit for users, problems, attempts, regions, guilds |
| Caching / leaderboards / live state | Redis | Fast reads/writes for ranked ladder, live duel state, streak counters |
| Code execution / judge engine | Piston (open-source, self-hostable) | Originally planned as Judge0, but Judge0 1.13.0's bundled `isolate` sandbox requires legacy cgroup v1 and fails outright on this machine's cgroup v2-only kernel (confirmed via upstream Judge0 issue #543, open, unresolved as of this writing). Piston is built for cgroup v2, self-hosts the same way (Docker), and is free with no API key — same architecture decision (self-hosted, no hand-built sandbox for untrusted code), different engine |
| Auth | Clerk or Supabase Auth (or hand-rolled JWT) | Don't hand-roll auth security from scratch for a portfolio project |
| Hosting | Vercel (frontend) + Railway/Render/Fly.io (backend, Postgres, Redis) | Generous free tiers, well suited to a student project |

**Highest-risk component:** the judge engine. Safely executing untrusted user code is genuinely hard to get right from scratch — self-host an existing sandboxed judge engine (Piston) rather than building a custom sandbox, and swap it out later only if needed.

**Why this stack fits internship goals:** a real-time multiplayer system with a sandboxed code execution engine demonstrates systems thinking that's uncommon in student portfolios, and pairs naturally with the Unity pipeline — client-server design, WebSocket real-time systems, and 3D/graphics work together read as "can ship non-trivial systems," which is exactly what companies like Unity, Meshy, and Luma AI are screening for.

---

## 14. System Architecture (High Level)

```
                        ┌─────────────────────┐
                        │   React + TS (Vite)  │
                        │  Monaco editor, UI,   │
                        │  region map, duels    │
                        └─────────┬────────────┘
                                  │ HTTPS / WSS
                  ┌───────────────┴────────────────┐
                  │                                 │
        ┌─────────▼─────────┐             ┌─────────▼─────────┐
        │  API server         │             │  WebSocket server  │
        │  (Node/Express or    │             │  (Socket.IO)        │
        │  FastAPI)            │             │  duels, ghost race, │
        │  auth, CRUD,          │             │  world boss, live   │
        │  problem metadata     │             │  leaderboard         │
        └─────────┬─────────┘             └─────────┬─────────┘
                  │                                 │
        ┌─────────▼─────────┐             ┌─────────▼─────────┐
        │   PostgreSQL         │             │   Redis              │
        │  users, problems,     │             │  live duel state,     │
        │  attempts, regions,   │             │  ranked ladder,        │
        │  guilds, SRS state    │             │  streak counters        │
        └─────────────────────┘             └─────────────────────┘

                  ┌─────────────────────────────┐
                  │   Piston (self-hosted)         │
                  │   sandboxed multi-language      │
                  │   code execution + grading       │
                  └─────────────────────────────┘
                  Called by API server on submission
```

---

## 15. Build Plan (Phased)

**Phase 0 — Prototype (2–4 weeks)**
- One region (Array Coast), ~10 levels + 1 boss fight.
- Static problem set (JSON files, no DB yet) is fine to start.
- Monaco editor + Piston integration for submit/grade (see Section 13 note — swapped from originally-planned Judge0 due to a cgroup v2 host incompatibility).
- Basic auth, basic daily streak (no freezes yet).
- No multiplayer yet — validate the core solve → learn pattern → streak loop first.

**Phase 1 — Core Loop Hardening (2–3 weeks)**
- Move problem data into Postgres, build the metadata schema (Section 7.2).
- Pattern grimoire, post-solve reflection quiz, tiered hints.
- Spaced repetition dungeon (SRS scheduling on solved problems).

**Phase 2 — Social & Multiplayer (3–4 weeks)**
- WebSocket server; real-time duels (highest-value multiplayer mode first).
- Guilds, leaderboards, ghost racing.

**Phase 3 — Full Map & Contests (ongoing)**
- Expand to remaining regions in the finalized order (Section 2.1).
- Weekly contests, seasonal ranked ladder, monthly tournaments.
- Mock interview dungeon, teach-back mode.

**Phase 4 — Polish & Portfolio Packaging**
- Accessibility pass (Section 8).
- Deploy publicly, write up the project (architecture, design decisions, screenshots/demo video) for internship applications.

---

## 16. Open Risks to Track

- Judge engine self-hosting and sandbox security — budget real time for this, it's the technical core. (Originally Judge0; switched to Piston on Day 4 after Judge0 1.13.0 proved incompatible with this dev machine's cgroup v2-only kernel — see Section 13.)
- Realtime scaling for duels/world boss if usage grows beyond a demo audience.
- Content licensing/attribution when pulling problems from Striver/NeetCode/RisingBrain — keep `source_url` populated (Section 7.2) and link back rather than mirroring problem text where avoidable.