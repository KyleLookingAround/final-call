---
type: Lesson
theme: checks
---
# The terminal as a place: the checks refresh · 28 Sep 2026

- **Numbers:** estimate $10; the session's cost wasn't reported yet at opening. Started 17:53, PR #144 opened 18:30. With `TP_ALL=1`, `floors` went from 43 s to 5 s and `terrace` from 9 s to 13 s, with four new checks. Full local run: 347 passed, 34 pending.
- **[D] (c), pre-written checks changed:** five renamed or re-set as the spec asks. `floors`' six play checks moved onto one play, so its `MAIN` numbers were re-measured. Its old saves load into one page with `resetAll` instead of 27 fresh pages, which was most of the 43 s.
- **Lessons:**
  - A flight's `std` doesn't say when its gate is called: here boarding opens, and the gate is called, hours before `std`. I lost two rounds picking "a flight 90 minutes out" by `std`. → A check that needs a gate call reads `callAt(F)`, or causes the call (`TP.hurry`), and never reasons from `std`.
  - Timing one level 9 game day before writing anything (about 9 s at 0.1-minute steps) set the plan: fine steps only around the events, 0.25 elsewhere. As lesson 90 says, budget it before writing.
  - The fresh review found two checks that could pass without testing anything (a runner who never changed floor, and "0 up in rain" with nobody up in the dry), and one that sampled floors once a frame at 8×, which could fail a correct build. → Every "none of X" pass mark also needs "and X could happen" in the same check; lesson 90's rule, missed again, so the review stays.
