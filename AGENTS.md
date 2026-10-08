# Project Instructions

## Project
This is a Laravel application with a React/Vite frontend.

## Environment
- PHP: 8.2
- Laravel: use the version defined by composer.json
- Node.js: 22+
- npm: 10+
- Database: MySQL
- Frontend: Vite

## Development Rules

### Git
- Never work directly on main unless explicitly requested.
- Create or use a feature branch for changes.
- Do not force push.
- Do not rewrite shared Git history.
- Review git diff before committing.
- Use clear commit messages.

### Environment
- Never modify or commit `.env`.
- Never expose API keys, passwords, tokens, or database credentials.
- Do not commit secrets.
- Do not modify production configuration unless explicitly requested.

### Database
- Never run `migrate:fresh`, `db:wipe`, or destructive database commands unless explicitly requested.
- Do not delete production data.
- Before modifying migrations, inspect the existing migration structure.

### Laravel
- Follow the existing project architecture and coding style.
- Reuse existing services, repositories, models, traits, and components where appropriate.
- Avoid unnecessary refactoring.
- Keep changes focused on the requested task.

### Frontend & Responsive Design
- Every new UI page or component MUST be fully responsive (mobile, tablet, desktop, starting from 360px width).
- Always include mobile navigation (hamburger menu / responsive drawers) and responsive table scrolling (`overflow-x-auto`).

### Testing
After modifying backend code:
- Run relevant tests first.
- Run `php artisan test` when practical.

After modifying frontend code:
- Run the relevant frontend checks.
- Run `npm run build` when practical.

### Before finishing a task
1. Inspect changed files.
2. Run relevant tests.
3. Check `git diff`.
4. Summarize what changed.
5. Report any tests that could not be run.

## Agent Workflow

### Before making changes
1. Read this AGENTS.md file.
2. Inspect the relevant existing code before modifying it.
3. Identify existing patterns and reusable components.
4. Do not make assumptions about application behavior when the codebase can be inspected.

### Code Changes
- Make the smallest change necessary to fulfill the request.
- Do not refactor unrelated code.
- Do not modify unrelated files.
- Preserve existing API contracts unless explicitly requested.
- Preserve existing database structure unless the task requires a migration.
- Do not remove existing functionality unless explicitly requested.

### Database Safety
- Never execute destructive SQL commands without explicit confirmation.
- Never modify production data.
- Do not run `php artisan migrate:fresh`.
- Do not run `php artisan db:wipe`.
- Do not truncate tables unless explicitly requested.
- Prefer migrations for schema changes.

### Git Safety
- Check the current branch before making changes.
- Never push directly to `main`.
- Never use `git push --force`.
- Never reset or discard user changes without explicit confirmation.
- Before committing, run `git status` and `git diff`.
- Do not commit `.env`, credentials, API keys, or other secrets.

### Testing
- Run the smallest relevant test first.
- If backend code changes, run relevant PHPUnit/Pest tests.
- If practical, run `php artisan test`.
- If frontend code changes, run relevant frontend checks.
- Run `npm run build` after significant frontend changes.

### Task Completion
Before reporting a task as complete:
1. Check `git status`.
2. Review `git diff`.
3. Run relevant tests.
4. Confirm the requested behavior.
5. Clearly report:
   - files changed
   - what was changed
   - tests executed
   - test results
   - anything that could not be verified
