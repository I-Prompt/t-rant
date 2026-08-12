# Working in this repo

Start a session by reading README.md for current state. The other `*.md`
files in the repo root (`t-rant-phase2-brief.md`,
`t-rant-MASTER-BUILD-BRIEF.md`, `t-rant-technical-spec.md`,
`t-rant-safety-legal-update.md`, `t-rant-quotes-by-category.md`) are
historical planning/spec docs, useful for background but not guaranteed to
reflect current behavior the way README.md is.

## Session wrap-up is pre-authorized to push

The user ends most working sessions with the `wrap-session` skill (see
`.claude/skills/wrap-session/SKILL.md`), which commits and pushes to
`origin/master` as its normal last step. That push is standing,
pre-authorized permission - run it without pausing to ask each time.

This authorization is scoped to that skill's own commit/push step only. Any
other git push in this repo - outside of running `wrap-session` - still
needs the normal explicit confirmation.
