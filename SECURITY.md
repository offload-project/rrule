# Security Policy

## Supported versions

Security fixes are applied to the latest minor release line. Older minor versions may receive fixes for critical issues at the maintainers' discretion — when in doubt, please upgrade.

| Version       | Supported              |
| ------------- | ---------------------- |
| `2.9.x`       | ✅                     |
| `2.x` (older) | ⚠️ critical fixes only |
| `< 2.0`       | ❌ (please upgrade)    |

## Reporting a vulnerability

**Please do not open a public GitHub issue for security reports.**

Use [GitHub Security Advisories](https://github.com/offload-project/rrule/security/advisories/new) to report privately. This lets us discuss, fix, and coordinate disclosure before details become public.

When reporting, please include:

- A description of the issue and its potential impact.
- Steps to reproduce, or a minimal proof-of-concept (RRULE string, code snippet, input that triggers the issue).
- Affected `@offload-project/rrule` version(s), Node version, and runtime (Node / Bun / browser).
- Any suggested fix or mitigation (optional).

## Response expectations

- **Acknowledgement:** within 5 business days.
- **Initial assessment:** within 10 business days.
- **Fix timeline:** depends on severity. Critical issues get prioritized; lower-severity issues may be batched into the next regular release.

We'll keep you updated on progress and credit you in the advisory unless you'd prefer to stay anonymous.

## Scope

Things in scope for this project:

- Vulnerabilities in any code published under `@offload-project/rrule` (the `RRule`, `RRuleSet`, `rrulestr`, `validate`, NLP, and parsing modules).
- Parser issues that allow crafted RRULE / RDATE / EXDATE input to cause unbounded resource consumption (CPU, memory) — e.g., catastrophic backtracking, runaway occurrence generation that cannot be aborted.
- Prototype-pollution or unsafe property-access issues in options parsing.
- Incorrect occurrence generation that could be exploited downstream (e.g., scheduling logic relying on `rrule` skipping or producing dates it shouldn't).
- Cross-site scripting risk in any HTML or text output produced by the library (e.g., `toText`, demo app under `index.html`).

Things **not** in scope (please report upstream or with the relevant project):

- Vulnerabilities in Node, Bun, Vite, Biome, Jest, or other dev/runtime dependencies — please file with the respective project.
- Application-level misconfiguration in a consuming app (e.g., trusting unvalidated user input as an RRULE string without rate-limiting, or rendering `toText` output without escaping in a context that requires it).
- Timezone or DST quirks that result from documented behavior in the [Timezone Support](README.md#timezone-support) section of the README. If you believe the documented behavior is itself the vulnerability, please explain.
- Issues caused by user-supplied implementations of the library's extension points (custom `gettext`, custom `dateFormatter`, custom `Language` objects).

## Disclosure

Once a fix is published, we will:

1. Publish a GitHub Security Advisory with details and credit.
2. Tag a patch release.
3. Update the changelog with a brief mention (without exploit details prior to the disclosure window).

Thanks for helping keep the project and its users safe.
