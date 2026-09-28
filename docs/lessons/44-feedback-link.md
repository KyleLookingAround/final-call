Theme: tools
# A feedback link in Help · 27 Sep 2026

- **Numbers:** session `session_01RcMyepPjoZed4Nu662QwAW`, estimate $6. Started from a checked brief with no questions for the owner; every check passed first time, including the new `feedback` group.
- **Went well:** the graph queries in the brief (`openHelp`, `17-help-keys-speed.js`, `38-updates.js`) named the file, its functions and where the version lives, so no wider search was needed. Faking the served location with a route interception (rather than trying to override `window.location`) let the check exercise the GitHub Pages path without real network.
- **Lesson:** `npm run preview` regenerates the link-preview image from a live save's current camera state, so it changes on every run even without a visual change; a PR that didn't touch drawing had nothing to gain from committing a new one. → No change: only commit the regenerated image after a PR that actually changes how the game looks, and check the diff isn't just run-to-run noise first.
