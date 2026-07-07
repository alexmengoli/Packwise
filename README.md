# PackWise

PackWise is an offline-first packing organizer for building activity-based packing checklists.
Users can keep a local library of items, associate items with activities such as camping or beach
trips, and select activities to see what to bring.

The core app is intentionally local-first. It must remain usable without an account, cloud sync, or
network access.

## Workspace

- `apps/client`: plain Angular client application.
- `packages/shared`: shared TypeScript models and framework-independent domain utilities.
- `docs`: product notes, current status, and flow decisions.

## Documentation

The README stays intentionally short. Detailed product notes live in `docs`.

- [Project status](docs/project-status.md): current implementation, data model, MVP scope, flow notes, gaps, and future ideas.

Agent-facing guidance is separate:

- [Root agent instructions](AGENTS.md): repository-wide conventions and product constraints.
- [Client agent instructions](apps/client/AGENTS.md): Angular, Material, accessibility, and client-specific rules.

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
