---
description: Stage changes and create a well-formed commit
---

Create a commit for the current changes:

1. Run `git status` and `git diff` to review what changed.
2. Group related changes; if unrelated changes are mixed together, ask whether
   to split them into separate commits.
3. Stage the relevant files and commit with a concise message that explains
   the "why", following this repository's existing commit message style
   (check `git log` for conventions).
4. Show the resulting commit with `git show --stat HEAD`.

Do not push unless explicitly asked.

$ARGUMENTS
