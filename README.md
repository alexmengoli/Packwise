<div align="center">
  <img src="docs/readme-assets/hero.png" alt="Packwise app logo" width="144" />

  <h1>Packwise</h1>

  <p>
    Offline-first packing lists for trips, activities, and gear routines.
  </p>

  <p>
    <a href="#features">Features</a> |
    <a href="#screenshots">Screenshots</a> |
    <a href="#getting-started">Getting Started</a> |
    <a href="docs/project-status.md">Project Status</a>
  </p>

  <p>
    <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-2f6f73?style=for-the-badge" />
    <img alt="Built with Angular" src="https://img.shields.io/badge/Angular-22-dd0031?style=for-the-badge&logo=angular&logoColor=white" />
    <img alt="Package manager: pnpm" src="https://img.shields.io/badge/pnpm-10-f69220?style=for-the-badge&logo=pnpm&logoColor=white" />
    <img alt="Offline first" src="https://img.shields.io/badge/offline--first-local_data-18323a?style=for-the-badge" />
  </p>
</div>

## About

Packwise helps you build reusable item libraries and generate packing checklists from the activities you choose. Create items once, assign them to activities such as camping, beach, hiking, gym, or work, then open the Pack screen and immediately see what to bring.

The app is intentionally local-first: the core experience works without an account, cloud sync, or network access. Future sync or backup features should stay optional and additive.

## Table Of Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Workspace](#workspace)
- [Getting Started](#getting-started)
- [Available Commands](#available-commands)
- [Documentation](#documentation)
- [Author](#author)
- [Roadmap](#roadmap)
- [FAQ](#faq)
- [License](#license)

## Features

- Activity-based packing: select one or more activities and get a generated checklist.
- Reusable item library: create, edit, search, and categorize items.
- Multi-activity assignments: connect one item to multiple activity contexts.
- Mandatory essentials: mark items that should appear in every checklist.
- Saved trips: keep selected activities and packed item state separate for each trip.
- Local persistence: store activities, items, and trips on-device with IndexedDB.
- Data portability: export, import, and delete local data from Settings.
- Mobile-first shell: Pack, Library, and Settings are one tap away.

## Screenshots

### Pack Screen

The Pack screen combines saved trips, selected activities, generated checklist items, and packed progress in one view.

| Desktop                                                                                                                                                    | Mobile                                                                                                                                                           |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <img src="docs/readme-assets/screenshots/01-desktop-home-lake-weekend.png" alt="Packwise desktop pack screen for a saved lake weekend trip" width="560" /> | <img src="docs/readme-assets/screenshots/02-mobile-home-lake-weekend-checklist.png" alt="Packwise mobile checklist for a saved lake weekend trip" width="220" /> |

### Library

The Library keeps activities and reusable items separate from trip-specific packing state.

| Desktop                                                                                                                                                          | Mobile                                                                                                                          |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| <img src="docs/readme-assets/screenshots/03-desktop-library-overview.png" alt="Packwise desktop library with saved activities and reusable items" width="560" /> | <img src="docs/readme-assets/screenshots/04-mobile-library-search.png" alt="Packwise mobile library item search" width="220" /> |

### Settings

Settings keeps local data portable with JSON import and export while making future sync clearly optional.

<p align="center">
  <img src="docs/readme-assets/screenshots/05-mobile-settings.png" alt="Packwise mobile settings with local import, export, sync placeholder, and delete actions" width="240" />
</p>

## Tech Stack

| Area          | Tools                                                 |
| ------------- | ----------------------------------------------------- |
| Client        | Angular 22, Angular Material, RxJS, TypeScript        |
| Shared domain | Framework-independent TypeScript models and utilities |
| Persistence   | Browser IndexedDB through an isolated storage adapter |
| Workspace     | pnpm monorepo                                         |
| Tooling       | Angular CLI, ESLint, Prettier                         |

## Workspace

```text
packwise/
|- apps/
|  `- client/          Plain Angular client application
|- packages/
|  `- shared/          Shared TypeScript models and domain utilities
|- docs/               Product notes, status, and flow decisions
|- AGENTS.md           Repository conventions for coding agents
`- README.md
```

## Getting Started

### Prerequisites

- Node.js compatible with Angular 22
- pnpm 10.33.0 or newer
- Java JDK 17 or newer for native Android builds
- Android SDK command-line tools, or let the Android debug build script install them locally

### Installation

```sh
pnpm install
```

### Run Locally

```sh
pnpm start
```

The root start script delegates to the Angular client. By default, Angular serves the app on `http://localhost:4200/`.

### Android App

Packwise uses Capacitor to package the offline-first Angular client as a native Android app.

```sh
pnpm android:apk:debug
```

Run `pnpm android:apk:debug` to build the web app, sync it into Android, and produce a debug APK from the command line.

The debug APK is written to:

```text
apps/client/android/app/build/outputs/apk/debug/app-debug.apk
```

Android Studio is optional. If you do not have an Android SDK installed, run the script once with explicit SDK license acceptance:

```powershell
pnpm android:apk:debug:setup
```

That installs missing workspace dependencies from `pnpm-lock.yaml`, installs Android command-line tools into `.android-sdk/`, uses local ignored cache folders for tool downloads, syncs Capacitor, and runs the Gradle debug build.

If you already have an SDK, set `ANDROID_HOME` or `ANDROID_SDK_ROOT` to an SDK that includes platform 36, platform-tools, and Android build-tools, then run `pnpm android:apk:debug`.

## Available Commands

| Command                                | Description                                 |
| -------------------------------------- | ------------------------------------------- |
| `pnpm start`                           | Start the Angular client dev server         |
| `pnpm build`                           | Build shared package first, then the client |
| `pnpm lint`                            | Run the client ESLint configuration         |
| `pnpm build:shared`                    | Build only `@packwise/shared`               |
| `pnpm android:apk:debug`               | Build a debug APK from the command line     |
| `pnpm android:apk:debug:setup`         | Install local Android CLI tools and build a debug APK |
| `pnpm --filter @packwise/client build` | Build only the client app                   |
| `pnpm --filter @packwise/shared build` | Build only the shared package               |

There is currently no root `test` script.

## Documentation

- [Project status](docs/project-status.md): current implementation, data model, MVP scope, flow notes, gaps, and future ideas.
- [Root agent instructions](AGENTS.md): repository-wide conventions and product constraints.
- [Client agent instructions](apps/client/AGENTS.md): Angular, Material, accessibility, and client-specific rules.

## Roadmap

- Continue refining first-run and empty states.
- Consider predefined starter lists.
- Self-hosted backend.
- Cloud sync.

## FAQ

### Does Packwise require an account?

No. The core app is designed to work locally without accounts, cloud sync, or internet access.

### Where is user data stored?

Current client data is stored in browser IndexedDB as a local snapshot containing activities, items, and trips.

### Can I back up my data?

Yes. Settings includes JSON export and import flows for local data portability.

### Is there a backend?

Not for the core app. A separate optional backend may be added later for accounts, backups, or sync, but local packing workflows must remain independent.

## Author

<div align="center">
  <p>
    <strong>Alex Mengoli</strong>
  </p>
  <p>
    <a href="https://www.linkedin.com/in/alex-mengoli">
      <img alt="LinkedIn: Alex Mengoli" src="https://img.shields.io/badge/LinkedIn-Alex_Mengoli-0a66c2?style=for-the-badge&logo=linkedin&logoColor=white" />
    </a>
    <a href="https://mxapps.dev">
      <img alt="Website: mxapps.dev" src="https://img.shields.io/badge/Website-mxapps.dev-2f6f73?style=for-the-badge&logo=googlechrome&logoColor=white" />
    </a>
  </p>
</div>

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.
