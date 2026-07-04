# Layout and Flow

This document collects the product layout decisions for PackWise. It starts with the Pack experience and will be extended with the other windows, navigation rules, and end-to-end user flows.

## Screens

Planned MVP screens:

- Pack
- Library
- Settings

## Navigation Model

Navigation should feel modern, quiet, and mobile-first. The app should use a bottom navigation shell for the main destinations instead of filling the home screen with buttons or hiding core areas inside an overflow menu.

Recommended approach:

- Use Pack as the default route and main workspace.
- Use a bottom navigation bar with three destinations: Pack, Library, Settings.
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

## Purpose

The first screen should let users immediately understand what to pack for the activity they are about to do. The user should not need to press a separate "Generate list" button. Selecting activities should update the packing list instantly.

This keeps PackWise focused on its core promise: open the app, choose the context, and see what to bring.

## Layout

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

## Activity Row

- Activities should be displayed as compact selectable cards.
- The row should scroll horizontally on small screens.
- Multiple activities can be selected at the same time.
- The final card in the row should be a `+` action for adding a new activity.
- Activity cards may show a small item count, for example "Camping 12", if it helps the user understand the size of each packing context.
- Selected cards should be visually clear and accessible.

## Packing List

- The packing list appears below the activity row and scrolls naturally with the page.
- The list updates immediately when activities are selected or deselected.
- Items associated with multiple selected activities should appear only once.
- Each item should support a packed/unpacked checkbox.
- If no activity is selected, show a simple empty state instead of a hidden or confusing area.

Suggested empty state:

```text
Select one or more activities to see what to bring.
```

## Desktop Behavior

The same model should work on desktop and tablet. The activity row can remain horizontal, with more cards visible at once. The packing list can stay below the row for simplicity, unless later usage shows that a side-by-side layout would improve scanning.

## Design Principles

- Keep the screen fast, simple, and low-friction.
- Avoid wizard-style steps for the main packing flow.
- Avoid making the user explicitly generate a list.
- Treat the activity selection as a live filter for the packing checklist.
- Keep all core behavior local-first and fully usable offline.

## Items Window

The Items window is the full CRUD area for packing items and lives inside Library.

- Access it from the Library destination in the bottom navigation.
- Show a searchable list of items.
- Use a floating action button or toolbar action for adding a new item.
- Open create/edit in a `MatDialog` on larger screens and a `MatBottomSheet` on mobile if that feels better for thumb reach.
- Let users assign items to activities using Material chips or selection controls.
- Keep delete inside the edit surface with a confirmation step.

## Activities Window

The Activities window is the full CRUD area for activities and lives inside Library.

- Access it from the Library destination in the bottom navigation.
- Also allow quick creation from the final `+` card in the home activity row.
- Show activities as manageable cards or list rows.
- Use create/edit surfaces for name, optional icon, optional color, and notes.
- Keep destructive delete behind confirmation, especially if items are already linked to the activity.

## Settings Window

The Settings window is for local data operations and low-frequency preferences.

- Access it from the Settings destination in the bottom navigation.
- Keep import/export here rather than on the home screen.
- Keep any future optional sync or account entry points isolated here so the core app remains usable offline.

## Future Sections

The following sections should be added as the product layout becomes clearer:

- Empty states
- Editing flows
- Import/export flow
