# PackWise Project Status

PackWise is an offline-first packing organizer for people who want to prepare bags, backpacks, or gear kits based on the activity they are about to do.

Users can define their own items, group them by one or more activities, and generate a packing checklist by selecting the relevant activities. The core app should remain usable without an account, network access, or cloud sync.

## Product Goal

Help users prepare quickly for a specific activity while reducing the chance of forgetting important items.

Example activities include:

- Beach
- Mountain biking
- Camping
- Hiking
- Gym
- Travel
- Work
- Picnic

## Core Concepts

### Items

An item represents a physical thing the user may want to bring.

Example:

```json
{
  "id": "item-1",
  "name": "Sunscreen",
  "description": "SPF 50 protection",
  "categoryId": "toiletries",
  "mandatory": false,
  "activityIds": ["activity-beach"],
  "notes": "Check the expiration date"
}
```

Items can be tied to zero or more activities. Items marked as `mandatory` are shown for every
selected activity.

### Activities

An activity represents a context the user is packing for, such as Beach, Camping, MTB, Hiking, or
Gym. Activities can include an optional display color and icon identifier.

### Local Snapshot

The current client stores local data in IndexedDB as a single snapshot object:

```json
{
  "id": "local",
  "version": 1,
  "activities": [],
  "items": []
}
```

The storage adapter can migrate older separate `activities` and `items` object stores into the
snapshot format when found.

Exports wrap that snapshot in a small PackWise JSON envelope:

```json
{
  "app": "packwise",
  "version": 1,
  "exportedAt": "2026-07-06T00:00:00.000Z",
  "data": {
    "id": "local",
    "version": 1,
    "activities": [],
    "items": []
  }
}
```

Imports accept either this envelope or a valid raw snapshot, then replace the current local
snapshot after user confirmation.

## Initial Data Model

### Items

Represents a physical item that can be included in one or more packing lists.

| Field         | Type          | Required | Description                                             |
| ------------- | ------------- | -------- | ------------------------------------------------------- |
| `id`          | UUID / string | Yes      | Unique item identifier.                                 |
| `name`        | string        | Yes      | Item name.                                              |
| `description` | string        | No       | Free-form item description.                             |
| `categoryId`  | string        | No       | Optional item category, such as Clothes or Toiletries.  |
| `mandatory`   | boolean       | Yes      | Whether the item appears for every selected activity.   |
| `activityIds` | string[]      | Yes      | Activities this item belongs to.                        |
| `weight`      | string        | No       | Item weight or weight note.                             |
| `size`        | string        | No       | Item size or dimensions, for example `30 x 20 x 10 cm`. |
| `notes`       | string        | No       | Additional notes about the item.                        |
| `created_at`  | datetime      | Yes      | Creation timestamp.                                     |
| `updated_at`  | datetime      | Yes      | Last update timestamp.                                  |

### Activities

Represents an activity, trip type, or use case that may require specific items.

Examples: Beach, Camping, MTB, Hiking, Skiing.

| Field         | Type          | Required | Description                                      |
| ------------- | ------------- | -------- | ------------------------------------------------ |
| `id`          | UUID / string | Yes      | Unique activity identifier.                      |
| `name`        | string        | Yes      | Activity name.                                   |
| `description` | string        | No       | Optional explanation of the activity.            |
| `color`       | string        | No       | Display color, preferably stored as a HEX value. |
| `icon`        | string        | No       | Icon identifier, not the icon file itself.       |
| `created_at`  | datetime      | Yes      | Creation timestamp.                              |
| `updated_at`  | datetime      | Yes      | Last update timestamp.                           |

### Item Activity Assignments

The current local model stores activity assignments directly on each item as `activityIds`.

One item can belong to multiple activities, and one activity can contain multiple items.

If a separate backend is added later, it may use a join table internally, but that must remain an
implementation detail and cannot make the local-first client depend on a server.

### Packing Lists

A packing list is generated from the user's items and selected activities. An item is included when it is associated with at least one selected activity.

Example:

- Item: Sunscreen
- Activities: Beach, Hiking, Camping
- Selected activity: Beach
- Result: Sunscreen is included in the generated list

Mandatory items are also included, even when they are not assigned to the selected activity.

## Current Implementation

The repository currently includes:

- A pnpm workspace with `apps/client` and `packages/shared`.
- A standalone Angular client using Angular Material and standalone route components.
- A Pack screen at the root route.
- A Library screen at `/library`.
- A Settings screen at `/settings`.
- A bottom navigation shell with Pack, Library, and Settings wired.
- Item categories shown as groups in the packing checklist.
- Activity and item creation from the Pack screen.
- Activity creation, editing, and deletion from Library.
- Item creation, editing, and deletion from Library.
- Item search in Library.
- Activity dialogs with name, description, icon, and hue-based color selection.
- Item dialogs with name, description, category, mandatory flag, activity assignments, notes, size, and weight.
- Settings data operations for exporting JSON, importing JSON, and deleting all local data.
- A disabled future Cloud Sync entry point in Settings.
- Local IndexedDB persistence through `IndexedDbPackwiseStorageAdapterService`.
- Data portability through `DataPortabilityService`.
- Angular ESLint configured for the client and available through the root `pnpm lint` command.
- Item and activity repository services with create, update, delete, refresh, loading, and error state.
- Activity deletion removes that activity reference from existing items.
- Shared framework-independent `Activity`, `Item`, and item category TypeScript definitions.

Not implemented yet:

- Persisted packed/unpacked checklist state.
- Advanced filtering inside Library beyond item search.
- Tests.

## Core User Flow

1. The user opens the app.
2. The app shows locally saved items and activities.
3. The user creates or edits items.
4. The user assigns each item to one or more activities.
5. The user selects one or more activities.
6. The app generates the list of items to bring.
7. The user uses the generated list as a checklist.

## MVP Scope

The first useful version should focus on:

- Creating, editing, deleting, and viewing items
- Creating, editing, deleting, and viewing activities
- Assigning items to one or more activities
- Filtering items by selected activities
- Generating a packing checklist
- Marking generated list entries as packed
- Persisting user data locally

Implemented MVP pieces:

- Item CRUD through Library and quick item creation from Pack.
- Activity CRUD through Library and quick activity creation from Pack.
- Activity assignment for items.
- Live checklist generation from selected activities.
- Local IndexedDB persistence for activities and items.
- Settings import/export for local JSON backups.

Remaining MVP pieces:

- Persist packed/unpacked state if that behavior should survive reloads.
- Continue refining first-run and empty states as workflows grow.

Quality notes:

- Keep `pnpm lint` and `pnpm build` green before considering UI work complete.
- The Angular production build may warn when component CSS exceeds the current `anyComponentStyle` budget. Treat those warnings as CSS organization or budget follow-up work, not as successful optimization.
- Prioritize mobile spacing, visible focus states, scrollable dialogs, and contextual empty-state actions during UI polish.

## Future Ideas

These ideas are intentionally outside the first MVP unless explicitly prioritized:

- Saved custom packing lists
- Predefined starter lists
- Import/export
- PDF export
- Weight totals
- Optional account support
- Optional backup and sync

The following should not become requirements for the core app:

- Mandatory accounts
- Mandatory cloud sync
- Collaboration or social features
- Public profiles
- AI recommendations
- Travel itinerary planning
- Shopping or inventory management
- Subscriptions or payment flows
- Backend infrastructure for local-only packing features
