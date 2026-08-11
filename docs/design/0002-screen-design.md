# 0002 — Screen design

Status: **`BLOCKED:owner-gate`**. This unit waits for owner approval. Every later interface unit is
measured against the drawn screen and against the counts below.

The drawn screen is `docs/design/0013-screen-final.html`. Open it straight from disk. It needs no
server and makes no network request. It draws four panes — the roll flow, the builder open, the
history summary and the history record — at 360 px, at 768 px and at 1440 px. It draws the roll flow
twice on the phone, at 760 px tall and at 660 px tall. Thirteen renders sit beside it.

`docs/design/mock.html` drew an earlier screen of eight dice. Decision 1 in
`docs/design/0012-settled-decisions.md` retired it. Read the drawn screen, never the mock.

Every count in this document is derived from the drawn screen. Nothing is carried over from the
earlier draft. Where a measurement would drift, this document points at the drawn file instead of
copying it.

---

## 1. What "at rest" means

At rest is the screen with the disclosure closed and no throw in flight. There are two rest states,
and the budget is a ceiling over both, not an average.

| Rest state | When | The pool builder | Dice on the table |
|---|---|---|---|
| **A — before a throw** | The app opens, or the pool is built and not yet thrown. | Open. | None. The table is empty. |
| **B — after a throw** | A roll or a push is on the table. | Collapsed. `Edit pool` reopens it. | Every die carries a value and lies in one of the two zones. |

**The builder collapses on a roll.** That one behaviour moves the six pool cells out of the keyboard
order and moves `Edit pool` into it. Every count below therefore names the state it holds in.

State B is the worst case for the tray, because the tray is empty until a throw lands. State A is
the worst case for the builder, because the builder is closed after one. The drawn screen draws
both. Its roll pane is state B. Its builder pane draws the builder over a table, which is the
`Edit pool` moment rather than a first launch.

## 2. How a control is counted

**One control is one tab stop.** A composite widget that moves its inner focus with the arrow keys
holds one tab stop, which is the standard count for a composite widget. The pool bar and the dice
tray are each one control by that rule.

The difficulty is one control by a second rule. It carries one value over seven positions, so its
arrow keys change the value and never move the focus. The seven notches and the two step ends are
hit targets on one control. They are not nine controls.

A second figure is given for audit: the **hit target** count, which is every distinct place a finger
can land. That figure carries no budget. Both figures are stated, so the counting rule can be
rejected without hiding the number it produced.

## 3. Control inventory — visible by default

The counting rule is section 2. The counts follow it. The budget is 8 controls at rest, and it is a
ceiling over both rest states.

| # | Element | What it does | Rest A | Rest B |
|---|---|---|---|---|
| 1 | `collapse-button` | Closes the builder and shows the table. It reads Done. | yes | no |
| 2 | `pool-bar` | Six per-type cells, one per dice type. Arrow keys move between the types and change the count. | yes | no |
| 3 | `difficulty` | One value from −3 to +3, drawn as seven notches. It prints what it will do to the next throw. | yes | no |
| 4 | `dice-tray` | The dice as they lie, over the kept shelf and the throw zone. Arrow keys move between the dice. A press keeps a die by choice or releases it. It holds one cell per die in **both** renderers: the flat cell draws the die, and the cell over the 3D table lies on the die the tray put down and draws none of it. Decision 9. | no | yes |
| 5 | `edit-pool-button` | Reopens the builder. It rides on the cost row. | no | yes |
| 6 | `disclosure-toggle` | Opens the one sheet that holds everything else. It reads More. | yes | yes |
| 7 | `roll-button` | Throws the built pool. One tap. It carries the dice count and the difficulty. | yes | yes |
| 8 | `push-button` | Pushes the roll on the table. One tap. It carries the re-throw count and the stress. | no | yes |
| | | **Controls at rest** | **5** | **5** |
| | | Budget | 8 | 8 |
| | | Hit targets, reported only | 24 | 27 |

**The drawn screen meets the budget.** Five controls at rest A and five at rest B, against a ceiling
of 8. Three controls of the eight are absent in each state, and no state shows all eight at once.

The hit targets of state A are one Done, twelve pool cell ends (six cells, a minus end and a plus
end each), seven difficulty notches, two difficulty step ends, More and Roll.

The hit targets of state B are twenty-three dice the player may keep or release, Edit pool, More,
Roll again and Push. A die the rule holds takes no press, because the player cannot release a rule
lock. The drawn screen holds seven of its thirty dice by the rule, and the player keeps two more by
choice. Both figures follow the drawn faces and move with them, which is why they carry no budget.

A roll is one tap on `roll-button`. A push is one tap on `push-button`. Neither needs a mode, a menu
or a confirmation.

### The footer is persistent

`edit-pool-button`, `disclosure-toggle`, `roll-button` and `push-button` all live in the footer. The
footer is a row of the screen grid and not an overlay, so it never covers the table. It reserves
`env(safe-area-inset-bottom)`, so its buttons clear a phone gesture bar. The drawn phone frames
force that inset and draw the gesture bar inside it.

The difficulty rides on `roll-button` and the push cost rides on `push-button`. A modifier travels
with the action it modifies. Neither reading is in the header.

### The header is status and never navigates

The header holds one line: the successes, the banes, the dice count, the stress and the push count.
Nothing in it is tappable and nothing in it holds a tab stop. Decision 2 settles this.

### The history is a separate destination

The history has its own header and its own footer. It is a second surface and carries no share of
the budget, exactly as the disclosure sheet does.

| View | Controls | Count |
|---|---|---|
| Summary | `back-button`, `history-list`, `statistics-button`, `import-button` | 4 |
| Record | `back-button`, `export-button` | 2 |
| Statistics | `back-button` | 1 |

`history-list` is a composite. It holds one visit per logged roll, so its length follows the log.
The record holds the transposed matrix — one row per die and one column per generation — and exactly
one export control, in its footer.

**`import-button` sits in the summary and not in the record.** An import replaces the whole log,
which Unit 4.6 settled, so it belongs beside the list of the whole log and not beside one roll. It
opens a file picker that carries no tab stop of its own, so the summary counts the controls above
and not one more. Decision 13 records the choice and the two options it was taken between.

**The statistics are a third view, and `statistics-button` opens it.** The record is one roll and
the charts are the whole log, so the charts are a peer of the record and not a part of it.
`statistics-button` sits beside `import-button` in the summary footer, where the other whole-log
control already is, and `back-button` returns to the summary from both the record and the charts.
Decision 14 records the choice and the option it was taken against. The statistics view holds one
control, because everything in it is read-only.

**The export writes the whole log too.** The control lives in the record because Decision 3 puts it
there, and the file it writes is every roll. A file of one roll, read back by an import that
replaces, would take a campaign away.

**The destination replaces the roll flow while it is open.** It is a route and not an overlay, so
the roll flow holds no element at all while the history is on the screen, and neither keyboard walk
of section 6 can change. Decision 12 records the choice and the two options it was taken between.
Unit 4.4 built the summary and a record SHELL. Unit 4.5 added the transposed matrix and
`export-button`, Unit 4.6 added `import-button`, and Unit 4.7 added the statistics view.

### Read-only, and therefore not counted

These carry no input and hold no tab stop. A screen reader reaches them through the live region and
through the table semantics.

- The status line: the success count, the bane count, the dice count, the stress value and the push
  count.
- The two zone bands: the kept count and the re-throw count.
- The push cost line on the cost row.
- The difficulty preview line inside the builder.
- The dice count and the difficulty printed on `roll-button`.
- The re-throw count and the stress printed on `push-button`.
- The record statistics and the transposed matrix.
- The three charts of the statistics view. Each one is a real table, so a screen reader reaches
  every value by its row and its column. The bar beside a value is `aria-hidden` decoration, and
  every series carries a shape as well as a colour.
- `fault-banner`, the one error surface — Unit 4.10, Decision 19. It sits at the head of the middle
  region, on the roll flow and in the history destination, and it holds one row per SLOT: `table`,
  `log`, `import` and `settings`, drawn as `flat-fallback-note`, `log-fault-note`,
  `import-fault-note` and `settings-fault-note`. Eight faults share those four rows, because the
  faults inside one slot cannot hold at once. Every row is in the document from the first paint with
  no text, and an empty row takes no height, so the drawn screen is unchanged while nothing has
  failed. **The banner carries `role="alert"` and the name "Problems", and every row inside it
  carries no role of its own**, because a live region inside a live region is announced twice.
  **It holds no tab stop**, so neither keyboard walk of section 6 changes: every recovery route the
  words name is a control that already exists, and the row names it.
- `flat-fallback-note`, the one-time notice that the dice fell to flat dice. Unit 3.7 added it and
  Unit 4.10 made it the `table` row of the banner above, under the same name.
- `share-preview`, the card the player is about to post. It is an image the application generates, so
  it carries alternative text built from the same roll the card draws. It sits inside the disclosure
  sheet and holds no tab stop. Unit 4.9 added it.

## 4. Behind the one disclosure

One sheet, opened by `disclosure-toggle`. The override panel and the theme builder live here, as the
plan requires. The sheet is a second surface and carries no share of the budget.

| Control | What it does | Unit |
|---|---|---|
| `sheet-ruleset` | Picks one of the four push profiles. | 4.1 |
| `sheet-overrides` | Every field of the profile record: the success lock, the per-type bane locks, the push limit, the cost source, the cost unit, the amount per unit, the stress behaviour, and the blockers. Each row that differs from the preset is marked, and `overrides-reset` inside the panel returns to the preset unchanged. | 4.2 |
| `sheet-mode` | Pool dice or step dice. A switch discards the built pool. | 2.1 |
| `sheet-presets` | The saved pools. A name field, one save control, and one row per saved pool carrying recall, move up, move down and delete. It draws no control in step mode, because a saved pool holds counts and step mode holds two rated sizes. Decision 11. | 4.3 |
| `sheet-artifact-curve` | Escalating or flat. | 4.1 |
| `sheet-theme` | Three axes — surface, accent and dice material — plus the colour builder. Each axis is one group of six rows with a roving arrow walk, so the panel adds four tab stops to the sheet and none to the main screen. The builder takes two colours as text, reports every reading a built set misses, and applies nothing while a finding stands. **Amended 2026-08-11:** the three axes are one. One group of six rows sets the dice, the surface and the interface together, so the panel adds two tab stops to the sheet and still none to the main screen. The builder is unchanged. | 4.8 |
| `sheet-history` | Opens the history destination. The log, its statistics and its export live there, not here. A read-only storage reading sits beside it, `sheet-storage-estimate`, which holds no tab stop. | 4.4 to 4.7 |
| `sheet-stress-reset` | Sets the stress counter back to zero. | 2.1 |
| `sheet-tray-renderer` | Rolls the dice on the table, or draws them flat. It clears a permanent fall to flat dice. | 3.7 |
| `sheet-sound` | The dice sounds. A checkbox turns them on and a slider sets the level, from nothing to full in twenty arrow presses. The slider stays reachable while sound is off, marked `aria-disabled`, so a level can be set before any noise is made. Every sound is synthesised and this application holds no sound file. Decision 17. | 3.6 |
| `sheet-share` | Makes one card of the roll on the table, shows it with alternative text carrying the same readings, and offers two ways out: a saved file, and the browser's own share target where the browser offers one. The card names the application and nothing else about where it came from. Decision 16. | 4.9 |
| `sheet-overlay` | Shows the performance readings over the screen: p95 and p99 frame duration, the long-task total, and throw-to-first-motion. Every line names its unit and its sample count, a percentile below its floor is refused, and a figure this browser cannot measure is named rather than printed as a zero. **It reports and never gates**, and the switch is not stored. Decision 18. | 3.8 |
| `sheet-close` | Closes the sheet and returns focus to `disclosure-toggle`. | 2.1 |

**Amended 2026-08-10: five categories, and two columns on a desktop.** The sheet drew the twelve
rows above as twelve children of one column, three of them bare controls under no heading at all, at
520 px on a phone and on a desktop alike. The rows now sit in five categories: **Rules**
(`sheet-ruleset`, `sheet-overrides`, `sheet-mode`, `sheet-artifact-curve`), **Saved pools**
(`sheet-presets`), **Look** (`sheet-theme`, `sheet-renderer` holding `sheet-tray-renderer`),
**Sound** (`sheet-sound`), and **Session and data** (`sheet-history-group` holding `sheet-history`
and `sheet-storage-estimate`, `sheet-share`, `sheet-stress` holding `sheet-stress-reset`, and
`sheet-readings` holding `sheet-overlay`). A category that holds one group is that group, so
`sheet-presets` and `sheet-sound` carry no second heading. Every `data-el` above keeps its name and
its place inside the sheet.

Above 760 px the sheet is a centred dialog of `min(880px, 92vw)` and the categories sit in two
columns. It is not a nav rail and it is not tabs, and the reason is the keyboard: a rail draws one
pane at a time, so the walk from `sheet-tray-renderer` to `sheet-sound-toggle` would need a pane
change first, and `node scripts/browser.mjs --sound-controls` presses exactly that walk. Two columns
keep one linear tab order and run no script. The phone keeps the bottom sheet and the one column.
`src/app.test.tsx` counts the categories and refuses a loose control beside them, and
`node scripts/browser.mjs --sheet` measures both layouts as laid-out rectangles at 1440 and at 360.

**A heading holds a member of its own.** The categories put a third label over the six theme rows,
which already carried "Theme" outside them and "Colour" inside them. The rows now carry no heading
of their own and `sheet-theme` names them. The rule this states is not a depth: a group earns its
heading by holding a control of its own, and only the five categories may hold nothing but groups.
The sheet draws 46 controls under 19 headings at depths of one to four, and the deep ones are
correct — the blockers of the push profile are a named set inside "The rules in force", and the page
mode is a named set inside "Build your own". `src/app.test.tsx` counts both denominators.

The mode switch sits here on purpose. It destroys the built pool, so it must not sit one tap away
from the throw. `sheet-ruleset`, `sheet-overrides` and `sheet-artifact-curve` sit here for the same
reason: each of the three clears the roll on the table, which Decision 10 settles. `sheet-presets`
sits here for the first of those two reasons: a recall writes over every tile of the built pool, so
it belongs beside the mode switch and not beside the throw. Decision 11 records it.

**The sheet is a real modal, and Unit 4.11 made it one.** It carries `role="dialog"` and
`aria-modal="true"`, which tell a screen reader to ignore everything behind it. A keyboard is not
told anything by that attribute, so the sheet holds the Tab key itself: focus cannot leave the sheet
by Tab or by Shift and Tab, it wraps at both ends, Escape closes, and closing returns focus to
`disclosure-toggle`. The sheet carried `aria-modal="true"` with no such hold from Unit 2.1 to Unit
4.10, and seven units added controls behind it in that time.

**The sheet scrolls.** `sheet-overrides` draws one row per field of the push-profile record, so the
sheet is taller than a phone at every width. It carries `max-height` and `overflow-y: auto`, so it
degrades by scrolling and never by clipping, exactly as `.shell-m` does under Decision 6. Measured at
360 by 760 through `node scripts/browser.mjs --sheet`: every hit target clears the 24 px floor of
WCAG 2.2 SC 2.5.8, nothing sits off the side of the viewport, and the close button is reachable.

**Section 6 is unchanged, and that is measured rather than assumed.** Both keyboard walks are walks
of the main screen at rest, where the sheet is closed and holds no element at all. Neither list names
a `sheet-` control, and the counts stay eleven visits before the throw and thirty-five after it. Both
instruments read those lists out of this document.

**The performance overlay is drawn over the main screen and still changes neither walk.** It is the
one thing behind this disclosure that puts an element on the roll flow. It is a named region holding
no control, so a reader reaches it as a landmark and the keyboard passes it by. `src/app.test.tsx`
walks the live screen with the panel on and reads the same eleven visits, and
`node scripts/browser.mjs --overlay` counts the tab stops of the panel, the panel element included,
and presses Tab from `disclosure-toggle` to prove `roll-button` is still the next stop.

**The override panel is generated from the profile record.** It lists no field of its own, so a field
added to the record appears without an edit to the screen. `src/settings/profile-fields.test.ts` and
`src/app.test.tsx` both count the rows against a second walk of that record, so a field the panel
stops drawing turns them red. The identifier, the name and the description of a profile are its
identity: they are drawn read-only, and no control and no stored record can override them.

## 5. How the six pool cells fit the budget

A cell does not have to be two tab stops. Each dice type is one tile with a minus end and a plus
end, so the whole bar is six tiles and twelve hit zones. The six tiles then form **one composite
widget with a roving tab index**: Tab reaches the bar once, the left and right arrows move between
the dice types, and the up and down arrows change the count of the type in focus. That turns twelve
buttons into one control and one arrow habit.

Each end is 44 px wide, so six tiles do not fit across a phone. The bar holds two columns at phone
width, three columns from 600 px and six columns from 1100 px. The builder scrolls at phone width. A
builder is a form, and a form scrolls. Decision 5 settles this.

Two more collapses fall out of the same idea. The artifact tile steps along an enumerated ladder —
none, d8, d10, d12, d12+d8, d12+d10, d12+d12 — which gives a size and a count from one value. The
stress tile **is** the stress counter, because the counter and the number of stress dice are the same
number, which is why `nextStressId` reads the counter for its ordinal.

**Step mode holds the same six tiles.** The one difference is what the attribute tile and the skill
tile carry: a die size instead of a count. Each of the two steps its own size, because
`specs/0001-rules-model.md` rates the two on independent scales. The attribute tile walks d6, d8, d10
and d12. The skill tile walks the same four sizes and holds "none" below them, because a step roll
may take no skill die at any attribute size. So the bar is six tiles and twelve hit zones in both
modes, and the control count of section 3 is the same in both. An earlier draft merged the two into
one tile and shrank the bar to five. Decision 7 of `docs/design/0012-settled-decisions.md` records
that draft and the note that overruled it.

## 6. The keyboard order

The DOM order is the visual order at all three widths: the header, then the middle, then the footer.
The header holds no stop. The middle holds the builder in state A and the two tray zones in state B.

Unit 4.11 asserts the list below, so the list is derived and never estimated. It is a walk of the
DOM of `docs/design/0013-screen-final.html` in document order, with section 2 as the counting rule.
An earlier note in `0012-settled-decisions.md` predicted 41 visits from the eight-die structure. That
prediction is withdrawn.

**Re-derived on 2026-08-09 at the draw target of 30 dice.** The die list is counted off the drawn
screen with a command, and never by hand:

```sh
sed -n '/pane: roll /,/pane: builder/p' docs/design/0013-screen-final.html | grep -c 'data-el="die-'
```

The drawn pool is five attribute dice, five skill dice, three gear dice, an artifact rating of six
which gives two d12 dice, two bonus dice and ten stress dice. The difficulty stands at +3, which adds
three more bonus dice. That is 30 dice, which is the draw target Decision 1 sets. `worstCaseState`
in `src/shell/state.ts` derives the number, and `src/shell/drawn-screen.test.ts` counts the drawn
screen against it.

The difficulty adds its bonus dice after the stress dice, so `Bo3` to `Bo5` come last in pool order.
That order is the core's, read from `buildPool`, not a choice of this document.

**Before the throw — eleven visits.** The state is rest A: the builder is open and the table is
empty. Tab reaches items 1, 2, 9, 10 and 11. The arrow keys reach items 3 to 8 inside the pool bar.

1. `collapse-button`
2. `pool-bar`
3. `pool-cell-attribute`
4. `pool-cell-skill`
5. `pool-cell-gear`
6. `pool-cell-artifact`
7. `pool-cell-bonus`
8. `pool-cell-stress`
9. `difficulty` — the arrow keys change the value here and do not move the focus
10. `disclosure-toggle`
11. `roll-button` — Enter here throws the pool and collapses the builder

**After the throw — thirty-five visits.** The state is rest B: the builder is collapsed and 30 dice
lie in the two zones. Tab reaches items 1, 32, 33, 34 and 35. The arrow keys reach items 2 to 31
inside the tray. The kept shelf comes first and the throw zone second, and pool order holds inside
each zone.

1. `dice-tray`
2. `die-at2`
3. `die-sk1`
4. `die-sk2`
5. `die-ge1`
6. `die-ar2`
7. `die-st7`
8. `die-st8`
9. `die-st10`
10. `die-bo5`
11. `die-at1`
12. `die-at3`
13. `die-at4`
14. `die-at5`
15. `die-sk3`
16. `die-sk4`
17. `die-sk5`
18. `die-ge2`
19. `die-ge3`
20. `die-ar1`
21. `die-bo1`
22. `die-bo2`
23. `die-st1`
24. `die-st2`
25. `die-st3`
26. `die-st4`
27. `die-st5`
28. `die-st6`
29. `die-st9`
30. `die-bo3`
31. `die-bo4`
32. `edit-pool-button` — Enter here reopens the builder and returns the order to the first list
33. `disclosure-toggle`
34. `roll-button`
35. `push-button` — Enter here pushes

**Eleven visits before the throw, thirty-five after it, forty-six in all.**

Items 2 to 10 are the kept shelf and items 11 to 31 are the throw zone. Nine and twenty-one. The
split is the only place the tray departs from pool order, and that split is the push decision the
player is reading.

The tray holds one cell per die, so its length follows the pool. The test therefore fixes the pool
and counts the cells against the pool size, which gives a denominator that can fail. The shelf count
and the zone count must sum to the pool size, so a die lost between the zones fails the sum.

A tab stop inside a composite widget is the cell that carries `tabindex="0"`. A test asserts the
container by walking up from the focused element, so a change of the active cell does not break the
order. A throw puts that cell back on the first die of the shelf, because the same dice come back
on every throw and the tray must not open in the middle of itself.

### The list holds in both renderers

The list above is one list. Unit 3.7 chooses between the 3D table and the flat dice at startup, and
neither walk changes with that choice: the die cells are real DOM either way, and with the table
running they lie over the dice the tray put down. Decision 9 in `0012-settled-decisions.md` records
that choice and its reasons. Both instruments walk both renderers — `src/app.test.tsx` under jsdom,
and `node scripts/browser.mjs --shell` with real key presses in Firefox, whose run reaches the 3D
table on a machine that can draw one. `node scripts/browser.mjs --blocked-chunk` walks the same list
on the flat dice, with the 3D chunk refused at the network layer.

### The stop the browser adds, which the lists above do not hold

The two lists are authored. A browser walks one more stop than the list above holds while the middle
region scrolls, and that stop belongs to the browser.

`.shell-m` scrolls, which Decision 6 requires: the layout degrades by scrolling and never by
clipping. A browser gives a scrollable box its own tab stop, so a keyboard can scroll a region that
holds no control. **Do not remove the scroll to make the count come out.** The stop is the cost of a
layout that never clips, and the drawn screen earns the same one.

The extra stop carries no `tabindex`, and no name in the markup asks for it. It is therefore
identified by measure and never by name: the focused element holds no `tabindex` attribute, and its
`scrollHeight` is greater than its `clientHeight`.

**How the count is reconciled.** The walk reports such a stop under its own name and does not count
it against the authored list. The authored counts stay eleven and thirty-five. A run that reports
one extra stop and eleven authored visits agrees with this document. Unit 4.11 asserts the authored
lists and reports the browser's stops beside them.

**Corrected by Unit 4.11, 2026-08-10.** The two sentences above and below read "eleven and thirty"
until this unit. The list was re-derived at the draw target of 30 dice before Unit 2.2 shipped, and
the after-throw count went from thirty to thirty-five, but these two sentences kept the old figure.
No check read them, so both instruments passed over a false statement for eight units. A check now
reads every sentence of this document that states a walk count, so a third statement cannot drift
alone.

The stop appears only while the region overflows, so the reading follows the height and the number
of dice. Measured on 2026-08-09 through `node scripts/browser.mjs --shell`, over the built output in
Firefox at 800 by 600: before the throw, with the table empty and the builder open, the walk reported
no such stop; after the throw, with 30 dice on the table, it reported one at `shell-mid`. At the draw
target the middle scrolls at both phone heights as well, which the dated note under Decision 6
measures. An earlier reading at 25 dice found no stop at 360 by 760, and that reading is superseded.

**The 3D table earns no such stop, and that is measured too.** The flat dice fill the middle with a
list that grows with the pool, so the middle overflows. The 3D table takes the middle it is given
and its walls follow the canvas, so the middle does not overflow and the browser adds no stop.
Measured on 2026-08-09 through the same command at 800 by 600 with the table running: no stop before
the throw and none after it, over 30 dice. Both readings stand. Which one a run reports follows the
renderer the startup probe chose, and neither one changes the authored counts of eleven and
thirty-five.

## 7. What the interface units inherit from this unit

- **Shape carries every meaning that colour carries.** A success is a circle and a bane is a
  triangle, on the die, in the matrix and in the status line. A badge number on a die is the success
  count of that die, so an artifact die worth two successes reads correctly. The three lock states
  differ by ground and by frame, never by hue alone: a rule lock has a solid frame on a shaded pad,
  a choice lock has a dashed frame, and a loose die is lifted and carries no pad. On the 3D table
  the same three states ride shape as well, as the marks Unit 3.5 draws on the dice: a closed frame
  around a rule lock, four corner blocks on a choice, and nothing on a loose die.
- **Every colour is a role, not a hue.** The drawn screen names every colour as a role variable in
  `:root`, grouped into the three axes of Unit 4.8: surface, accent and dice material. A theme is a
  variable set. No rule in the stylesheet reads a hue, so the three axes stay independent.
  **Amended by Unit 4.8, 2026-08-10.** `src/shell.css` now holds no colour at all: the role block
  left `:root` and `src/theme/css-vars.ts` says which palette token fills which role. The drawn
  screen gave the stress dice a material of their own, because every die was one neutral body then.
  A flat die now takes the body colour of its own type from the dice axis, exactly as the 3D die
  does, and the six types are a lightness ladder no two rungs of which sit closer than 8 CIE L*.
  Colour is therefore still never the only carrier, and the stress die is told apart by the same
  rule as every other type. Decision 15 records the choice.
  **Amended again 2026-08-11.** The three axes are one axis. One theme id names the dice row, the
  tray surface and the interface palette together, so the three no longer move apart and the word
  independent no longer applies to them. Every colour is still a role and no rule in the stylesheet
  reads a hue, which is the part of this bullet that does not change.
- **The cost of the push is read from `previewPush`, never recomputed.** The cost row prints the
  re-throw count and the complication warning, and `push-button` prints the re-throw count and the
  stress. The drawn screen shows the third profile, where the price of a push is a stress rise.
  Under the first profile the same line prints rating points, and under the second it prints one
  referee point.
- **The matrix is transposed and rectangular.** The record holds one row per die and one column per
  generation, which is Decision 3. A die that locked early shows a dot for every later generation. A
  die added mid-roll is blank for every generation before it existed. Thirty rows scroll on a phone,
  and a pushed roll under the third profile holds more. Thirty columns do not scroll on a phone at
  all, which is why the matrix is transposed.
- **Touch targets are at least 44 px, and the buttons are 50 px tall.** The pool cell ends are 44 px
  wide and full tile height, and the whole tile is the drag surface. The seven difficulty notches
  are the one exception at 39 px wide, measured at 360 px in the drawn file. They clear the 24 px
  floor. Seven 44 px notches need more width than the card gives. Decision 5 records the trade.
- **The footer is a grid row and never an overlay.** The middle area scrolls and the footer does not
  move, so the push stays one tap away at every scroll position. At the draw target of 30 dice the
  middle scrolls at both phone heights, 760 px and 660 px, and it loses nothing at either. Decision 6
  holds both measurements and the dated note that re-measured them.
- **Motion respects `prefers-reduced-motion`.** The shake at Unit 2.2 becomes a cut when the setting
  is on, and the 3D table skips the tumble and lands its dice at once.
- **The roll result reaches a live region.** The status line is the live region, and it names the
  successes, the banes, the dice count and the stress.

## 8. The state the drawn screen draws

The drawn screen is filled with a real result, not with placeholder text, so the owner judges real
density. It draws the draw target, because that is the case that fails first.

**The state is constructed through the rules core, never drawn by eye.** It is the first roll of
`worstCaseState()` from seed 12, under the third profile, with `At2` and `Ge1` pressed to keep.
`src/shell/drawn-screen.test.ts` rebuilds it and compares it against the file, so a screen the rules
cannot produce fails the suite.

- Rule set: pool, stress dice and complications.
- The pool: five attribute dice, five skill dice, three gear dice, an artifact rating of six which
  gives two d12 dice, and two bonus dice. Ten stress dice join them.
- Difficulty +3, so the next roll adds three bonus dice. Those three are already on the table,
  because the throw that filled it took the same difficulty.
- The tray holds 30 dice, which is the draw target of Decision 1.
- No push has landed yet. The status line reads ten successes, four banes, 30 dice, stress 10 and
  push 0. The stress reading is at its cap and is marked.
- The kept shelf holds nine dice: seven the rule holds and two the player chose to keep. The throw
  zone holds twenty-one. Every count in the two bands is the length of the list under it.
- The next push would throw twenty-two dice. That is the twenty-one loose dice plus the stress die
  the profile adds before the re-throw, and it is why the tray passes 30 on a push.
- **No complication check is due, and that is a rule and not a choice.** A complication check follows
  a bane on a stress die, and the same bane blocks every further push. A live `Push` beside a stress
  bane is unreachable under this profile, so the screen may draw one or the other and never both.
- The builder pane draws the same screen after `Edit pool`. The pool cells sit at their caps, so the
  cap labels are drawn where they are hardest to fit. The artifact tile prints `d12 + d12`, which is
  the one tile value that needs more than one line on a phone.
- The history record draws a different roll: yesterday at 21:07, 25 dice, nine successes, six banes
  and two pushes. Its matrix draws all three generations and the dots of the dice that locked early.
