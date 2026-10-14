# Security Policy

## Reporting a vulnerability

Please **do not** open a public issue for security problems.

Report them privately through GitHub instead: go to the
[Security tab](https://github.com/karthik2603-theBrogrammer/pesu-placement-tales/security)
and click **Report a vulnerability**. Include the affected page or API route, steps to
reproduce, and what an attacker could do with it.

You should get a reply within a week. Once a fix is deployed, you are welcome to be credited
in the advisory.

## Scope

In scope: this repository and the live site at https://pesu-placement-tales.vercel.app.

Things we especially care about:

- Exposure of contributors' personal data (names of anonymous contributors, phone numbers, emails)
- Bypassing the admin token on `/api/admin/*` routes
- Writing to, or deleting from, the database without authorisation

Please don't run automated scanners or load tests against the live site, and never access or
modify data that isn't yours.
