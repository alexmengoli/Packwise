# Releasing Packwise

GitHub Pages is deployed automatically whenever `main` is updated. Android releases are created only from version tags.

## One-time Android signing setup

Create and securely back up the release keystore. Losing it prevents future APK updates from being signed with the same identity.

```powershell
keytool -genkeypair -v -keystore packwise-release.jks -alias packwise -keyalg RSA -keysize 4096 -validity 10000
[Convert]::ToBase64String([IO.File]::ReadAllBytes("packwise-release.jks")) | Set-Clipboard
```

In the GitHub repository, open **Settings → Secrets and variables → Actions** and create these repository secrets:

- `ANDROID_KEYSTORE_BASE64`: the Base64 value copied above
- `ANDROID_KEYSTORE_PASSWORD`: the keystore password
- `ANDROID_KEY_ALIAS`: `packwise`, or the alias selected when creating the keystore
- `ANDROID_KEY_PASSWORD`: the key password

Keep at least two encrypted backups of the original `.jks` file and its passwords. Do not commit the file or its Base64 representation.

## Create a release

Use semantic versions. The root `package.json` version and Git tag must match.

1. Update `version` in the root `package.json`, for example to `1.1.0`.
2. Commit and push the version change to `main`.
3. Create and push the matching tag:

```sh
git tag -a v1.1.0 -m "Packwise 1.1.0"
git push origin v1.1.0
```

The `Release Android` workflow builds the web client, synchronizes Capacitor, generates a signed APK and Android App Bundle, calculates their SHA-256 checksums, and attaches both files to the same GitHub release automatically.

Patch releases fix bugs (`1.0.1`), minor releases add backward-compatible features (`1.1.0`), and major releases contain breaking changes (`2.0.0`). Never reuse or move a published version tag; create a new patch version instead.
