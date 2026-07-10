# CLAUDE.md — Project Ground Rules for DSA Quest

This file is read automatically by Claude Code at the start of every session in this repo. It sets standing rules so they don't need to be re-pasted each day.

## Before doing anything

Read `DESIGN.md` first. It is the full spec for this project — architecture, tech stack, region/pattern structure, problem schema, and phased build plan. Refer back to it every session, not just the first one.

For the current day's task, check `CLAUDE_WORKFLOW.md` for which Phase/Day we're on and what today's specific goal and prompt are.

## Working style

- **Work in small, verifiable sub-tasks.** Don't chain multiple sub-tasks unsupervised. After each one, run it and confirm it actually works before reporting it as done — "done" means verified working, not "code written."
- **If a decision isn't covered in DESIGN.md** (e.g. exact schema for a table not yet defined, a library choice not listed in Section 13's tech stack), **stop and ask** rather than guessing and building. A wrong guess here can waste a whole session.
- **Stay inside today's scope.** If today's goal is "Monaco editor integration, no grading yet," don't also wire up Judge0 — that's tomorrow's task and doing it early skips the verification checkpoint in between.
- **Flag risk early.** Judge0 integration and WebSocket duel state are the two highest-risk parts of this project (per DESIGN.md Section 13/16). If something in these areas isn't working, say so clearly and explain the actual error rather than trying silent workarounds.

## Testing

- Write real tests only for the risky parts: Judge0 grading logic and WebSocket duel state.
- Don't add test coverage for static UI or simple CRUD — that's over-engineering for a portfolio project on a deadline.

## Git

- Commit at the end of each completed sub-task or day, with a message describing what actually works now (not what was attempted).
- Follow the commit message style already used in `CLAUDE_WORKFLOW.md`'s daily checklist (e.g. `feat: ...`, `chore: ...`, `refactor: ...`, `content: ...`).

## End of session

Before wrapping up, summarize in plain terms:
1. What was actually completed and verified today.
2. Anything left broken or unfinished, to note in tomorrow's session.
3. Any open question that needs a decision before continuing.