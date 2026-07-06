# Layout and Flow

This document collects the product layout decisions for PackWise. It starts with the Pack experience and will be extended with the other windows, navigation rules, and end-to-end user flows.

## Screens

Planned MVP screens:

- Pack
- Library
- Settings

Current implementation:

- Pack is implemented at the root route.
- Library is implemented at `/library`.
- Settings is implemented at `/settings`.
- The bottom navigation shell exposes Pack, Library, and Settings.

## Navigation Model

Navigation should feel modern, quiet, and mobile-first. The app should use a bottom navigation shell for the main destinations instead of filling the home screen with buttons or hiding core areas inside an overflow menu.

Recommended approach:

- Use Pack as the default route and main workspace.
- Use a bottom navigation bar with Pack, Library, and eventually Settings.
- Keep the top area light and content-focused. It can show the PackWise name or the current section title, but it should not carry the main navigation.
- Put Items and Activities inside Library, because both belong to catalog management.
- Use contextual entry points only when they help the current task, such as the final `+` activity card or an empty-list action.
- Avoid duplicating the same destination in several places.

Angular Material components that fit this model:

- Current Angular Material components from `@angular/material` `^22.0.3`, using https://material.angular.dev/ as the reference.
- Material buttons, icon buttons, and icons for the bottom navigation shell if there is no exact Material bottom navigation primitive.
- Router-aware active states for the selected bottom navigation destination.
- `MatTabs` or a compact segmented control inside Library to switch between Items and Activities.
- `MatBottomSheet` or `MatDialog` for quick create/edit flows.
- `MatSnackBar` for lightweight confirmations.

On mobile, the preferred shell is:

```text
PackWise

What are you preparing?

[Camping] [Beach] [MTB] [Gym] [+]

To bring
☐ Tent
☐ Water bottle
☐ Repair kit
☐ Sunscreen

[Pack]        [Library]        [Settings]
```

On desktop and tablet, the same three-destination model should remain recognizable. The bottom navigation can become a wider bottom bar or a compact rail only if the layout benefits from it, but the information architecture should stay the same.

Primary rule: the Pack screen should expose the packing workflow directly, while catalog management stays one tap away in Library.

## Pack

### Purpose

The first screen should let users immediately understand what to pack for the activity they are about to do. The user should not need to press a separate "Generate list" button. Selecting activities should update the packing list instantly.

This keeps PackWise focused on its core promise: open the app, choose the context, and see what to bring.

### Current Status

The current Pack screen is implemented as the home page. It shows:

- A heading and short explanation.
- A two-row horizontally scrollable activity grid.
- Multi-select activity tiles with icon, color, and item count.
- A final "New activity" tile that opens the activity dialog.
- A live "To bring" checklist.
- Keyboard-toggleable packing rows.
- Item creation from the checklist heading.
- A clear checked-items action.
- Loading and empty states.

When there is no saved local data, the page starts from an empty local snapshot and shows empty
states until the user creates activities and items.

### Layout

The screen is a single mobile-first workspace:

1. A short heading at the top, such as "What are you preparing?"
2. A horizontally scrollable activity row.
3. A vertical packing list below the activity row.

Example structure:

```text
What are you preparing?

[Camping] [Beach] [MTB] [Gym] [+]

To bring
☐ Tent
☐ Water bottle
☐ Repair kit
☐ Sunscreen
```

### Activity Row

- Activities should be displayed as compact selectable cards.
- The row should scroll horizontally on small screens.
- Multiple activities can be selected at the same time.
- The final card in the row should be a `+` action for adding a new activity.
- Activity cards may show a small item count, for example "Camping 12", if it helps the user understand the size of each packing context.
- Selected cards should be visually clear and accessible.
- Activity colors should follow the Coastal Gear HSL line: keep saturation and lightness fixed at `88%` and `31%`, and let users choose only the hue. Store activity colors as `hsl(H 88% 31%)` so custom colors stay visually related to the primary `#005f73`, secondary `#0a9396`, and tertiary `#ee9b00` palette.
- The current implementation uses a two-row horizontal activity grid rather than a single chip row.
- The final create activity tile is implemented.

### Packing List

- The packing list appears below the activity row and scrolls naturally with the page.
- The list updates immediately when activities are selected or deselected.
- Items associated with multiple selected activities should appear only once.
- Each item should support a packed/unpacked checkbox.
- If no activity is selected, show a simple empty state instead of a hidden or confusing area.

Suggested empty state:

```text
Select one or more activities to see what to bring.
```

### Desktop Behavior

The same model should work on desktop and tablet. The activity row can remain horizontal, with more cards visible at once. The packing list can stay below the row for simplicity, unless later usage shows that a side-by-side layout would improve scanning.

### Design Principles

- Keep the screen fast, simple, and low-friction.
- Avoid wizard-style steps for the main packing flow.
- Avoid making the user explicitly generate a list.
- Treat the activity selection as a live filter for the packing checklist.
- Keep all core behavior local-first and fully usable offline.
- Empty states should help the user continue. If there are no activities, offer activity creation; if selected activities have no matching items, offer item creation.
- Custom checklist rows, activity tiles, and compact labels must have clear keyboard focus and activation behavior.
- Use stable type sizes with responsive breakpoints instead of scaling text directly with viewport width.

## Items Window

The Items window is the full CRUD area for packing items and lives inside Library.

Current status:

- Accessed from the Library destination in the bottom navigation.
- Shows a local list of saved items with category labels and activity labels.
- Supports item search by name, description, category, weight, size, and notes.
- Supports create/edit through a `MatDialog`.
- Supports assigning items to activities through a multi-select.
- Supports a mandatory "Use for every activity" flag.
- Supports delete from each item row with a confirmation dialog.

Still planned:

- Advanced filtering beyond item search.
- A more compact Library switching model if the page becomes crowded.

## Activities Window

The Activities window is the full CRUD area for activities and lives inside Library.

Current status:

- Accessed from the Library destination in the bottom navigation.
- Also supports quick creation from the final activity tile on Pack.
- Shows activities as manageable rows with icon, color, description, and item count.
- Supports create/edit through a `MatDialog` with name, description, icon, and color controls.
- Supports delete with confirmation.
- Deleting an activity keeps items in the library and removes that activity assignment from affected items.

Still planned:

- Additional management affordances if activity lists become long.

## Settings Window

The Settings window is for local data operations and low-frequency preferences.

- Access it from the Settings destination in the bottom navigation.
- Keep import/export here rather than on the home screen.
- Keep any future optional sync or account entry points isolated here so the core app remains usable offline.

Current status:

- Implemented at `/settings`.
- Supports exporting the local snapshot as a PackWise JSON file.
- Supports importing a PackWise JSON file after confirmation, replacing the current local snapshot.
- Supports deleting all local activities and items after a destructive confirmation.
- Shows optional Cloud Sync as a disabled future entry point; sync is not part of the local-first core.

## Dialogs and Mobile Comfort

- Create and edit flows may use `MatDialog` when the form is short and focused.
- Dialog content should have a viewport-aware maximum height so small screens can scroll the form without losing access to actions.
- Dialog actions should wrap on narrow screens and keep comfortable touch targets.
- Destructive confirmation actions must remain visually red.
- Transient success and error feedback should use snackbars.

## Future Sections

The following sections should be added as the product layout becomes clearer:

- Empty states
- Editing flows
- Import/export edge cases
