# The Roadmap tab's list

What players see on What's new › Roadmap, one file per entry, joined by the build into `ROADMAP` in `src/game/38-updates.js` in file-name order (so the number at the front sets the order, and entries of one status sit together). Separate from `docs/roadmap.d/`, which is written for sessions.

```
# A short title
Status: next
Code: SOON
Summary: One short line players will see.

- One to four detail bullets.
- Each a sentence or two.

Note: An optional closing line.
```

- **Status** is `landed`, `next`, `boarding`, `scheduled` or `radar`. The board groups them in that order: Next update, Boarding, Scheduled, On the radar, Landed.
- **Code** is a version such as `V35` for a landed entry, and `SOON`, `TBA` or `IDEA` for the rest.
- **Wording** is concise UK English, with no issue or PR numbers and nothing the owner has rejected.
- **Who moves an entry.** The release playbook flips a shipped item from `next` to `landed` and sets its code to the new version. The owner approving a spec moves its item from `scheduled` or `radar` to `boarding`. Every other move is the owner's.
- The `roadmap-card` check fails on an entry with an unknown status, no code or title, a summary that is too long, or no details or more than four.
