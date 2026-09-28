# Income from Final Call

Issue: none (the owner's ask of 28 Sep 2026, `docs/briefs/income-game.md`) · Status: Proposed · PRs: (added as they open)

The owner's rules, tested against every option below: no ads, nothing between the player and the game, and nothing that lets a player pay to win. The game is one page on GitHub Pages with saves kept on the device: no server, no accounts, so nothing here needs one.

## What the player gets

A way to give the game money when they want to, and something back that changes how their airport looks, never how it plays. Players who never pay see the game they see today.

## What they see

- **Supporter pack.** A one-off purchase (about £4, on the owner's Ko-fi shop in a new tab) gives a code. Office › Settings gains a "Support" section under "Your save": the Ko-fi link that is already there, and a "Supporter code" field. A good code turns the pack on for that device: three extra liveries in the livery swatches, three terminal colour themes, and two photo-mode frames. A small "Supporter" mark shows beside the field. Nothing else changes.
- The Ko-fi link stays where it is (the foot of What's new, Settings and the level-up card, `docs/specs/kofi-link.md`). The shop is on the same Ko-fi page, so one link does both jobs and no second one is added.
- Never on the airport view, the board, the goal bar, in toasts or in the guided start. Nothing pops up, counts down or nags. The field fits a 320 px phone, a landscape phone, a tablet and a large screen.

## How it works

### The options, ranked by likely income against the owner's effort

| # | Option | Likely income | Owner's effort | The three rules |
| --- | --- | --- | --- | --- |
| 1 | **One-off supporter pack (looks only), sold as a file on Ko-fi's shop** | Low but real: about £4 from one to three players in a hundred | An hour: a shop item, a codes file | Passes all three |
| 2 | **Tips, as now, plus GitHub Sponsors** | Lowest: tips come from far fewer than one player in a hundred | Half an hour for Sponsors | Passes |
| 3 | **Pay-what-you-want listing on itch.io** (the same page, downloadable) | Low; itch.io brings browsing players of its own, and its buyers can take the pack | An hour to list, then nothing | Passes |
| 4 | **Convenience unlocks: 16× speed, extra save slots** | About the same as 1 | The same as 1 | 16× fails the spirit of no pay-to-win (below); save slots pass |
| 5 | **A desktop build on Steam** (the page wrapped in Electron, a proven route) | Could be the largest one day; the median 2025 Steam game took $249, and two in five didn't earn back the fee | Days: a store page, capsule art, a trailer, the tax interview, $100, reviews to answer | Passes, but not "little input" |
| 6 | **Phone app stores** | Unlikely to earn: Apple refuses thin wrappers of a web page (guideline 4.2), and a new personal Google Play account needs 12 testers for 14 days first | Days, plus $99 a year (Apple) and $25 once (Google) | Passes but not worth it yet |
| 7 | **Ad-funded portals: Poki, CrazyGames, Kongregate, Newgrounds** | Ruled out: they pay a share of ad revenue, and Newgrounds shows ads to anyone who isn't a paying supporter of the site | | Fails "no ads" |
| 8 | **Subscription or season pass** | Ruled out: a recurring charge on a game with no server is a promise of content on a clock | | Fails "nothing between the player and the game" |

The numbers behind "likely income" are under **Honest numbers**.

### Is 16× speed pay-to-win?

Not in the strict sense: speed changes nothing a player can build, and the simulation's steps are a fixed size within each speed band (`23-boot.js`: a thirtieth of a game minute below 4×, a tenth from 4× up, so phones do less work at speed), so a game hour does the same work at 8× and 16× and `PLAY` per game hour is unchanged. It still fails the rule's spirit, three ways:

- The bot measures pacing in game hours per level, but players feel real minutes. A player who pays reaches each level in fewer of them. Selling time is the shape pay-to-win takes in idle and tycoon games, and reviewers call it that.
- Phones already fall short of full speed at 8× (the `perf` group reports how far); at 16× a paid feature would stutter on most players' devices.
- It makes the free game feel throttled, which is the opposite of "nothing between the player and the game".

**The safest form**, if the owner wants more speed at all: a free **Skip to morning** for everyone (the airport is quiet overnight), and no paid speed. The pack sells looks only.

### An unlock with no server

- **Selling.** Ko-fi's shop delivers a file to the buyer the moment they pay, with no owner input. The file is a short text: a thank-you and one code. The owner makes a batch of codes once with a small Node script in `tools/`, from a private key that never leaves their machine, and uploads them as the shop item's file. Ko-fi has no per-order codes of its own, so the file carries the same codes for every buyer until the owner swaps it; see Choices for how often. (Gumroad and Lemon Squeezy do make a key per order, but Gumroad's check needs a server call the page can't make, and Lemon Squeezy's future for new sellers is unclear since Stripe bought it.)
- **Checking.** A code is `FC-` and a short payload (pack id, serial) with its signature. The page holds only the public key and checks the signature with the browser's own `crypto.subtle` (ECDSA P-256, in every current browser; Ed25519 only reached Chrome in mid-2025). No network call, no dependency, nothing against the one-page rule (`docs/decisions/ADR-2026-09-26-one-page-no-dependencies.md`).
- **Keeping.** A good code is kept in `localStorage` beside the save, under its own key, so the pack is per device and survives Reset progress. Saves stay on the device; a save code carried to another device carries no pack, and the player types their code again there.
- **What it costs in cheating.** Anyone can share a code, and anyone who reads the page can patch the check out or set the flag in the console. There is no way round that without a server, and this is how every offline licence key works (Sublime Text ships its public key in the app, and patchers exist). It is acceptable because the pack is cosmetic: a cheat gets a livery, not an edge over anyone, and nothing leaks. It would not be acceptable for anything that changes play, which is one more reason to sell looks only.
- Codes are never revoked; there is nothing to check them against. A leaked code costs a few sales, no more.

### When it unlocks, and managers

- From the start; nothing gates the field or the link. The pack's swatches, themes and frames aren't shown until a code is entered, in keeping with "hide locked items".
- No managers or recommendations: it isn't a system.

### What the owner sets up, by hand

- **Ko-fi shop** (the page `https://ko-fi.com/kylemck` exists): a shop item "Final Call supporter pack" at about £4 with the codes file attached, and payments turned on. Ko-fi takes nothing from tips and 5% of shop sales on the free plan (Ko-fi Gold, $12 (about £9) a month, removes it; only worth it past about £190 a month), plus PayPal's or Stripe's own fee. Ko-fi's public pages don't say it collects VAT for sellers; at these sums a UK seller is far below the VAT threshold, so nothing arises.
- **GitHub Sponsors** (option 2): the sponsor profile and one or two tiers. GitHub takes no fee from individual sponsors. Tiers can't deliver a code by themselves, so Sponsors stays pure support, or the owner sends a code by hand.
- **itch.io** (option 3): an account, the page, "pay what you want" from £0, itch.io's share left at its default 10% (a slider from 0 to 100%), plus card fees. Its tagging rule on generated content applies to the art, text and audio players see. Payouts need its identity and tax form.
- **Tax.** Sales are trading income. The UK trading allowance covers the first £1,000 a tax year across all such income without telling HMRC; above it the owner registers for Self Assessment. US platforms may ask a UK seller for a W-8BEN. Nothing here needs a company.
- Nothing in the game needs the owner's secrets: the public key is committed, the private key stays with the owner.

## Saved state

- The pack flag lives in `localStorage['final-call-pack']` (the code as entered), read at boot into `R.pack`; nothing in `G`. Reset progress leaves it alone.
- One new setting, `G.set.theme` (the terminal theme, default `null`), with its line in `FIELDS` and no migration: older saves take the default. A save opened on a device without the pack draws the default theme and keeps the field.
- Nothing is renamed or removed.

## Balance

None. Nothing reachable from `update()` reads `R.pack` or `G.set.theme`; drawing and the panel do. `PLAY` stays identical on seeds 1–3, and `STATE` differs only by the new setting.

## Checks

A new `pack` group (`pack.mjs` in `tools/checks/`):
- a code signed with the check's own test key passes the field; a changed character, another pack id and an empty field fail with a plain message;
- with no code, no swatch, theme or frame from the pack is present in Settings or photo mode (hidden, not greyed);
- with a code, they appear, the theme applies, and the code survives Reset progress;
- `G` and the random stream are unchanged by entering a code, applying a theme and taking a photo with a frame;
- the field fits a 320 px phone.

Screenshots of Settings with and without the pack at 320 px, phone, tablet and desktop.

## Honest numbers

So the owner can judge whether it's worth doing. Final Call launched on 28 Sep 2026 with a page counter (`docs/systems/usage-counts.md`); the first number to read is its own visits after a week.

- **Who pays in a free game.** Practitioners' consensus on itch.io and developer forums is that 1–3% of players tip or buy a one-off unlock in a free game; there is no measured platform figure, and no small browser game (Sandboxels, Kittens Game, A Dark Room, Candy Box, Universal Paperclips) has published its tip-jar takings. Treat 1% as the planning figure and 3% as the best case.
- **What that means here.** At £4 a pack, less 5% to Ko-fi and about 3% to the card, each buyer nets about £3.70. A thousand players in the first month gives roughly £37 to £111; ten thousand, £370 to £1,110. Tips run at a fraction of that. Nobody should give up a day job for this; it pays for the domain and a coffee.
- **itch.io.** No official median exists. Small creators who publish their figures report a few hundred to about $3,000 a year across several games; the one 2023 figure often quoted, $1,200 per title, is an average pulled up by a few hits.
- **Steam.** The median 2025 release earned $249; 66% earned under $1,000, 47% sold under 100 copies, 40% didn't recoup the $100 fee (Gamalytic's 2025 data). Valve returns the fee once a game passes $1,000. A free web game with a following can do better (Cookie Clicker's paid Steam port is the famous case), but it needs the following first.
- **Ad portals**, for scale only: a well-performing casual game on Poki or CrazyGames is said to clear $200–2,000 a month from ads. That is the money "no ads" leaves on the table, and the owner has chosen to.
- **Sources.** Who pays: itch.io guides and forum threads, for example https://generalistprogrammer.com/tutorials/how-to-make-money-on-itchio-indie-game-guide. itch.io creators' figures: https://www.nathalielawhead.com/candybox/my-gross-revenue-on-itch-io-transparently-sharing-all-my-stats-earnings-and-speaking-on-how-supportive-of-a-base-itch-io-has. Steam 2025: Gamalytic, https://gamedevreports.substack.com/p/gamalytic-67-of-games-on-steam-earned. Ad portals: https://app.cinevva.com/guides/web-game-monetization. Ko-fi fees: https://cartmango.com/ko-fi-fees/ (Ko-fi's own pages weren't reachable from the session). Gumroad: https://gumroad.com/help/article/76-license-keys and https://roo.beehiiv.com/p/gumroad-fees-2026. GitHub Sponsors: https://docs.github.com/en/sponsors/sponsoring-open-source-contributors/about-sponsorships-fees-and-taxes. Apple's guideline 4.2: https://www.mobiloud.com/blog/app-store-review-guidelines-webview-wrapper/. Google Play's testers: https://www.testerscommunity.com/blog/google-play-12-testers-policy. Microsoft Store: https://learn.microsoft.com/en-us/windows/apps/publish/whats-new-individual-developer. Ed25519 in browsers: https://caniuse.com/mdn-api_subtlecrypto_sign_ed25519. Sublime Text's keys: https://www.sublimetext.com/docs/portable_license_keys.html. The trading allowance: https://taxaid.org.uk/tax-information/self-employed-or-business-owner/accounts-tax-and-finance/trading-allowance.
- **Fees at a glance.** Ko-fi: 0% tips, 5% shop, or $12 (£9) a month for none. itch.io: 10% by default, any share from 0%. Gumroad: 10% + $0.50 (40p), and it handles VAT. GitHub Sponsors: 0% for individuals. Steam: $100 (£75) a game, recouped at $1,000, then 30%. Apple: $99 (£75) a year. Google Play: $25 (£19) once. Microsoft Store: free since 2025. Card processing (about 2.9% + 30¢, say 25p) sits on top everywhere.

## Choices

Each with the default this spec takes, so one reply settles them.

1. **Which options.** Default: option 1, the pack, on Ko-fi's shop, keeping the Ko-fi link as it is; options 2 and 3 when the owner has a spare half hour; nothing else until the page counter shows a hundred players a week.
2. **What's in the pack.** Default: three liveries, three terminal themes, two photo frames. Alternatives: liveries only (least work), or add extra save slots (a convenience, not a win, but more code).
3. **16× speed.** Default: no. If the owner wants it anyway, free for everyone, never sold.
4. **Price.** Default: £4. One-off supporter unlocks in free games mostly sit at £2–5.
5. **Seller.** Default: Ko-fi's shop, because the page and link exist. Alternatives: itch.io (brings browsers, 10%) or Gumroad (handles VAT, 10% + 50¢); both deliver the same codes file.
6. **Codes file.** Default: one file with one code, swapped for a fresh code each month by the owner (two minutes), so a leak only ever costs a month. Alternative: a file of many codes with "take the next one" (honour system).
7. **GitHub Sponsors.** Default: pure support, no reward, set up when convenient.
8. **itch.io.** Default: not yet; worth it once the game has had a post or review elsewhere to point at.

## Order of work

For the default choices, one PR each from its own brief:

1. **Codes and the field.** A codes script, `pack-codes.mjs` in `tools/` (make and check codes), the public key, `R.pack`, the Settings section with the field and mark, the system's notes (`pack.md` in `docs/systems/`), the `pack` check's first three points. No cosmetics yet, so the owner can try the shop with the item hidden.
2. **Liveries and themes.** Three liveries added to `LIVERIES` behind the pack; `G.set.theme` and three themes as CSS variables on `body`; the check's remaining points and the screenshots.
3. **Photo frames.** Two frames drawn by photo mode's shutter when the pack is on (`62-photo-mode.js`); the What's new fragment names the pack and the roadmap item moves to Done.
4. **Skip to morning**, only if Choice 3 says so: its own spec, since it touches pacing.

## Files

- `src/game/15-panel.js` (the Support section and field), `01-constants.js` (liveries), `62-photo-mode.js` (frames), `03-state.js` (`G.set.theme`), `src/shell.html` (theme variables, the field's styles), and a new game file, `src/game/NN-pack.js` for the code check and `R.pack`.
- New: `pack-codes.mjs` in `tools/`, `pack.mjs` in `tools/checks/`, and the system's notes, `pack.md` in `docs/systems/`.

## Left out

- No server, no accounts, no online check, no revocation.
- No ads, no ad-funded portals, no subscription, no pass, no loot, no in-game currency.
- No paid speed, plan points, cash, stands, routes or anything a player could otherwise earn by playing.
- No app-store or Steam build until the page counter says there are players to bring there.
- No Ko-fi widget or script in the page: the one-page, no-dependencies rule stands.
