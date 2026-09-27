# Region

**Region** (`24-region-places.js` to `30-region-ui.js`). Bus, tram, rail, metro and high-speed lines, development sites, events, and weather.
- **Transport tab.** The summary's riders are the sum of every line's; it names the three busiest. A line in service with no riders says when a quicker line with riders stops at two or more of its stations and takes them.
- **Night on the map.** `drawRegion` darkens the land after the towns and sites and before the network, so lines, stations and labels stay readable; the towns' lit windows are gathered while their blocks draw and filled over the tint.
- **Region news.** `news` (`28-region-weather.js`) is the Reports feed's Region news list. A signal failure or wire fault repeated on the same day folds into the one line that started it, naming every line and fault kind it's actually seen, rather than one near-identical line per incident.
