<div align="center">
  <img src="docs/readme-assets/hero.png" alt="Packwise app logo" width="144" />

  <h1>Packwise</h1>

  <p>Offline-first packing lists for trips, activities, and gear routines.</p>

  <p>
    <a href="#about">About</a> |
    <a href="#features">Features</a> |
    <a href="#screenshots">Screenshots</a> |
    <a href="#getting-started">Getting Started</a> |
    <a href="#project-status">Project Status</a> |
    <a href="#faq">FAQ</a> |
    <a href="#author">Author</a> |
    <a href="#license">License</a>
  </p>

  <p>
    <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-2f6f73?style=for-the-badge" />
    <img alt="Built with Angular" src="https://img.shields.io/badge/Angular-22-dd0031?style=for-the-badge&logo=angular&logoColor=white" />
    <img alt="Angular Material 22" src="https://img.shields.io/badge/Angular_Material-22-dd0031?style=for-the-badge&logo=angular&logoColor=white" />
    <img alt="Capacitor 8" src="https://img.shields.io/badge/Capacitor-8-119eff?style=for-the-badge&logo=capacitor&logoColor=white" />
    <img alt="Tailwind CSS 4" src="https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
    <img alt="Package manager: pnpm" src="https://img.shields.io/badge/pnpm-10-f69220?style=for-the-badge&logo=pnpm&logoColor=white" />
    <img alt="Offline first" src="https://img.shields.io/badge/privacy-offline--first-18323a?style=for-the-badge" />
  </p>
</div>

## About

Packwise helps you create reusable gear lists and generate packing checklists from activities such as camping, hiking, beach, gym, or work.

Everything is stored on your device and works without an account or internet connection. Optional backup and sync features may be added later without changing the offline-first experience.

## Features

- Generate checklists from one or more activities.
- Create and organize reusable items.
- Mark essentials that belong on every list.
- Save trips with their own activities and packed-item progress.
- Search and manage items and activities in the Library.
- Import, export, or delete local data from Settings.
- Use the app offline on desktop, mobile web, or Android.

## Screenshots

### Pack

| Desktop                                                                                                                                                    | Mobile                                                                                                                                                           |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <img src="docs/readme-assets/screenshots/01-desktop-home-lake-weekend.png" alt="Packwise desktop pack screen for a saved lake weekend trip" width="560" /> | <img src="docs/readme-assets/screenshots/02-mobile-home-lake-weekend-checklist.png" alt="Packwise mobile checklist for a saved lake weekend trip" width="220" /> |

### Library

| Desktop                                                                                                                                                          | Mobile                                                                                                                          |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| <img src="docs/readme-assets/screenshots/03-desktop-library-overview.png" alt="Packwise desktop library with saved activities and reusable items" width="560" /> | <img src="docs/readme-assets/screenshots/04-mobile-library-search.png" alt="Packwise mobile library item search" width="220" /> |

### Settings

<p align="center">
  <img src="docs/readme-assets/screenshots/05-mobile-settings.png" alt="Packwise mobile settings with local import, export, sync placeholder, and delete actions" width="240" />
</p>

## Getting Started

### Requirements

- Node.js compatible with Angular 22
- pnpm 10.33.0 or newer

### Install and Run

```sh
pnpm install
pnpm start
```

The app will be available at `http://localhost:4200/`.

### Build and Check

```sh
pnpm build
pnpm lint
```

There is currently no root test script.

### Android

Java JDK 17 or newer is required for Android builds.

```sh
pnpm android:apk:debug
```

The debug APK is written to:

```text
apps/client/android/app/build/outputs/apk/debug/app-debug.apk
```

Signed APK and Android App Bundle releases can be built and published together automatically from version tags. See [the release guide](docs/releasing.md) for the one-time signing setup and release process.

If no Android SDK is installed, the setup command can install the required command-line tools locally:

```powershell
pnpm android:apk:debug:setup
```

## Project Status

The core offline MVP is implemented:

- Item and activity management
- Live activity-based packing lists
- Packed and unpacked checklist state
- Saved trips
- Local IndexedDB persistence
- JSON import and export
- Android packaging

Current priorities are improving first-run guidance, empty states, and Library filtering.

Future ideas include starter lists, reusable trip templates, weight totals, PDF export, and optional backup or sync. Accounts and cloud services will remain optional.

## FAQ

### Does Packwise require an account?

No. The core app works locally without an account, cloud sync, or internet access.

### Where is user data stored?

Activities, items, and trips are stored locally in browser IndexedDB.

### Can I back up my data?

Yes. Settings includes JSON export and import.

### Is there a backend?

No backend is required. A separate optional service may be added later for backup and sync.

## Author

<div align="center">
  <p><strong>Alex Mengoli</strong></p>
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
