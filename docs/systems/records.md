# Records, stamps and challenges

**Records, stamps and challenges** (`35-records.js`).
- Personal bests (`G.rec`) show a green toast, "Record: …", when broken; a stamp shows its own toast too, and both chime (`awardChime`, `06-sound.js`). They're screen-space toasts rather than a floater fixed to a map spot, so they're seen at any screen size and in landscape (release audit #151, row 22).
- There are 24 stamps; only earned ones are shown. `checkStamps` marks every stamp that newly qualifies in one pass and chimes once for the batch, not once per stamp.
- This week's challenges show under the goals on Office › Progress (`chalPanel`, `#chal`); records and stamps on Office › Records (`recordsPanel`). A challenge finishing, and the bonus for finishing all three, also chime once for whatever completes in the same check.
- Each game week has 3 challenges, sized from last week. Each pays about 12% of a day's profit, and finishing all three gives a plan point while plans remain.
