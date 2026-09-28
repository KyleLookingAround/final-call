Theme: parts
# #22 Departures · 26 Sep 2026

- **Numbers:** $14.10, 329k of 1M context. Started 20:36, PR opened 21:49, merged 22:24. Two commits; CI green first time.
- **Went well:** it made the game faster, because its queues move passengers through sooner (Midfield 0.36× → 0.28× on the coordinator's machine). It also warned in its PR that Midfield had little speed headroom left for the other parts.
- **Lessons:**
  - That warning was right. Together, the market place and arrivals took Midfield from 0.36× to about 0.5×, over its 0.375× budget, though each was under it alone. → Shares of the speed budget are now in the briefs (`feature` playbook, #20). The coordinator measures the parts together before merging the last of them.
  - It left the search tables' wages and the What's new entry to the coordinator. That's fine, but the list of what's left belongs in the brief, not found at the end.
