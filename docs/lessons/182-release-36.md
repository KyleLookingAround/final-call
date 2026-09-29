Theme: release

# Release 36: the roof terrace and the Roadmap tab · 29 Sep 2026

- **Numbers:** one default-model session, started about 20:30 UTC; cost is read from the session record at the stopping points (about $5 estimated). One PR (#182), one push before Checks, no merges from `main` needed at the time of writing.
- **Went well:**
  - **The fragments and the players' roadmap were small and clear**, so the fold took minutes.
  - **Backdating `savedAt` five hours** kept the fixtures out of the welcome-back window.
- **Lessons:**
  - **A new version made the older fixtures fail `migrate`.** The check compared each `ADDED` field with its default, and `ver` defaults to the newest What's new version, so every fixture stamped with an older `ver` read as "not at its default" the moment version 36 existed. The check now skips `ver` for a save that carries its own stamp. → `tools/checks/migrate.mjs`
  - **The release playbook says the check prints the new hashes, but the first run prints "changed" for the old saves instead,** which hides the new files' hashes until that is fixed. A release that bumps the version should expect that failure first.
