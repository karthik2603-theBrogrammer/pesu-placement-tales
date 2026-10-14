# Contributing to PESU Placement Tales

Thanks for helping the next batch prepare! This guide covers how to propose and submit changes.

> Want to share your **placement experience**? You don't need GitHub for that — use the
> [Contribute page](https://pesu-placement-tales.vercel.app/add-student) on the site.
> This guide is for contributing **code**.

## Ways to contribute

- Fix a bug or pick up an issue labelled `good first issue` or `help wanted`
- Propose a feature (open an issue first so we can agree on the approach)
- Improve the UI, accessibility, docs, or performance

## Workflow

1. **Open or claim an issue** before starting anything non-trivial, and comment that you're working on it.
2. **Fork** the repo and create a branch from `main`: `git checkout -b fix/short-description`.
3. **Set up locally** by following [Running locally](README.md#running-locally). Use your own Neon
   database with the fake data from `db/seed.sql` — never real student data.
4. **Make your change.** Keep pull requests small and focused on one thing.
5. **Check it builds:** `npm run build` must pass (CI runs it on every pull request).
6. **Open a pull request** against `main`, fill in the template, and link the issue (`Closes #123`).
   Add screenshots for UI changes.

A maintainer will review your PR. Merging to `main` deploys straight to the live site, so expect
questions and change requests — that's normal.

## Guidelines

- **Personal data:** never return phone numbers, emails, or the real identity of anonymous
  contributors from public API routes or pages. Admin-only data belongs under `pages/api/admin`
  and must call `requireAdmin` from `utils/adminAuth.js`.
- **Database changes:** if your change needs a new table or column, update `db/setup.sql` (and
  `db/seed.sql` if useful) and describe the exact SQL in your PR. A maintainer will apply it to
  production before merging.
- **Dependencies:** avoid adding new packages unless they're clearly needed; explain why in the PR.
- **Secrets:** never commit `.env` files, tokens, or connection strings.
- **Commits:** write clear messages, e.g. `fix: keep search focus while typing`.

## Questions

Open a [discussion or issue](https://github.com/karthik2603-theBrogrammer/pesu-placement-tales/issues)
— we're happy to help you get started.

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE)
and that you'll follow the [Code of Conduct](CODE_OF_CONDUCT.md).
