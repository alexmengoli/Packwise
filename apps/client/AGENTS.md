
You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Do NOT set `changeDetection: ChangeDetectionStrategy.OnPush` explicitly. `OnPush` is the default in Angular v22+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Angular Material

- Prefer Angular Material components and interaction patterns for client UI unless a task explicitly requires a custom control.
- The client currently uses `@angular/material` `^22.0.3`; check the current Angular Material documentation at https://material.angular.dev/ when choosing component APIs or examples.
- Use the Coastal Gear Material theme defined in `src/material-theme.scss`: primary `#005f73`, secondary role `#0a9396`, tertiary/accent `#ee9b00`.
- Keep the Material theme aligned with the device color preference. Use Material 3 `theme-type: color-scheme` with CSS `color-scheme` and `@media (prefers-color-scheme: dark)` rather than a manual in-app theme requirement unless a task explicitly asks for one.
- Use current Angular Material components such as buttons, icon buttons, icons, cards, lists, dialogs, bottom sheets, menus, form fields, chips, checkboxes, tabs, snack bars, and toolbars where they fit the product flow.
- Build the main app shell around a mobile-first bottom navigation pattern. If Angular Material does not provide an exact bottom navigation primitive, compose it from current Material buttons/icons with Angular Router state and accessible labels.
- Keep Material usage mobile-first, accessible, and visually restrained.
- Do not recreate Material primitives with custom CSS when an Angular Material component already fits the need.
- Use snack bars for short import, export, delete, save, and error feedback when the message is transient.
- Keep dialog content scrollable on small screens and let dialog actions wrap into comfortable tap targets.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.
- Custom interactive elements must keep visible `:focus-visible` styles and keyboard activation where relevant.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Prefer inline templates for small components
- Prefer Signal Forms (`@angular/forms/signals`) for new forms. They are stable in Angular v22+ and provide signal-based state, type-safe field access, and schema-based validation
- When not using Signal Forms, prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.
- Empty states should be actionable when the next step is clear, using existing Material buttons and icons.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})` for new singleton services (Angular v22+)
- Use the `inject()` function instead of constructor injection
- Keep browser storage and file import/export logic in services instead of page components where practical

## Linting

- The client uses Angular ESLint with flat config in `eslint.config.mjs`.
- Keep `pnpm lint` working from the repository root.
- Add explicit dev dependencies for packages imported by the lint config; do not rely on transitive dependencies under pnpm.
