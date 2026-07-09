# AGENTS.md

## Project context

This repository contains **Packwise**, an offline-first packing organizer.

Users create items, assign them to one or more activities (for example: camping, beach, MTB), and generate packing lists based on selected activities.
Users can also save trip-specific packing sessions so each trip can keep its selected activities and packed item state separate from the reusable item library.

The long-term product architecture is:

- a local-first client application that works without an account
- an optional separate backend for accounts, backups, and paid sync

Do not make cloud sync, authentication, or internet access required for the core app.

## Repository structure

This repo is a pnpm monorepo named `packwise`.

- `apps/client`: the complete plain Angular client application.
- `packages/shared`: framework-independent TypeScript models, types, and reusable domain utilities.
- `docs`: product status, layout, and flow notes.
- `package.json`: root workspace scripts that delegate to packages.
- `pnpm-workspace.yaml`: pnpm workspace package discovery.
- `AGENTS.md`: instructions for Codex and other coding agents.
- `README.md`: human-facing project overview and commands.
- `.gitignore`: repository-wide ignore rules.

Keep app-specific UI and Angular code inside `apps/client`. Keep reusable business types and pure domain logic inside `packages/shared`. Do not put persistence, browser APIs, Angular services, or UI concerns in `packages/shared`.

## Package manager

Use pnpm for all workspace dependency and script operations.

- Run commands from the repository root when possible.
- Use `pnpm install` to install dependencies.
- Use root scripts such as `pnpm build`, `pnpm lint`, and `pnpm test`.
- Use workspace filters for package-specific commands, for example `pnpm --filter @packwise/client build` or `pnpm --filter @packwise/shared build`.
- There is currently no root `test` script; do not report test results unless a test command actually exists and has been run.
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
- Keep lint tooling usable through `pnpm lint`; if lint dependencies or config change, verify the root command.

## Product scope

The current MVP includes:

- activities / tags
- items
- assigning items to activities
- generating packing lists from selected activities
- marking items as packed
- saved trips with trip-specific selected activities and packed item state
- local persistence
- import/export where appropriate
- local data deletion where appropriate

## Architecture expectations

Keep concerns separated:

- UI components should not contain persistence logic.
- Domain logic should not depend directly on framework-specific code.
- Local storage access should be isolated behind a small data layer.
- Sync code, when added, must be isolated from local-only functionality.
- The app must continue working when offline or signed out.
- In the Angular app, prefer standalone components, `loadComponent`, and `bootstrapApplication` over new `NgModule` files.

## Client application guidelines

Write functional, maintainable, performant, and accessible client code following Angular and TypeScript best practices.

### TypeScript

- Use strict type checking.
- Prefer type inference when the type is obvious.
- Avoid the `any` type; use `unknown` when the type is uncertain.

### Angular

- Always use standalone components over NgModules.
- Do not set `standalone: true` inside Angular decorators; it is the default in Angular 20 and newer.
- Do not set `changeDetection: ChangeDetectionStrategy.OnPush` explicitly; `OnPush` is the default in Angular 22 and newer.
- Use signals for state management.
- Implement lazy loading for feature routes.
- Do not use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead.
- Use `NgOptimizedImage` for all static images. It does not work for inline base64 images.

### Angular Material

- Prefer Angular Material components and interaction patterns for client UI unless a task explicitly requires a custom control.
- The client currently uses `@angular/material` `^22.0.3`; check the current Angular Material documentation at https://material.angular.dev/ when choosing component APIs or examples.
- Use the Coastal Gear Material theme defined in `src/material-theme.scss`: primary `#005f73`, secondary role `#0a9396`, tertiary/accent `#ee9b00`.
- Keep the Material theme aligned with the device color preference. Use Material 3 `theme-type: color-scheme` with CSS `color-scheme` and `@media (prefers-color-scheme: dark)` rather than requiring a manual in-app theme unless a task explicitly asks for one.
- Use current Angular Material components such as buttons, icon buttons, icons, cards, lists, dialogs, bottom sheets, menus, form fields, chips, checkboxes, tabs, snack bars, and toolbars where they fit the product flow.
- Build the main app shell around a mobile-first bottom navigation pattern. If Angular Material does not provide an exact bottom navigation primitive, compose it from current Material buttons and icons with Angular Router state and accessible labels.
- Keep Material usage mobile-first, accessible, and visually restrained.
- Do not recreate Material primitives with custom CSS when an Angular Material component already fits the need.
- Use snack bars for short import, export, delete, save, and error feedback when the message is transient.
- Keep dialog content scrollable on small screens and let dialog actions wrap into comfortable tap targets.

### Accessibility

- Client UI must pass all AXE checks.
- Follow WCAG AA minimums, including focus management, color contrast, and ARIA attributes.
- Custom interactive elements must keep visible `:focus-visible` styles and keyboard activation where relevant.

### Components

- Keep components small and focused on a single responsibility.
- Use `input()` and `output()` functions instead of decorators.
- Use `computed()` for derived state.
- Prefer inline templates for small components.
- Prefer Signal Forms (`@angular/forms/signals`) for new forms. They are stable in Angular 22 and newer and provide signal-based state, type-safe field access, and schema-based validation.
- When not using Signal Forms, prefer reactive forms over template-driven forms.
- Do not use `ngClass`; use `class` bindings instead.
- Do not use `ngStyle`; use `style` bindings instead.
- When using external templates or styles, use paths relative to the component TypeScript file.

### State management

- Use signals for local component state.
- Use `computed()` for derived state.
- Keep state transformations pure and predictable.
- Do not use `mutate` on signals; use `update` or `set` instead.

### Templates

- Keep templates simple and avoid complex logic.
- Use native control flow (`@if`, `@for`, and `@switch`) instead of `*ngIf`, `*ngFor`, and `*ngSwitch`.
- Use the async pipe to handle observables.
- Do not assume globals such as `new Date()` are available.
- Empty states should be actionable when the next step is clear, using existing Material buttons and icons.

### Services

- Design services around a single responsibility.
- Use the `providedIn: 'root'` option for singleton services.
- Prefer the `@Service` decorator over `@Injectable({ providedIn: 'root' })` for new singleton services in Angular 22 and newer.
- Use the `inject()` function instead of constructor injection.
- Keep browser storage and file import/export logic in services instead of page components where practical.

### Client linting

- The client uses Angular ESLint with flat config in `eslint.config.mjs`.
- Keep `pnpm lint` working from the repository root.
- Add explicit dev dependencies for packages imported by the lint config; do not rely on transitive dependencies under pnpm.

When changing persisted data:

- avoid destructive schema changes
- preserve existing user data whenever possible
- add migrations when needed
- document any breaking change

## Code style

- Follow the existing project structure and conventions.
- In `apps/client`, create pages inside `pages` folders.
- In `apps/client`, place reusable UI components inside `components` folders.
- If a component is specific to a single page, keep it alongside that page inside the page component folder, especially when this helps keep the main page template smaller and easier to maintain.
- Place Angular services in `services` folders and name them with the `.service.ts` suffix.
- Place shared type-only files in `types` folders and name them with the `.types.ts` suffix.
- Use clear role suffixes for other file kinds when applicable, such as `.component.ts`, `.directive.ts`, `.pipe.ts`, `.guard.ts`, `.resolver.ts`, `.adapter.service.ts`, and `.repository.service.ts`.
- Prefer explicit, descriptive names.
- Always declare types explicitly.
- Do not add explicit type annotations to Angular helper results such as `inject()`, `input()`, `output()`, `viewChild()`, `signal()`, or `computed()`; let Angular infer those types.
- Always declare method visibility and return types.
- Use `private readonly` for private dependencies and fields that should not be reassigned.
- Do not define types or interfaces inside classes; create dedicated type files when new types are needed.
- Add a short one- or two-word section comment above grouped class-level constants or fields, for example `// constants`, `// injections`, or `// data`.
- Keep functions and components small and focused.
- Avoid unnecessary abstractions.
- Avoid duplicate business logic.
- Use types consistently where the stack supports them.
- Prefer composition over large monolithic components.
- Keep files reasonably small.
- Do not add comments unless they are necessary; follow clean code principles and let names and structure carry intent.
- Do not create or add tests.

## Language

- Use English for product UI copy, documentation, code comments, labels, sample data, and user-facing text unless a task explicitly requests another language.

## UI expectations

- Design mobile-first.
- Ensure every UI remains comfortable and functional on desktop-wide screens, with responsive layouts that make good use of available space.
- Keep the interface fast, simple, and low-friction.
- Use accessible semantic elements where possible.
- Support keyboard navigation where relevant.
- Ensure touch targets are comfortable on mobile.
- Handle empty states and offline states clearly.
- Use snackbars for short success or error feedback instead of inline status blocks when the message is transient.
- Style every critical or destructive confirmation action in red.
- Make empty states useful: explain the state briefly and include a contextual action when the next step is obvious.
- Keep dialogs comfortable on small screens, with scrollable content and actions that remain easy to tap.
- Preserve visible focus states for custom interactive elements such as tiles, chips, labels, and checklist rows.
- Avoid viewport-width font scaling for app screens; use stable type sizes with breakpoints when larger screens need more presence.
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
5. Run the relevant linting, formatting, type-checking, and build commands.
6. Treat Angular build budget warnings as follow-up work unless the task explicitly includes bundle or CSS optimization.

## When completing a task

Report:

- what changed
- any important implementation decisions
- tests or checks run
- anything intentionally left unchanged

Do not claim that a test, build, or command succeeded unless it was actually run successfully.
