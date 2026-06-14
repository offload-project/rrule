# Contributing to rrule

Thanks for your interest in contributing! This document outlines the process and standards for contributing to `@offload-project/rrule`.

## Code of Conduct

By participating in this project, you agree to treat fellow contributors with respect. Be kind, assume good intent, and keep discussions focused on the work. See the full [Code of Conduct](CODE_OF_CONDUCT.md).

## Ways to Contribute

- Reporting bugs via the [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md) template
- Proposing new features via the [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md) template
- Improving documentation (`README.md`, `CHANGELOG.md`)
- Fixing bugs or implementing features through pull requests
- Reviewing open pull requests

Before opening a large PR, please open an issue first to discuss the approach.

## Requirements

- Node **20.19+**
- [Bun](https://bun.sh/) (the project uses `bun.lock` and Bun-based scripts)

## Getting Set Up

1. Fork the repository on GitHub and clone your fork:

   ```bash
   git clone git@github.com:<your-username>/rrule.git
   cd rrule
   ```

2. Install dependencies:

   ```bash
   bun i
   ```

3. Create a feature branch off `main`:

   ```bash
   git checkout -b feat/short-description
   ```

## Development Workflow

### Running the Test Suite

```bash
bun run test
```

Tests are written with [Jest](https://jestjs.io/) and live under `test/`. New behavior should be covered by tests; bug fixes should include a regression test.

### Linting and Formatting

This project uses [Biome](https://biomejs.dev/) for linting and formatting.

```bash
bun run lint        # check only
bun run check       # apply fixes
bun run format      # format only
```

A Husky `pre-commit` hook runs `lint-staged` — PRs must pass Biome checks.

### Building

```bash
bun run build
```

This runs `tsc` for type-checking and then bundles via Vite into `dist/`.

### Local Demo

```bash
bun run dev
```

Starts the Vite demo app at the URL printed in the terminal.

## Changesets

User-facing changes need a changeset so the release workflow can pick them up. Run:

```bash
bun run change
```

…and follow the prompts. The generated Markdown file under `.changeset/` should be committed with your PR.

Tooling-only / docs-only changes that should **not** trigger a release can skip the changeset.

## Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/).

Format: `<type>(<optional scope>): <description>`

Common types used in this repo:

| Type        | Use for                                            |
| ----------- | -------------------------------------------------- |
| `feat`      | New user-facing functionality                      |
| `fix`       | Bug fixes                                          |
| `deprecate` | Marking existing API as deprecated                 |
| `refactor`  | Internal change with no behavior difference        |
| `test`      | Adding or updating tests                           |
| `docs`      | Documentation only                                 |
| `chore`     | Tooling, dependency bumps, repo housekeeping       |
| `ci`        | Changes to GitHub Actions workflows                |

Examples (from this project's history):

- `feat: rrule and ruleset validate`
- `chore: drop version back, add changeset, add build`

Breaking changes: add `!` after the type (e.g., `feat!: rename RRule.parseString`) and explain the migration path in the PR body.

## Pull Requests

1. Make sure your branch is up to date with `main`.
2. Run the full local check before pushing:

   ```bash
   bun run lint && bun run test && bun run build
   ```

3. Push your branch and open a PR against `main` using the [PR template](.github/pull_request_template.md).
4. Fill in:
   - What changed and why
   - Type of change (bug fix, feature, breaking, deprecation, etc.)
   - How it was tested (Node version, runtime, timezone)
   - Whether a changeset was added
5. Keep PRs focused. One logical change per PR makes review faster and bisection easier.
6. CI must pass before review:
   - `test.yml` — Jest test suite
   - `release.yml` — release pipeline (validated on `main`)
7. Address review feedback in additional commits rather than force-pushing while review is active.

## Adding or Changing Features

When working on this library, keep these areas in mind:

- **RFC compliance** — `rrule` implements [RFC 5545](https://tools.ietf.org/html/rfc5545). Document any intentional deviations in the README's "Differences From iCalendar RFC" section.
- **Public API** — `RRule`, `RRuleSet`, `rrulestr`, `validate`, `datetime`, and the exported types are part of the public contract. Renames or signature changes are breaking; deprecate first when possible.
- **Timezones** — date handling is the trickiest part of this library. Read the [Timezone Support](README.md#timezone-support) section of the README before changing anything that touches `tzid`, `dtstart`, or occurrence generation.
- **Natural-language text** — additions to `toText` / `fromText` should keep the existing language structure (see `src/nlp/`) and add tests in `test/`.
- **Caching** — `RRule` and `RRuleSet` cache results unless `noCache` is set. New occurrence-retrieval methods should respect this.

## Documentation

If your change affects public API, configuration, or usage, update:

- `README.md` — quick start, API reference, examples
- `CHANGELOG.md` — generated from changesets at release time; you only need to write the changeset

## Reporting Security Issues

Please do **not** open a public issue for security vulnerabilities. See [SECURITY.md](SECURITY.md) for the private reporting process.

## License

By contributing, you agree that your contributions will be licensed under the [BSD-3-Clause License](LICENSE.md) that covers this project.
