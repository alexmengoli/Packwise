# PackWise

PackWise is an offline-first packing organizer for building activity-based packing checklists.
Users can keep a local library of items, associate items with activities such as camping or beach
trips, and select activities to see what to bring.

The core app is intentionally local-first. It must remain usable without an account, cloud sync, or
network access.

## Workspace

- `apps/client`: plain Angular client application.
- `packages/shared`: shared TypeScript models and framework-independent domain utilities.
- `docs`: product notes, current status, and layout decisions.

## Documentation

- [Project status](docs/project-status.md): product overview, current scope, MVP notes, and future ideas.
- [Layout and flow](docs/layout-and-flow.md): navigation, Pack screen, Library, and Settings flow.

## Current Status

- Pack is available at `/` and lets users select one or more activities to generate a live checklist.
- Library is available at `/library` and supports local create, edit, and delete flows for activities and items.
- Settings is available at `/settings` for local data export, import, and delete-all operations.
- Local data is stored on-device in IndexedDB as a single snapshot.
- Import/export uses a PackWise JSON envelope around the local snapshot.
- Packed/unpacked checklist state is currently session-only.
- Optional cloud sync is represented only as a disabled future entry point; it is not required for core use.

## Commands

```sh
pnpm install
pnpm start
pnpm build
pnpm lint
```

Useful package-specific commands:

```sh
pnpm --filter @packwise/client start
pnpm --filter @packwise/client build
pnpm --filter @packwise/client lint
pnpm --filter @packwise/shared build
```

There is currently no root `test` script. The root `build` script builds `@packwise/shared` first, then `@packwise/client`.
The root `lint` script runs the Angular ESLint configuration for the client.
