# Android test builds for this fork

The **Build Android app (fork)** workflow creates an arm64 APK for physical
Android devices. It runs only on manual dispatch in `occino/edgeever`.

1. Open [the workflow](https://github.com/occino/edgeever/actions/workflows/fork-android-build.yml).
2. Select **Run workflow** and choose `main` (or another branch).
3. After success, download the `edgeever-android-arm64-test-…` artifact from
   the run page. Artifacts expire after 14 days.
4. Extract the ZIP and install its APK on your Android device. The artifact
   also includes SHA-256 checksums and build provenance.

No signing secrets are required. The workflow uses the public Expo template
test certificate, verifies its pinned fingerprint, and signs a standalone
release-mode APK containing the JavaScript and DOM bundles. Metro is not needed.
This key is public: use these builds for testing, not trusted distribution.

The app is named **EdgeEver Test** and uses package
`org.edgeever.mobile.occino.test` and a separate URL scheme. It installs beside
the official app and starts with separate local data. Sign into your instance
to access your synced notes. Expo OTA updates are disabled for this test build.
The app's existing manual update links still point to the official project;
get updates for this test app from subsequent workflow runs instead.

The version code is the source version code plus the workflow run number.
Later runs from the same or newer source version can update earlier test APKs
without uninstalling, provided the pinned test certificate remains the same.
Building an older branch can produce a lower version code. Rerunning the same
run retains its version code. The official Play app cannot be updated with
these APKs.

The workflow checks types, runs task-progress and configuration regression
tests, and verifies APK signature, package identity, and arm64 contents before
upload. It does not run an Android emulator, publish a Release, or upload to
Google Play. Installation and interaction still require USB-device validation.
Production app configuration and official release-signing rules are unchanged;
test configuration is generated only in the workflow checkout.
