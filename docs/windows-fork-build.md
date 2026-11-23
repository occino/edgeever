# Windows builds for this fork

The **Build Windows app (fork)** workflow builds an unsigned Windows x64 NSIS
installer on a Windows GitHub Actions runner. It runs only when manually started
in `occino/edgeever`; upstream release workflows retain their repository gates.

1. Open [the workflow](https://github.com/occino/edgeever/actions/workflows/fork-windows-build.yml).
2. Select **Run workflow**, choose the branch to build, and start the run.
3. After the run succeeds, download `edgeever-windows-x64-<commit SHA>` from
   **Artifacts** on the run page.
4. Extract the ZIP. It contains the `.exe` installer, a SHA-256 checksum file,
   and build provenance. Artifacts expire after 14 days.

The workflow checks Web/API and Android types, builds the Web renderer and
Windows Rust sidecar, tests the sidecar, and verifies the packaged architecture,
dependencies, and app startup before uploading the installer. A successful run
does not establish installer or cross-version automatic-update compatibility.

No signing credentials are needed. Windows may warn about the unsigned
installer. This workflow does not publish a GitHub Release or update manifest.
The app identity and existing upstream automatic-update configuration remain
unchanged; these builds do not establish a separate fork update channel.
