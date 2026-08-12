---
name: wrap-session
description: End-of-session wrap-up for the T-Rant project. Recaps what was built/fixed this session, updates README.md (and other spec docs only if genuinely stale) to match current behavior, commits and pushes to origin/master, and prints a copy-pasteable resume prompt for the next session. Use whenever the user signals they're stopping for the day in this repo - phrases like "let's stop here," "save progress," "wrap up," "commit and push," "save this to GitHub," or "give me a command for next time" all count, even if they don't name this skill explicitly.
---

# Wrap up a T-Rant session

Run this at the end of a working session in this repo, whenever the user is
wrapping up for the day - even if they don't invoke this skill by name,
treat phrases like "let's stop here," "save progress," "commit this," or
"give me something to paste into a new chat" as the trigger.

Do all four steps below without pausing to ask for confirmation on 1, 2, or
4. Step 3's push is pre-authorized for this skill specifically - see
CLAUDE.md at the repo root. (Any *other* git push, outside this skill, still
needs the normal explicit confirmation per standing safety practice.)

## 1. Recap

Scan this conversation plus `git status` and `git diff` to build a plain
bullet list of what was actually built, fixed, or changed this session -
not a restatement of what was discussed, only what changed. Show this to
the user first, before touching any files. This also refreshes your own
context on the session before you edit docs or write a commit message.

## 2. Keep the docs honest

Check whether README.md still accurately describes current behavior given
this session's changes. A stale README is worse than no README - it
actively misleads the next session (including a future you reading it cold
tomorrow). Only touch the other `*.md` files in the repo root
(`t-rant-phase2-brief.md`, `t-rant-technical-spec.md`, etc.) if something in
them is now factually wrong, not just incomplete - they're historical
planning docs, not living state docs, so leave them alone otherwise.

This is a correctness pass, not a rewrite: fix what's wrong or missing,
don't restyle prose that's already accurate.

## 3. Commit and push

Run `git status` and `git diff` across the whole repo (not just files you
personally touched this session - the user may have made other changes
too, by hand or in another session). Stage what belongs in this commit,
using judgment about what's actually part of this session's work (this
repo also contains unrelated personal planning docs like
`portfolio-projects-roadmap.md`, which is gitignored on purpose - don't
fight that).

Write a commit message describing *this session's* actual changes, not a
generic "update files" message. Commit, then push to `origin/master`.

If `git status` shows nothing to commit, say so plainly instead of creating
an empty commit or inventing a change to make.

## 4. Resume prompt for next time

Print a fenced code block the user can copy-paste to open a fresh chat and
pick up where this session left off. Default shape:

```
Read README.md, then t-rant-phase2-brief.md if you need more history, in
this T-Rant project folder. Also run `git log -8 --oneline` to see the
latest commits. That's the current state - let's continue from there.
```

Only deviate from this if this session's changes make a different pointer
genuinely more useful - e.g. a new doc file now holds the canonical state
instead. Don't over-engineer this: the point is a short, stable prompt the
user can paste without editing it.
