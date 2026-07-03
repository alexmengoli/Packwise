# AGENTS.md

## Project context

This repository contains **Packwise**, an offline-first packing organizer.

Users create items, assign them to one or more activities (for example: camping, beach, MTB), and generate packing lists based on selected activities.

The long-term product architecture is:

- a local-first client application that works without an account
- an optional separate backend for accounts, backups, and paid sync

Do not make cloud sync, authentication, or internet access required for the core app.

## Repository structure

This repo is a pnpm monorepo named `packwise`.

- `apps/web`: the complete Ionic + Angular client application.
- `packages/shared`: framework-independent TypeScript models, types, and reusable domain utilities.
- `package.json`: root workspace scripts that delegate to packages.
- `pnpm-workspace.yaml`: pnpm workspace package discovery.
- `AGENTS.md`: instructions for Codex and other coding agents.
- `README.md`: human-facing project overview and commands.
- `.gitignore`: repository-wide ignore rules.

Keep app-specific UI and Ionic/Angular code inside `apps/web`. Keep reusable business types and pure domain logic inside `packages/shared`. Do not put persistence, browser APIs, Angular services, or UI concerns in `packages/shared`.

## Package manager

Use pnpm for all workspace dependency and script operations.

- Run commands from the repository root when possible.
- Use `pnpm install` to install dependencies.
- Use root scripts such as `pnpm build`, `pnpm lint`, and `pnpm test`.
- Use workspace filters for package-specific commands, for example `pnpm --filter @packwise/web build` or `pnpm --filter @packwise/shared build`.
- Do not use npm, yarn, or package-lock files in this repository unless a task explicitly requires a migration.

## Core engineering rules

- Keep the client fully usable offline.
- Store local user data on-device by default.
- Treat sync as optional and additive.
- Do not add server dependencies to core item, activity, or packing-list functionality.
- Do not introduce authentication unless the task explicitly requires it.
- Do not add analytics, tracking, ads, or third-party services unless explicitly requested.
- Prefer simple, maintainable solutions over clever abstractions.
- Avoid new dependencies unless they provide a clear benefit.

## Product scope

The current MVP includes:

- activities / tags
- items
- assigning items to activities
- generating packing lists from selected activities
- marking items as packed
- local persistence
- import/export where appropriate

Do not add these unless explicitly requested:

- collaboration
- social features
- public profiles
- AI recommendations
- travel itinerary planning
- shopping or inventory management
- mandatory accounts
- subscriptions or payment flows
- backend infrastructure

## Architecture expectations

Keep concerns separated:

- UI components should not contain persistence logic.
- Domain logic should not depend directly on framework-specific code.
- Local storage access should be isolated behind a small data layer.
- Sync code, when added, must be isolated from local-only functionality.
- The app must continue working when offline or signed out.
- In the Ionic + Angular app, prefer Angular standalone components, `loadComponent`, `bootstrapApplication`, and Ionic standalone APIs over new `NgModule` files.

When changing persisted data:

- avoid destructive schema changes
- preserve existing user data whenever possible
- add migrations when needed
- document any breaking change

## Code style

- Follow the existing project structure and conventions.
- Prefer explicit, descriptive names.
- Keep functions and components small and focused.
- Avoid unnecessary abstractions.
- Avoid duplicate business logic.
- Use types consistently where the stack supports them.
- Prefer composition over large monolithic components.
- Keep files reasonably small.

## UI expectations

- Design mobile-first.
- Keep the interface fast, simple, and low-friction.
- Use accessible semantic elements where possible.
- Support keyboard navigation where relevant.
- Ensure touch targets are comfortable on mobile.
- Handle empty states and offline states clearly.
- Do not add visual complexity unless it improves the main packing workflow.

## Security and privacy

- Never commit secrets, tokens, keys, credentials, or private configuration.
- Never expose server-side secrets in client code.
- Validate external input.
- Minimize stored and collected data.
- Keep local data local unless the user explicitly enables sync.
- Do not silently upload user data.
- Prefer privacy-preserving defaults.

## Before making changes

1. Inspect the existing code and follow its established patterns.
2. Check whether a similar component, utility, type, or test already exists.
3. Make the smallest change that fully solves the task.
4. Avoid unrelated refactors.
5. Update tests when behavior changes.
6. Run the relevant linting, formatting, type-checking, and test commands.

## When completing a task

Report:

- what changed
- any important implementation decisions
- tests or checks run
- anything intentionally left unchanged

Do not claim that a test, build, or command succeeded unless it was actually run successfully.
