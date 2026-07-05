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
- [Layout and flow](docs/layout-and-flow.md): navigation, Pack screen, and planned Library and Settings flows.
- [Client TODO](apps/client/TODO.md): short implementation backlog for the Angular client.

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
pnpm --filter @packwise/shared build
```

There is currently no root `test` script.
