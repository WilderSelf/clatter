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
| 4 | `dice-tray` | The dice as they lie, over the kept shelf and the throw zone. Arrow keys move between the dice. A press keeps a die by choice or releases it. | no | yes |
| 5 | `edit-pool-button` | Reopens the builder. It rides on the cost row. | no | yes |
| 6 | `disclosure-toggle` | Opens the one sheet that holds everything else. It reads More. | yes | yes |
| 7 | `roll-button` | Throws the built pool. One tap. It carries the dice count and the difficulty. | yes | yes |
| 8 | `push-button` | Pushes the roll on the table. One tap. It carries the re-throw count and the stress. | no | yes |
| | | **Controls at rest** | **5** | **5** |
| | | Budget | 8 | 8 |
| | | Hit targets, reported only | 24 | 19 |

**The drawn screen meets the budget.** Five controls at rest A and five at rest B, against a ceiling
of 8. Three controls of the eight are absent in each state, and no state shows all eight at once.

The hit targets of state A are one Done, twelve pool cell ends (six cells, a minus end and a plus
end each), seven difficulty notches, two difficulty step ends, More and Roll.

The hit targets of state B are fifteen dice the player may keep or release, Edit pool, More, Roll
again and Push. A die the rule holds takes no press, because the player cannot release a rule lock.
The drawn screen holds ten of its twenty-five dice by the rule.

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
| Summary | `back-button`, `history-list` | 2 |
| Record | `back-button`, `export-button` | 2 |

`history-list` is a composite. It holds one visit per logged roll, so its length follows the log.
The record holds the transposed matrix — one row per die and one column per generation — and exactly
one export control, in its footer.

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

## 4. Behind the one disclosure

One sheet, opened by `disclosure-toggle`. The override panel and the theme builder live here, as the
plan requires. The sheet is a second surface and carries no share of the budget.

| Control | What it does | Unit |
|---|---|---|
| `sheet-ruleset` | Picks one of the four push profiles. | 4.1 |
| `sheet-overrides` | Every field of the profile record: the success lock, the per-type bane locks, the push limit, the cost source, the cost unit, the amount per unit, the stress behaviour, and the blockers. | 4.2 |
| `sheet-mode` | Pool dice or step dice. A switch discards the built pool. | 2.1 |
| `sheet-artifact-curve` | Escalating or flat. | 4.1 |
| `sheet-theme` | Three axes — surface, accent and dice material — plus the colour builder. | 4.8 |
| `sheet-history` | Opens the history destination. The log, its statistics and its export live there, not here. | 4.4 to 4.7 |
| `sheet-stress-reset` | Sets the stress counter back to zero. | 2.1 |
| `sheet-close` | Closes the sheet and returns focus to `disclosure-toggle`. | 2.1 |

The mode switch sits here on purpose. It destroys the built pool, so it must not sit one tap away
from the throw.

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
none, d8, d10, d12, d12+d8, d12+d10, d12+d12 — which gives a size and a count from one value, in the
manner of `STEP_LADDER`. The stress tile **is** the stress counter, because the counter and the
number of stress dice are the same number, which is why `nextStressId` reads the counter for its
ordinal. In step mode the attribute tile and the skill tile merge into one ladder tile that reads
`d10 + d8`, so the bar shrinks to five tiles and the count falls again.

## 6. The keyboard order

The DOM order is the visual order at all three widths: the header, then the middle, then the footer.
The header holds no stop. The middle holds the builder in state A and the two tray zones in state B.

Unit 4.11 asserts the list below, so the list is derived and never estimated. It is a walk of the
DOM of `docs/design/0013-screen-final.html` in document order, with section 2 as the counting rule.
An earlier note in `0012-settled-decisions.md` predicted 41 visits from the eight-die structure. That
prediction is withdrawn. This walk reaches the same grand total by coincidence and splits it
differently: 11 and 30, where the prediction split 10 and 31.

The drawn pool is five attribute dice, five skill dice, three gear dice, no artifact die, two bonus
dice and ten stress dice. That is 25 dice, which is the ceiling Decision 1 fixes.

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

**After the throw — thirty visits.** The state is rest B: the builder is collapsed and 25 dice lie
in the two zones. Tab reaches items 1, 27, 28, 29 and 30. The arrow keys reach items 2 to 26 inside
the tray. The kept shelf comes first and the throw zone second, and pool order holds inside each
zone.

1. `dice-tray`
2. `die-at1`
3. `die-at3`
4. `die-at4`
5. `die-sk1`
6. `die-sk3`
7. `die-sk4`
8. `die-ge1`
9. `die-ge2`
10. `die-bo2`
11. `die-st1`
12. `die-st3`
13. `die-st5`
14. `die-st7`
15. `die-at2`
16. `die-at5`
17. `die-sk2`
18. `die-sk5`
19. `die-ge3`
20. `die-bo1`
21. `die-st2`
22. `die-st4`
23. `die-st6`
24. `die-st8`
25. `die-st9`
26. `die-st10`
27. `edit-pool-button` — Enter here reopens the builder and returns the order to the first list
28. `disclosure-toggle`
29. `roll-button`
30. `push-button` — Enter here pushes

**Eleven visits before the throw, thirty after it, forty-one in all.**

Items 2 to 14 are the kept shelf and items 15 to 26 are the throw zone. Thirteen and twelve. The
split is the only place the tray departs from pool order, and that split is the push decision the
player is reading.

The tray holds one cell per die, so its length follows the pool. The test therefore fixes the pool
and counts the cells against the pool size, which gives a denominator that can fail. The shelf count
and the zone count must sum to the pool size, so a die lost between the zones fails the sum.

A tab stop inside a composite widget is the cell that carries `tabindex="0"`. A test asserts the
container by walking up from the focused element, so a change of the active cell does not break the
order.

## 7. What the interface units inherit from this unit

- **Shape carries every meaning that colour carries.** A success is a circle and a bane is a
  triangle, on the die, in the matrix and in the status line. A badge number on a die is the success
  count of that die, so an artifact die worth two successes reads correctly. The three lock states
  differ by ground and by frame, never by hue alone: a rule lock has a solid frame on a shaded pad,
  a choice lock has a dashed frame, and a loose die is lifted and carries no pad.
- **Every colour is a role, not a hue.** The drawn screen names every colour as a role variable in
  `:root`, grouped into the three axes of Unit 4.8: surface, accent and dice material. A theme is a
  variable set. No rule in the stylesheet reads a hue, so the three axes stay independent. The
  stress dice differ by material only.
- **The cost of the push is read from `previewPush`, never recomputed.** The cost row prints the
  re-throw count and the complication warning, and `push-button` prints the re-throw count and the
  stress. The drawn screen shows the third profile, where the price of a push is a stress rise.
  Under the first profile the same line prints rating points, and under the second it prints one
  referee point.
- **The matrix is transposed and rectangular.** The record holds one row per die and one column per
  generation, which is Decision 3. A die that locked early shows a dot for every later generation. A
  die added mid-roll is blank for every generation before it existed. Twenty-five rows scroll on a
  phone. Twenty-five columns do not.
- **Touch targets are at least 44 px, and the buttons are 50 px tall.** The pool cell ends are 44 px
  wide and full tile height, and the whole tile is the drag surface. The seven difficulty notches
  are the one exception at 39 px wide, measured at 360 px in the drawn file. They clear the 24 px
  floor. Seven 44 px notches need more width than the card gives. Decision 5 records the trade.
- **The footer is a grid row and never an overlay.** The middle area scrolls and the footer does not
  move, so the push stays one tap away at every scroll position. At 360 px by 760 px the middle does
  not scroll at all. At 360 px by 660 px it scrolls and loses nothing. Decision 6 holds both
  measurements.
- **Motion respects `prefers-reduced-motion`.** The shake at Unit 2.2 becomes a cut when the setting
  is on.
- **The roll result reaches a live region.** The status line is the live region, and it names the
  successes, the banes, the dice count and the stress.

## 8. The state the drawn screen draws

The drawn screen is filled with a real result, not with placeholder text, so the owner judges real
density. It draws the ceiling, because the ceiling is the case that fails first.

- Rule set: pool, stress dice and complications.
- The pool: five attribute dice, five skill dice, three gear dice, no artifact die and two bonus
  dice. Ten stress dice join them, so the tray holds 25.
- Difficulty 0, so the next roll takes no dice away and adds none.
- One push has already landed. The status line reads six successes, four banes, 25 dice, stress 10
  and push 1. The stress reading is at its cap and is marked.
- The kept shelf holds thirteen dice: ten the rule holds and three the player chose to keep. The
  throw zone holds twelve. Every count in the two bands is the length of the list under it.
- The next push would throw those twelve dice, and a complication check is due.
- The builder pane draws the same screen after `Edit pool`. The pool cells sit at their caps, so the
  cap labels are drawn where they are hardest to fit.
- The history record draws a different roll: yesterday at 21:07, 25 dice, nine successes, six banes
  and two pushes. Its matrix draws all three generations and the dots of the dice that locked early.
