---
description: Review the current working tree diff for bugs and cleanups
---

Review the uncommitted changes in this repository:

1. Run `git diff` (and `git diff --staged`) to see all pending changes.
2. Look for correctness bugs first: logic errors, unhandled edge cases,
   missing error handling, security issues.
3. Then note quality issues: dead code, duplication, naming, missing tests.
4. Report findings ordered by severity, referencing `file:line` for each.
   If the diff looks good, say so plainly — don't invent findings.

$ARGUMENTS
