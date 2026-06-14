---
name: Bug Report
about: Report a bug in @offload-project/rrule
title: "[Bug]: "
labels: bug
assignees: ''
---

### Description

A clear and concise description of the bug.

### Steps to Reproduce

Provide a minimal code sample reproducing the issue. Include the exact RRULE string and any `Date` values you used (timestamps in UTC are easiest to compare).

```ts
import { datetime, RRule, rrulestr } from '@offload-project/rrule'

// e.g. constructing a rule, calling .all(), parsing an RFC string, etc.
```

1. Build rule with '...'
2. Call '...'
3. See the unexpected output / error.

### Expected Output

What dates / string / behavior did you expect?

### Actual Output

What did you actually get? Paste returned dates, thrown errors, or stack traces.

```
// Paste output / error here
```

### Environment

- `@offload-project/rrule` version: [e.g., 2.9.0]
- Node version: [e.g., 20.19, 22.x]
- Runtime: [Node / Bun / browser — include browser name + version if applicable]
- Operating system: [e.g., macOS 14, Ubuntu 22.04, Windows 11]
- Local timezone: [run `date` in your terminal and paste the timezone, e.g., `PDT`, `Europe/Berlin`]

### Additional Context

Anything else that might help — TZID being used, whether you saw the bug only after DST, related packages, etc.
