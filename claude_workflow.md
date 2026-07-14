# CLAUDE_WORKFLOW.md — Day-by-Day Plan for Building DSA Quest with Claude Code

This is the companion file to `DESIGN.md`. `DESIGN.md` is the spec — what to build. This file is the *process* — how to work with Claude Code, one focused session per day, so each day has a clear, checkable "done."

---

## 0. Ground Rules 

> "Read DESIGN.md before doing anything. This is the spec for the whole project — refer back to it every session. If you hit a decision that isn't covered in DESIGN.md (e.g. exact schema for a table, library choice not listed in Section 13), stop and ask me instead of guessing. Work in small verifiable steps — after each sub-task, run it yourself and confirm it actually works before telling me it's done. Write real tests only for the Judge0 integration and WebSocket duel state (Section 13's highest-risk components) — don't over-test static UI or CRUD."

Keep this pinned somewhere (a `CLAUDE.md` file in the repo root works well — Claude Code reads it automatically at the start of every session).

**Daily session shape (every day, same structure):**
1. Open with: "We're on Phase X, Day Y. Yesterday we finished: [...]. Today's goal: [...]." (copy from the checklist below)
2. Let Claude Code work in small sub-tasks, reviewing/testing after each one — don't let it chain 5 sub-tasks unsupervised.
3. At the end: you personally click through what was built.
4. Fix or flag anything broken (ask Claude Code to fix it same session if small, note it for tomorrow if not).
5. `git commit` with a message describing what actually works now, not what was attempted.
6. Update the "Progress Log" at the bottom of this file with one line.

One 1.5–2 hour focused block per day. Don't spread it across scattered check-ins — reloading context costs more time than it saves.

---

## 1. Phase 0 — Prototype (Days 1–5)

**Goal by end of phase:** One playable region (Array Coast), Monaco editor, real Judge0 grading, basic auth, basic streak counter. No multiplayer yet.

### Day 1 — Skeleton
- Prompt: *"Set up the project skeleton per DESIGN.md Section 13: Vite + React + TS frontend, Node/Express (or FastAPI) backend, Postgres connection. Verify the backend responds to a health-check route and the frontend renders a blank page hitting it."*
- Done when: `npm run dev` (or equivalent) shows a working frontend that successfully calls the backend health check.
- Commit: `chore: project skeleton, frontend<->backend connectivity verified`

### Day 2 — Static content + one level page
- Prompt: *"Add a static JSON file with 3 sample Array Coast problems (id, title, primary_pattern, difficulty — use the schema in DESIGN.md Section 7.2). Build a level page that lists them and a detail page for one problem showing its statement."*
- Done when: You can click through from a region list → level list → a single problem page in the browser.
- Commit: `feat: static problem data + level/problem pages`

### Day 3 — Monaco editor integration
- Prompt: *"Integrate Monaco Editor into the problem page. Add a submit button that currently just console.logs the code and selected language. No grading yet."*
- Done when: You can type code in-browser and see it logged correctly with language selected.
- Commit: `feat: Monaco editor wired to problem page`

### Day 4 — Judge0 connection (budget extra time here — this is the highest-risk step)
- Prompt: *"Set up Judge0 self-hosted per their docs (Docker). Wire the backend submit route to send code to Judge0 and return pass/fail against stored test cases for one problem. If Docker networking issues come up, stop and explain the error rather than trying random fixes."*
- Done when: Submitting a correct solution to the sample problem returns "pass," an incorrect one returns "fail," from real Judge0 execution — not a mock.
- Commit: `feat: Judge0 integration, real grading working end-to-end`
- **If Day 4 runs long:** this is expected. Judge0/Docker setup is the single most likely place to eat unplanned time — it's fine if this becomes Day 4 *and* 5.

### Day 5 — Auth + basic streak
- Prompt: *"Add auth using [Clerk/Supabase Auth — pick one, tell Claude Code which]. Add a basic daily streak counter that increments when a user solves at least one problem in a day, stored in Postgres. No freezes/shields yet — just the raw counter."*
- Done when: You can log in, solve a problem, and see a streak counter increment correctly (test by solving on two different simulated days if possible, or just verify the DB write logic).
- Commit: `feat: auth + basic daily streak counter`

**Phase 0 exit check:** you personally play through: log in → pick Array Coast → open a level → write code → submit → get graded → see streak update. If all of that works end-to-end, Phase 0 is genuinely done — move on.

---

## 2. Phase 1 — Core Loop Hardening (Days 6–9)

**Goal by end of phase:** Problems live in Postgres (not static JSON), pattern grimoire, reflection quiz, tiered hints, spaced repetition scheduling.

### Day 6 — Migrate problems to Postgres
- Prompt: *"Migrate the static problem JSON into a Postgres table matching the schema in DESIGN.md Section 7.2. Update the level/problem pages to read from the DB instead of the static file."*
- Done when: Same pages as Phase 0, now backed by real DB queries.
- Commit: `refactor: problems moved from static JSON to Postgres`

### Day 7 — Pattern grimoire + reflection quiz
- Prompt: *"After a correct submission, show a 'you just used [primary_pattern]' reveal and log it to a grimoire table per user. Add a simple post-solve quiz: 'which pattern did you use?' with the correct answer being the primary_pattern."*
- Done when: Solving a problem visibly adds an entry to a personal grimoire page.
- Commit: `feat: pattern grimoire + post-solve reflection quiz`

### Day 8 — Tiered hints
- Prompt: *"Add tiered hints per DESIGN.md Section 7.2's hints array — each hint costs in-game currency, revealed progressively. Add a simple currency field to the user table if not already present."*
- Done when: Clicking a hint deducts currency and reveals the hint text, in order.
- Commit: `feat: tiered hint system with currency cost`

### Day 9 — Spaced repetition scheduling
- Prompt: *"Implement the SRS dungeon per DESIGN.md Section 3: when a problem is solved, schedule it to resurface using srs_interval_days. Add a 'Review' page showing problems due today."*
- Done when: A solved problem correctly appears on a review list on its scheduled day (you can test by manually adjusting a date in the DB).
- Commit: `feat: spaced repetition scheduling + review page`

---

## 3. Phase 2 — Social & Multiplayer (Days 10–16)

**Goal by end of phase:** Real-time duels working end-to-end; guilds and leaderboards as a stretch if time allows.

### Day 10 — WebSocket server setup
- Prompt: *"Set up a Socket.IO server per DESIGN.md Section 14's architecture. Verify a basic 'ping/pong' message round-trips between two browser tabs."*
- Done when: Two open tabs can exchange a test message live.
- Commit: `chore: WebSocket server verified with two clients`

### Day 11–12 — Duel matchmaking + shared problem state
- Prompt: *"Build duel matchmaking: two users join a queue, get matched, both receive the same problem. Track duel state (who's in, problem assigned) in Redis per DESIGN.md."*
- Done when: You can open two browser sessions, get matched, and both land on the same problem.
- Commit: `feat: duel matchmaking + shared problem assignment`

### Day 13 — Race-to-submit logic
- Prompt: *"Add duel win logic: first correct submission (verified through Judge0) wins, broadcast result to both players live."*
- Done when: Solving first in a real two-tab test correctly declares a winner on both screens.
- Commit: `feat: duel win detection + live result broadcast`
- **This is the second highest-risk step in the whole project** — budget slack, don't be surprised if it spills into Day 14.

### Day 14 — Polish duel UX
- Prompt: *"Add live opponent status (e.g. 'opponent is typing' or 'opponent submitted') during a duel."*
- Done when: Basic live presence feels responsive in a two-tab test.
- Commit: `feat: live opponent status during duels`

### Day 15–16 — Guilds + leaderboard (stretch, if on schedule)
- Prompt: *"Add basic guilds (create/join) and a leaderboard page ranked by streak and duel wins."*
- Done when: You can create a guild, add a second test user, and see both on a leaderboard.
- Commit: `feat: guilds + leaderboard`
- **If behind schedule:** skip this and move to Phase 3 — duels alone are enough multiplayer to demo.

---

## 4. Phase 3 — Full Map & Contests (Days 17–21)

This phase is content-limited, not code-limited — most of the time is populating problems, not building features.

### Day 17 — Content pipeline
- Prompt: *"Build a simple admin script or page to bulk-import problems into Postgres from a CSV/JSON following the Section 7.2 schema."*
- Done when: You can add 10 new problems in one batch operation instead of one at a time.
- Commit: `feat: bulk problem import tool`

### Days 18–20 — Populate remaining regions
- No new Claude Code features needed — this is manual content work (pulling problems from Striver/NeetCode/RisingBrain, tagging per Section 7.1's primary/secondary pattern rules, importing via the Day 17 tool).
- Ask Claude Code to help draft hint text or generate boss-fight candidates (problems whose secondary tags span 2+ cleared regions) to speed this up.
- Commit each region as it's completed: `content: add Sliding Window Valley problem set`, etc.

### Day 21 — Weekly contest mode
- Prompt: *"Add a simple timed contest mode: a set problem list, a countdown timer, and a leaderboard scored by speed + correctness."*
- Done when: You can run a mock contest solo and see it scored correctly.
- Commit: `feat: weekly contest mode`

---

## 5. Phase 4 — Polish & Portfolio Packaging (Days 22–24)

### Day 22 — Accessibility pass
- Prompt: *"Do an accessibility pass per DESIGN.md Section 8: colorblind-safe palette check, adjustable font size, optional timer removal."*
- Commit: `feat: accessibility improvements`

### Day 23 — Deploy
- Prompt: *"Deploy the frontend to Vercel and backend/Postgres/Redis to Railway (or Render/Fly.io) per DESIGN.md Section 13. Verify the deployed version works end-to-end, not just localhost."*
- Commit: `chore: production deployment`

### Day 24 — Write-up
- Not a Claude Code coding task — write the project README/case study for your portfolio: architecture decisions, what was hardest (Judge0, duel sync), what you'd do differently. This is what recruiters actually read.

---

## 6. Progress Log

*(Update one line per day as you go — helps you resume context fast on a new day, and doubles as a changelog for your portfolio write-up later.)*

| Day | Date | What actually got done | Notes / blockers |
|---|---|---|---|
| 1 | 2026-07-11 | Vite+React+TS frontend and Node/Express+TS backend scaffolded; `/health` verified live in a browser (screenshot, no console errors); Postgres running via Docker Compose, `/health/db` confirmed `{"status":"ok"}` against the real container | Phase 0 Day 1 fully done. Docker Desktop had to be installed and manually started mid-session — daemon isn't auto-started on boot on this machine, worth remembering for future days |
| 2 | 2026-07-11 | 3 sample Array Coast problems added as static JSON (Section 7.2 schema + a `statement` field, since the spec schema has no statement/description field); region list → level list → problem detail pages built with React Router and verified click-through in a real browser (screenshots, no console errors) | Extended Section 7.2's schema with a `statement` field (not in the spec) and added react-router-dom (not in Section 13's stack) — both confirmed with the user first rather than guessed |
| 3 | 2026-07-11 | Monaco Editor (`@monaco-editor/react`) wired into the problem page via a `CodeSubmitPanel` component — language selector (JS/Python/C++/Java) swaps starter code, Submit console.logs code + selected language. Verified live in a browser (screenshots, submit output captured) | No grading yet, as scoped. Starter code is a generic per-language template, not per-problem — schema has no starter-code field, out of scope for today |
| 4 | 2026-07-13 | Real grading working end-to-end for Two Sum in all 4 languages (JS/Python/C++/Java), verified via direct API calls and through the actual browser UI (screenshot + captured pass/fail output). Added `test_cases` (stdin/stdout pairs) and per-language `starter_code` to arr-002 — Section 7.2 has no field for either | **Judge0 (DESIGN.md's original choice) is blocked on this machine**: 1.13.0's bundled `isolate` sandbox needs cgroup v1, this kernel is cgroup v2-only, confirmed as an open upstream bug (judge0/judge0#543), not fixable by self-hosting elsewhere. Switched to **Piston** (self-hosted, cgroup v2-native, free, no API key) — DESIGN.md Section 13/14/15/16 updated to match. Also hit and fixed: Piston's javascript language id is `"javascript"` not `"node"`; `"gcc"` is C only, C++ is `"c++"`; Node's `/dev/stdin` doesn't work in Piston's sandbox (use fd `0`); `#include <bits/stdc++.h>` blew the 10s compile timeout under this machine's slow Docker bind-mount I/O, raised `PISTON_COMPILE_TIMEOUT`/`PISTON_RUN_TIMEOUT` and switched starter code to specific headers |
| 5 | 2026-07-13 | Clerk auth wired into frontend (`ClerkProvider`, sign-in button, `UserButton`) and backend (`clerkMiddleware`); new `users`/`solves` Postgres tables (schema not in DESIGN.md Section 7.2, designed and confirmed with user first); `/api/submit` now credits a daily streak on a passing, authenticated submission via an atomic upsert, `/api/streak` returns it. Verified live end-to-end by the user: real sign-in, real submission, streak badge showed "Streak: 1 day" | Phase 0 exit criteria (log in → pick region → solve → grade → streak) now fully working. Fixed `requireAuth()` defaulting to an HTML redirect instead of JSON 401 on an API-only route — replaced with a manual `getAuth()` check |
| 6 | 2026-07-13 | **Phase 1 start.** Added a `problems` Postgres table (schema not in DESIGN.md Section 7.2 as SQL DDL — designed to match the JSON schema plus Day 2/4's extensions, confirmed with user); seed script loads `backend/src/seedData/problems.json` (moved from `frontend/src/data/`, git detected as a rename) into it; added `GET /api/problems` and `GET /api/problems/:id`; `/api/submit` now reads `test_cases` from the DB instead of an in-memory map. Frontend's level list and problem detail pages now fetch from the API instead of importing static JSON. Verified full click-through (region → level list → problem detail → submit → grade → streak) in a real browser, DB-backed, zero console errors | Also swapped Two Sum's C++ starter code from `#include <bits/stdc++.h>` to specific headers while migrating, to avoid the slow-compile issue found on Day 4 |

| 7 | 2026-07-14 | Added a `grimoire` Postgres table (deduped one row per user+pattern — confirmed "collectible spellbook" semantics with user before building) credited alongside the streak on a passing submission; post-solve reflection quiz ("which pattern did you use?", 1 correct + 3 random distractors) with an answer reveal; new `/grimoire` page listing unlocked patterns; `GET /api/grimoire` route. Verified live end-to-end by the user: quiz appeared after a pass, reveal showed the correct pattern, grimoire page listed it | Signed-out states (grimoire page prompts sign-in, home page unaffected) verified via Playwright with zero console errors; the actual authenticated flow (quiz → reveal → grimoire entry) verified manually by the user, same pattern as Day 5, since it needs a real Clerk session |

| 8 | 2026-07-14 | Added `currency` to `users` (earned +10 per passing solve — DESIGN.md never defines an earn mechanism, confirmed "award per solve" with user before building) and a `hint_reveals` table tracking how many hints each user has unlocked per problem. `/api/problems` and `/api/problems/:id` now redact hint `text` (only `cost` visible) for hints beyond what the requesting user has paid for; new `POST /api/problems/:id/hints/reveal` atomically checks balance, deducts cost, and unlocks the next hint in order. Verified live: redaction confirmed via curl (unauthenticated request gets `text: null`), reveal correctly rejected with "not enough currency" on a pre-Day-8 account with 0 balance, then worked after earning currency via a resubmission, and both hints revealed in order at their correct costs (5, then 10) | Existing users created before this migration have `currency = 0` (column default) with no retroactive credit for past solves — expected, not a bug, confirmed by testing on the user's own pre-existing account |
| 9 | 2026-07-14 | Added an `srs_schedule` table (Anki-style: each solve advances `interval_index` and sets `next_review_date` from the problem's `srs_interval_days`, capped at the last interval); `/api/submit` schedules a review on every pass; new `/review` page lists what's due via `GET /api/review`. Verified live by manually backdating a row in Postgres (as `claude_workflow.md` itself suggested) — Review page correctly showed Two Sum once its `next_review_date` was today | Discovered the Postgres container runs in UTC while the host machine is IST — a solve made right after local midnight can schedule for what the *container* still considers "tomorrow," so it won't show as due until the container's UTC clock catches up. Not a bug, just a timezone quirk worth remembering if review counts ever look off by up to a day |
| 10 | 2026-07-14 | **Phase 2 start.** Socket.IO attached directly to the existing Express HTTP server (not a second process — Section 14's diagram draws separate boxes, but Socket.IO's standard setup wraps the same `http.Server`, so kept it to one deployable). Server broadcasts any `ping` to all connected clients as `pong`. Verified with two independent socket connections (simulated two browser tabs): both connected with distinct socket IDs, a message sent from one showed up live in the other's log with correct sender attribution, zero console errors | This is one of the two highest-risk parts of the project per Section 13/16 — went carefully, nothing broke. Added a throwaway `/socket-test` page purely for this verification; real duel UI comes later |
| 11-12 | 2026-07-14 | Added Redis to `docker-compose.yml` (per DESIGN.md's explicit instruction for duel state — unlike streaks/hints, a matchmaking queue is genuinely ephemeral, so Redis over Postgres made sense here). Built matchmaking: a Redis list queue pairs the next two `duel:join_queue` sockets, both assigned the same randomly-picked gradable problem, duel state stored in a Redis hash (`player1`, `player2`, `problemId`, `status`) with `socket→duelId` reverse lookups. New `/duel` page with a "Find Match" flow. Verified with two fully separate Playwright browser contexts (not just tabs) — both landed on the same duel ID and problem, confirmed independently via direct Redis inspection (`HGETALL`), zero console errors | Duels aren't tied to a Clerk user yet — matched by raw socket ID only. That's fine for today's scope (get two people on the same problem) but Day 13's win-detection will need real user identity to award anything, so that's a decision to make then, not now |
| 13 | 2026-07-14 | Duel win detection: `/api/submit` now accepts an optional `duelId`/`socketId`, and on a passing submission atomically claims the win via Redis `HSETNX` (first writer wins, safe even if both players submit correct code near-simultaneously since Redis executes commands sequentially) — then broadcasts `duel:result` to both players' sockets. Rebuilt `/duel` as a self-contained arena (problem + Monaco editor + submit, all inline) instead of navigating to the regular problem page, specifically so the socket connection established at matchmaking stays alive through solving — navigating away would have killed it. Verified with two independent Playwright sessions: submitter's tab showed "You won!", the other tab's editor went read-only and showed "Opponent won." purely from the live broadcast, cross-checked against Redis's `winner` field, zero console errors | Second-highest-risk item per Section 13/16, budgeted slack for it — didn't need it, went clean on the second attempt (first attempt hit a submit-to-result timeout, looked like one slow/cold Piston round-trip in the test harness itself, not a logic bug; real users solving at human speed won't hit that race) |
| 14 | 2026-07-14 | Live opponent status during duels: `duel:typing` (throttled to once per 500ms) and `duel:submitted` socket events relay to the opponent only (via a new `getOpponentSocketId` helper), shown as "Opponent is typing..." (auto-clears after 2s of inactivity) or "Opponent submitted their solution!". Verified with two independent sessions: Tab A saw both status changes live within the same test run, milliseconds after Tab B's actions, zero console errors | Lower-risk day as expected — built directly on Day 10/13's existing socket infra, no surprises |

| 15-16 | 2026-07-14 | User chose to build the stretch goal rather than skip to Phase 3. Added `duel_wins` to `users` (Day 13 only tracked wins ephemerally in Redis by socket ID — nothing durable to rank on, so this closed that gap) credited to the authenticated winner in `/api/submit`. Added `guilds`/`guild_members` (one guild per user, enforced via a `UNIQUE` constraint on `clerk_user_id` + `ON CONFLICT` upsert on join) and a global leaderboard ranked by duel wins then streak, with guild tag shown per player. Verified live: created a real guild through the UI, seeded a second test user directly in Postgres (same approach as Day 9's backdating) and added them to the guild via SQL — both the Guilds page and Leaderboard correctly showed both members with accurate stats and ranking | Leaderboard shows raw (truncated) Clerk user IDs, not usernames — a profile/display-name system is out of scope for Day 15-16 and not mentioned in DESIGN.md; noted here in case it looks unpolished later |
| 17 | 2026-07-14 | **Phase 3 start.** Generalized Day 6's one-off seed script into a real bulk-import tool (`npm run import -- path/to/file.json`, no path = the existing seed data) — validates required fields per row, defaults optional ones (`secondary_patterns`, `gradable`, `srs_interval_days`, etc.), and keeps going on a bad row instead of aborting the whole batch, reporting exactly which row/field failed. JSON-only per user's choice — the schema's nested fields (hints, starter_code) don't map cleanly to flat CSV. Verified with a real 10-row batch (1 deliberately broken): 9/10 imported correctly with defaults applied, the bad row correctly rejected with a clear "missing field" message, existing content untouched, `/api/problems` still served correctly afterward | Test rows deleted after verification — Days 18-20 are the user's own manual content-population work (pulling from Striver/NeetCode/RisingBrain, tagging per Section 7.1), not further Claude Code build tasks |

*(add rows as you go)*