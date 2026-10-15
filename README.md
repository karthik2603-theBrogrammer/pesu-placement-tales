# PESU Placement Tales

Placement experiences from PESU seniors — browse company stories, share your interview journey, and help the next batch prepare.

**Live site:** https://pesu-placement-tales.vercel.app

## Features

- **Browse** placement and internship stories by company (`/browse`)
- **Contribute** your own interview experience, optionally anonymously (`/add-student`)
- **Feedback** boards for feature requests and bug reports
- **Pass the Torch** — apply to help maintain the project

## Tech stack

- [Next.js 14](https://nextjs.org) (App Router for pages, `pages/api` for API routes), React 18
- Tailwind CSS, NextUI, Framer Motion
- [Neon](https://neon.tech) serverless Postgres
- PostHog analytics (optional), deployed on Vercel

## Running locally

You need **Node.js 24** and a free Postgres database from [Neon](https://neon.tech). You never need access to the production database.

1. **Fork and clone** the repo, then install dependencies:

   ```bash
   git clone https://github.com/<your-username>/pesu-placement-tales.git
   cd pesu-placement-tales
   npm install
   ```

2. **Create a database.** Make a free Neon project, open its **SQL Editor**, and run the contents of
   [`db/setup.sql`](db/setup.sql), then [`db/seed.sql`](db/seed.sql) to load some fake sample data.
   (With `psql`: `psql "$DATABASE_URL" -f db/setup.sql -f db/seed.sql`.)

3. **Configure environment variables:**

   ```bash
   cp .env.example .env
   ```

   Set `DATABASE_URL` to your Neon connection string. The PostHog variables are optional; leave them empty.

4. **Start the dev server:**

   ```bash
   npm run dev
   ```

   Open http://localhost:3000.

## Project structure

```
app/          Pages and UI components (App Router)
pages/api/    Public API routes
utils/        Shared helpers (DB client, formatting)
lib/          PostHog server helpers
db/           setup.sql (local DB), seed.sql (fake data), schema.sql (production snapshot, reference only)
scripts/      One-off production migration scripts (maintainers only)
```

Moderation and admin tools live in a separate private repository and are not part of this codebase.

## Contributing

Contributions are welcome — bug fixes, features, design, and docs. Read [CONTRIBUTING.md](CONTRIBUTING.md)
to get started, and please follow our [Code of Conduct](CODE_OF_CONDUCT.md).

Found a security issue? Please report it privately — see [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE)
