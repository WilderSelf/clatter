# 0012 — Settled decisions

This document records owner decisions for Unit 2.0 as they land. Each decision holds a date. No later unit may reopen a settled question. Where an earlier draft contradicts a settled decision, this record is the authority.

---

## Decision 1 — pool maximum, settled 2026-08-09

The tray holds **25 dice**.

The pool holds **15 dice**. This sum comes from four sources: an attribute of at most 5, a skill of at most 5, a gear bonus of at most 3, and one applicable bonus of 2. The composition is:

- Attribute: 5
- Skill: 5
- Gear: 3
- Bonus: 2
- **Total pool: 15**

Stress dice number **10 maximum**. The stress counter caps at 10. One stress point yields one stress die on the tray.

The tray sum is 15 pool plus 10 stress. Every later interface unit measures against this 25-die ceiling.

The approved mock draws 8 dice. It no longer meets the requirement.

Five layout options are drawn at `docs/design/0010-tray-25-option-a.html` through `docs/design/0010-tray-25-option-e.html`. Two renders accompany each option, at 360 px and at 1440 px. Ten renders total are drawn. The measurements and the renders are the record. Do not retype them into prose.

Layout choice among the five options is still open.

### Amendment — the tray has no ceiling, and the draw target is 30, taken by the owner 2026-08-09

**The statement above is kept as it was written. It is wrong in two ways, and both were measured.**

**1. The composition omitted the artifact ladder and the difficulty.** The pool of 15 counts the
attribute, skill, gear and bonus tiles alone. The artifact tile is a seventh source: its ladder in
`src/shell/state.ts` ends at a rating of 6, which is `d12 + d12`, so it puts two more dice on the
table. The difficulty is an eighth: a modifier of +3 adds three bonus dice on top of the bonus tile.
The largest first roll therefore holds 27 dice at difficulty 0 and **30 dice at +3**, with no push at
all. `worstCaseState` in `src/shell/state.ts` derives that number, and
`src/shell/drawn-screen.test.ts` counts the drawn screen against it. Neither the number nor its
arithmetic is written down anywhere else.

**2. The tray has no ceiling at all.** Unit 2.2 found a 26th die. The cause is wider than one die.
The third profile, `pool-stress-and-complications`, holds `maxPushes` at `Number.MAX_SAFE_INTEGER`
and adds one stress die before every re-throw. The only stop is the `stressOneShowing` blocker, and a
sequence that never rolls a stress bane never meets it. **The stress counter caps at 10, where it
lives in `pushNow`. The tray does not.** A walk with an adversarial source reached 230 dice and was
still rising when a 200-push safety stop ended it.

**The owner's decision.** The tray is **drawn for 30 dice**, which is the largest first roll the
shipped interface can produce. Past 30 the tray scrolls, which Decision 6 already settles: the middle
degrades by scrolling and never by clipping. No rule changes. The third profile keeps its unbounded
push. **30 is a draw target and not a ceiling**, and no later unit may read it as one.

**The tail, with fair dice.** Measured by
`npx vitest run src/shell/state.test.ts --disable-console-intercept`, which prints it from 20 seeds
by 500 rolls of the largest pool under the third profile: p50 30, p90 31, p99 32, p99.9 34, and a
maximum of 36. The median rests at the target because ten stress dice show a bane about five throws
in six, which blocks the first push. The figures are reported and never gated. Re-run the command
rather than trusting this line.

---

## Decision 2 — header is status, not navigation, settled 2026-08-09

The header carries status. It never navigates. The owner rejected a header of phase tabs.

### The reasoning

A tab bar promises two things: the player chooses where to go, and the choice holds. An application that moves the selection on its own breaks this promise. A control that moves automatically reads as a progress indicator dressed as a tab.

Navigation may follow a tap. It must not follow a background event.

The push is an action and not a place. The footer already holds a push button. A push tab beside a push button gives one thing two affordances. Choose one.

Building the pool and reading the table are one screen at two times, not two separate destinations. The player enters the screen to build a pool. The screen then shows a table of the roll. The same screen serves both moments.

**The deciding reason.** The push decision needs three pieces at once: the kept dice, the loose dice and the cost. Any shell that puts them on separate tabs separates the decision from its evidence. This application exists to hold all three in view at the same moment. That simultaneity is the purpose.

A tab with nothing behind it before the first roll is a dead affordance.

### What the header carries

- Successes
- Banes
- Dice count
- Stress value
- Push count

**The header never moves.**

### What is still open

- The middle area of the screen
- The collapse behaviour of the pool builder
- The footer
- The overall shell architecture

---

## Decision 3 — history is a separate destination, settled 2026-08-09

The history is not a peer of the roll flow. The player visits it rarely and never in the middle of a decision.

History holds two views.

**View 1: Summary.** A list of past rolls. Each row holds enough detail to find one roll. The player can choose a roll from this list.

**View 2: Record.** Full statistics for one selected roll. An export control sits here.

### The consequence

The die matrix holds one column per die. At 25 dice it needs 780 pixels of minimum content width. A phone screen offers 300 pixels. The matrix overflows by 480 pixels. **The matrix transposes in the record view.**

Instead of one row per generation and one column per die, the matrix becomes one row per die and one column per generation. Twenty-five rows scroll vertically. A phone scrolls vertically natively. Twenty-five columns do not.

**Note, 2026-08-09.** The two figures above were measured at the 25-die tray this document then held. The draw target is now 30, and a pushed roll under the third profile holds more still. The untransposed matrix needs one column per die, so its width grows with the tray while the phone does not, and the overflow the paragraph above measures only gets worse. The transposition is what carries that growth, which is why it was the right shape to choose. Read the row count as the die count of the roll, never as 25.

This layout gives the export control from Unit 4.5 its home. The control had been waiting on this gate.

### Open questions

- The layout choice among options A to E (shared with Decision 1).
- The keyboard order. `docs/design/0002-screen-design.md` section 6 fixes 23 named visits over a pool of seven dice. At 25 dice the count becomes 41. Unit 4.11 asserts that list. The number settles with the layout.
- **Conflict: unresolved.** If a layout orders the tray by lock state, section 6 says the tray visits the dice in pool order. The two disagree. This conflict remains open for Unit 2.1 or a later unit to resolve.

---

## Decision 4 — the tray layout, settled by the owner 2026-08-09

The owner chose **option C**. The tray is the **kept shelf** and the **throw zone**. The shelf holds every die that stays on the table. The zone holds every die the push throws again. **Pool order holds inside each zone.**

The screen that joins this tray to the settled shell is drawn at `docs/design/0013-screen-final.html`. Thirteen renders sit beside it. That file is the source of truth for every later interface unit.

### What this closes

**The open layout question of Decision 1 is closed.** Options A, B, D and E are rejected. Option C is the layout.

**The conflict Decision 3 named is resolved.** Decision 3 said that a tray ordered by lock state disagrees with section 6 of `docs/design/0002-screen-design.md`, which visits the dice in pool order. Pool order inside each zone resolves it, and here is how. The lock state chooses the zone and nothing else. Inside a zone the dice keep their pool order, so no die moves relative to another die of the same type. The zone boundary is the only place the tray departs from pool order, and that boundary **is** the push decision the player is reading. Section 6 keeps its rule, applied once per zone: the shelf first, then the zone.

**The keyboard order is re-derived, not scaled.** Decision 3 predicted 41 named visits at 25 dice. That prediction came from the earlier structure and is withdrawn. Section 6 of `0002-screen-design.md` now walks the drawn DOM and states two lists with their totals and the state each list holds in. The grand total is the same by coincidence. The split is not.

---

## Decision 5 — six interface decisions, delegated by the owner and taken by me, 2026-08-09

The owner delegated these six. Each holds its reason.

**1. The pool chip is removed after a roll.** Measurement showed that a one-line chip still overflowed. Shortening it did not clear the overflow. Only removal did. The tray takes the whole middle after a roll, and `Edit pool` brings the builder back.

**2. The difficulty rides on the `Roll again` button.** The push cost already rides on the `Push` button, so the modifier travels with the action it modifies. This also avoids an edit to Decision 2, which settled what the header carries. A settled decision stays settled.

**3. `Edit pool` sits on the cost row.** That row already existed, so the control costs no height. The 44 px button sets the row height and the old text padding pays for it.

**4. Every touch target under 24 pixels is gone.** The pool cell minus and plus ends went from 22 pixels wide to 44. The phone builder holds two columns instead of three to buy that room, and it scrolls. A builder is a form, and forms scroll. The seven difficulty notches are the one target under the 44 pixel goal. They stay at 39 pixels wide, measured at 360 px in the drawn file, which clears the 24 pixel floor. Seven 44 pixel notches need more width than the card gives.

**5. The record detail carries one export control.** It sits in the footer of the record. One roll, one export, one place.

**6. The footer respects the safe-area inset.** It reserves `env(safe-area-inset-bottom)`, so its buttons clear a phone gesture bar. The drawn phone frames force the inset and draw the gesture bar inside it, so a render on a machine with no notch still shows the clearance.

---

## Decision 6 — the browser tab scrolls and the installed application does not, settled 2026-08-09

### The measurement

Both readings come from the roll flow of `docs/design/0013-screen-final.html`, with the builder collapsed.

| Height | Case | The middle area | `scrollHeight` | `clientHeight` |
|---|---|---|---|---|
| 360 by 760 | the installed application | does not scroll | 556 | 556 |
| 360 by 660 | a browser tab | scrolls | 553 | 456 |

At both heights the header, the cost row and the `Push` button stay in view, and the kept shelf is visible at rest. **No content is lost at 660.** It is reached by scrolling.

### The reasoning

Shrinking the die is the only change that makes the browser tab fit without scrolling. It would also shrink the die in the installed application, which loses nothing today. The manifest exists to serve the installed case. **The primary case is not paid to rescue the secondary one.** So the die keeps its size and the browser tab scrolls.

`.shell-m` carries `overflow-y: auto`. The layout therefore degrades by scrolling and never by clipping. A screen that does not fit gives the player a scroll, not a lost button.

### Re-measured at 30 dice, 2026-08-09

**The table above holds at 25 dice and is kept. At the draw target the amendment to Decision 1 sets, both heights scroll.** The reading below comes from the same file at the same two window heights, with the tray holding 30 dice in the tallest split the target allows: nine dice on the shelf and twenty-one in the zone, which is seven rows of five at 360 px.

| Height | Case | The middle area | `scrollHeight` | `clientHeight` |
|---|---|---|---|---|
| 360 by 760 | the installed application | scrolls | 628 | 556 |
| 360 by 660 | a browser tab | scrolls | 628 | 456 |

At both heights the header, the cost row and the `Push` button stay in view, and the whole kept shelf is visible at rest. The die keeps its 46 px size. **No content is lost at either height.** It is reached by scrolling.

**The reasoning above is unchanged and its conclusion now covers both cases.** Shrinking the die is still the only change that would remove the scroll, and it would still pay the installed application to rescue a case that loses nothing.

What moved is the row count, not the die. A tray of 25 dice fell in six rows. A tray of 30 dice falls in seven rows for every split except the one that fills every row, and `src/shell/drawn-screen.test.ts` holds the drawing at the tallest split, so no later measurement reads the easy case.

---

## Decision 7 — step mode holds one ladder tile, not two size pickers, taken by me 2026-08-09

The plan asks Unit 2.1 for **two size pickers** in step mode. The screen holds **one ladder tile**
instead, and section 5 of `docs/design/0002-screen-design.md` draws it that way. I took this
decision. The owner delegated the interface and this is a consequence of the rules model, not of
taste.

### The reason

`STEP_LADDER` is an enumerated progression of eight states, and `src/rules/pool.ts` says why in its
own words: a rule that steps the lower die up and the higher die down is path-dependent, so `+2`
then `−1` does not reliably equal `+1`. An index offset makes reversibility true by construction.

Two independently stepped sizes are exactly that path-dependent pair. A screen that offered them
would have to answer questions the ladder does not hold — a d10 beside a d6, for one — so it would
reimplement the ladder in the interface, and the core would stop being the one authority on the
progression.

**One tile therefore steps the index.** It prints both sizes, as `d10 + d8`, so the player reads the
pair the ladder names. The difficulty steps the same index, which is why the preview sentence can
name the pair the next roll will take.

### Why this is a decision and not a defect

The plan states its own method as the intended approach and not as a fixed instruction. The purpose,
the end state and the constraints hold. This changes the method, and it keeps every one of them.

The bar shrinks to five tiles in step mode, and the control count falls with it. The budget in
section 3 of the screen design is a ceiling, so a smaller count meets it.

### Overruled by the owner, 2026-08-09

**The decision above is kept as it was written. The owner overruled it on 2026-08-09, after a check
against the reference.** The screen holds **two size tiles** in step mode, one for the attribute and
one for the skill, and the bar holds six tiles in both modes.

**The reason is the rules model, not taste.** The reference rates the attribute and the skill on two
independent scales, and each rating names its own die size. The eight-state list paired the two, so
it could express eight of the sixteen pairs. A large attribute beside a small skill was unreachable,
and the reference permits it. The list also tied "no skill die" to a d6 attribute, and the reference
treats absence as independent of the size.

**What the reason above got right is kept.** A rule that steps one die up and the other down as it
goes is path-dependent, and `+2` then `−1` would not reliably equal `+1`. The model now stores the
base pair and stores the difficulty as one integer, and it computes the rolled sizes from the two.
Reversibility stays true by construction, and it now holds where a size clamps as well.
`specs/0001-rules-model.md` states the model and the split table.

**The owner's words on the screen:** everything on the edit pool screen is the same in step mode as
in pool mode, except that the player chooses die sizes instead of counts. Gear, bonus and stress keep
their counts. The artifact tile keeps its ladder, which is unchanged.

---

## Decision 8 — the sheet holds a ninth control, the renderer toggle, taken by me 2026-08-09

The disclosure sheet holds a ninth control, `sheet-tray-renderer`. It rolls the dice on the table or
draws them flat, and it clears a permanent fall to flat dice. Section 4 of
`docs/design/0002-screen-design.md` now lists it against Unit 3.7. I took this decision under the
delegated interface authority of `CLAUDE.md`.

### The reason

The plan asks Unit 3.7 for a settings toggle back. A fall to flat dice is permanent by design, so a
player whose browser lost one WebGL context keeps flat dice for ever with no way to ask again. The
toggle is the only way back, and it has to live somewhere the player can find.

### Why it costs the budget nothing

Section 3 sets a ceiling of **8 controls at rest** and counts the controls visible by default. The
sheet is a second surface and carries no share of that budget, exactly as the history destination
does. Section 4 already held eight controls behind the disclosure and none of them counts against
section 3. The screen still shows five controls at rest A and five at rest B.

### What did not change, checked and not assumed

**Section 6 is unchanged.** Both keyboard walks are lists of the main screen, and neither one names
a `sheet-` control. The counts stay eleven visits before the throw and thirty-five after it, and
both instruments read those lists out of the document rather than restating them.

**The notice is not a control.** The fall to flat dice is announced by `flat-fallback-note`, which
carries `role="status"`, holds no tab stop and takes no press. Section 3 lists it under the
read-only parts, where the status line and the cost row already sit.

### What the toggle refuses

A platform below the bar cannot draw the table whatever the record says, so the control is dead
there and its note names every reading that failed. `chooseRenderer` in `src/shell/renderer.ts`
reads the platform before the record for that reason.

---

## Decision 9 — the die cells lie over the 3D table, taken by me 2026-08-09

A canvas has no children a keyboard can reach. The 3D dice are drawn inside one canvas, so section 6
of `docs/design/0002-screen-design.md` has nowhere to put the thirty visits it names for the dice,
and `aria-pressed` has nothing to sit on.

**The die cells are real DOM in both renderers.** With the 3D table running, the same cells lie over
the canvas, one on each die, at the place the tray put that die. A cell over the table draws no die
of its own. It carries the role, the accessible name, the pressed state, its place in the roving tab
index and the focus ring, and nothing else. I took this decision under the delegated interface
authority of `CLAUDE.md`.

### The four reasons

**One list, not two.** Section 6 states one walk after the throw. A renderer that carried its own
walk would need a second list, and two lists drift. The cells are the same elements in both
renderers, so the jsdom walk and the driven-browser walk read one list out of the document and both
hold whichever renderer is running.

**The player reads the 3D dice, never a copy.** A cell over the table renders no face, no badge and
no caption. A flat die drawn on top of a 3D die would show the result twice and the two could
disagree.

**A pointer press stays a press on the die itself.** The cells take no pointer at all, so a click
falls through to the canvas, where `src/tray/affordance.ts` hit-tests it against the dice. That is
the route Unit 3.5 built and measured: a rule lock refuses the press there, and a die the camera
cannot see cannot be aimed at.

**The focus is visible.** A keyboard ring drawn round a transparent cell is a ring round the die
itself, so a player who walks the tray with the arrow keys sees which die is in focus on the table.

### What follows from it, and what does not

- **`dice-tray` is still ONE control**, with one roving tab index over the shelf and then the zone,
  which is section 2 and Decision 4 unchanged.
- **The two zone bands stay.** They print the kept count and the re-throw count on a chip of the
  interface colours, because the tray surface is a theme axis of its own and the interface ink is
  not measured against it.
- **The three lock states are drawn on the dice**, by the marks of Unit 3.5, and not on the cells.
- **The shake belongs to the flat renderer.** A 3D die tumbles, so the cell over it does not shake.
- **No control was added and none was taken away**, so the budget of section 3 is untouched.

### The limits, measured and not hidden

**A buried die has no pointer route.** A player who cannot see a die cannot aim at one, and a click
that reached through the heap would toggle a die the player never meant. The key press reaches every
die, so no die is out of reach. `node scripts/browser.mjs --table` counts the dice the raycast can
reach and the dice it cannot, and it fails unless the two sum to the pool.

**The dice heap and no layout stops that.** The library builds a die at a fixed world size and
throws every die from one place, so a table of thirty dice on a phone puts dice on each other. The
throw is not spread to fix it: spreading it moves `steps_to_rest_fixed_seed_scene` and the pinned
scene digest in `budgets.json`, which is a budget conversation and not a free change.

---

## Decision 10 — a change of rules clears the table, taken by me 2026-08-10

**A change of the rule set, of any override, or of the artifact curve clears the roll on the table
and returns the screen to rest A.** The built pool, the difficulty and the stress counter all stay.
Only the dice go. I took this decision under the delegated interface authority of `CLAUDE.md`, and
Units 4.1 and 4.2 build it.

### The reason

The push is the decision this application exists to serve, and key task 5 states how it is served:
the cost is visible **before** the player commits to the push. A roll on the table was therefore
committed to at a price that was read under one profile. New rules change that price, which dice the
table keeps, and which dice a push would throw again. Re-reading a committed roll under rules it was
never thrown under is the hazard, and it is the same hazard Unit 4.7 closed in the statistics, where
the code reads the stored derived values and re-derives none.

**Two alternatives were priced and rejected.**

1. **Price the roll again under the new rules.** A die moves from the kept shelf to the throw zone
   under the player's hand, and the cost row prints a price for a roll nobody threw at that price.
   This is the hazard itself.
2. **Keep the old profile alive for the roll on the table, and use the new one from the next throw.**
   The screen then runs two rule sets at once. The sheet states one and the table obeys the other,
   and every reader of a profile — the cost row, the two zones, the marks on the 3D dice, the log
   entry a roll will write — has to know which of the two it is holding. One screen, one rule set.

**The precedent is already in the model.** `specs/0001-rules-model.md` says that a change of mode
discards the built pool, so no agent invents a conversion. This is the smaller version of the same
rule: a change of rules discards what the old rules produced, and it keeps what they did not touch.

**An empty table belongs to rest A.** Section 1 of `docs/design/0002-screen-design.md` names two rest
states, and a collapsed builder over an empty table is neither of them. The builder therefore opens
again, which is also the state the player needs, because the next thing to do is throw.

### The artifact curve is in the same rule, and here is why it belongs there

The curve changes what an artifact die is **worth**. It does not change whether a die locks: both
curves pay from a face of six upwards, so `score(die) > 0` reads the same under either one.
`src/rules/success.test.ts` asserts that over every face of every artifact size, which is what lets
`lockState` read the die's own default curve while the screen reads the chosen one. The successes on
the table would still change under the player's hand, so the curve clears the table with the rest.

### How the tray follows

`mountAffordance` in `src/tray/affordance.ts` reads the profile once, when it mounts, because it
answers every click and draws every mark from it. Unit 3.5 recorded that as a limit and named this
unit as the one that would meet it.

**The affordance is disposed and mounted again under the profile in force.** The canvas, the scene,
the physics world and the dice bodies all stay: only the click listener and the marks are rebuilt.
Nothing of the 3D chunk is fetched again and no context is lost. Because the table is cleared by the
same change, the new affordance opens over an empty pool, so no mark of the old rules survives it.

### What is checked, and where

| The claim | The instrument |
|---|---|
| The table is cleared and the screen is back at rest A | `src/app.test.tsx`, and `node scripts/browser.mjs --sheet` in a real browser |
| The rules reach the core | `src/app.test.tsx`, with the rules core as the oracle |
| The tray marks follow the rules now in force | `src/app.test.tsx`, over the tray the application mounts |
| Both curves agree about a lock | `src/rules/success.test.ts`, over every artifact face |

---

## Decision 11 — the saved pools live behind the disclosure, taken by me 2026-08-10

**The saved pool list is `sheet-presets`, a tenth control behind the one disclosure.** It holds a
name field, one save control, and one row per saved pool. Each row carries recall, move up, move
down and delete. Section 4 of `docs/design/0002-screen-design.md` lists it against Unit 4.3. I took
this decision under the delegated interface authority of `CLAUDE.md`.

The question was open. Section 4 listed no pool preset list, and section 3 spends five of its eight
controls at each rest state, so a tenth control in the builder was affordable by the budget alone.
The budget was not the deciding reason. Three others were.

### The three reasons

**1. A recall writes over every tile of the built pool.** That is the hazard `sheet-mode` was put
behind the disclosure for: a control that destroys the built pool must not sit one tap away from the
throw. A recall is the same class of act. The paragraph under the section 4 table already states the
rule, and this control obeys it.

**2. The drawn screen is the owner's, and a control in the builder rewrites it.**
`docs/design/0013-screen-final.html` is the artifact the owner approved at Unit 2.0, and
`src/shell/drawn-screen.test.ts` holds every later unit against it. A control in the builder would
change the drawn builder pane, the rest A keyboard walk of section 6, and the counts both
instruments read out of that section. The sheet is a second surface: it holds no share of the
control budget, and neither keyboard walk names a `sheet-` control at all.

**3. Saving is rare and building is constant.** The player builds a pool at every throw and saves
one a few times a campaign. The builder is the tightest part of the screen at 360 px, where it
already holds two columns and scrolls. A rare act does not buy space from a constant one.

### What this costs, counted rather than claimed

**Section 3 is untouched. Five controls at rest A and five at rest B, against a ceiling of 8.** The
inventory of section 3 still lists eight controls and `src/app.test.tsx` still counts them, control
by control, at both rest states. A second check asserts that no element of the preset list is on the
screen at either rest state until the disclosure is open, so the decision is measured and not
asserted.

**Section 6 is unchanged, and both instruments say so.** Eleven visits before the throw and
thirty-five after it. Neither walk names a `sheet-` control, and both read their lists out of the
design document.

### The three rules the list obeys

**A recall opens the builder and closes the sheet.** The player must see the pool that arrived, and
the pool bar is where it lands. The status line is a live region and it names the new throw, so the
recall reaches a screen reader as well.

**A recall does not clear the table.** Decision 10 clears the table on a change of rules, because a
roll was committed to at a price the rules set. A pool is not a rule: it decides what the NEXT throw
takes and it prices no roll already thrown. This is the same rule the pool tiles obey today, where a
press on a tile over an open builder leaves the dice where they lie.

**Step mode draws no control.** A saved pool holds counts, and step mode holds two rated die sizes
plus the extras. The storage half of Unit 4.3 saves no step pool and its ledger row says why, so the
panel draws one sentence there and no control. A panel that saved the counts in step mode would
save a pool the screen was not showing.

### What a refusal does

**A refusal is a message that names its cause, and never a control that went dim.** The four
refusals the store answers — an empty name, a name over the cap, the preset limit, and no such
preset — each reach the player as one sentence in a live region inside the panel. No control is
disabled to prevent a refusal, because a disabled control names nothing and would put both caps out
of reach of the interface. The two move controls are the one exception: the first row cannot move up
and the last cannot move down, which is a position and not a refusal.

---

## Decision 12 — the history replaces the roll flow, taken by me 2026-08-10

**`sheet-history` opens a route, not a panel. The history destination replaces the roll flow while
it is open, and `back-button` brings the roll flow back.** I took this decision under the delegated
interface authority of `CLAUDE.md`. Unit 4.4 builds it.

Decision 3 already settles that the history is a separate destination with two views. It does not
say how the destination shares the screen with the roll flow, and there were two ways to build it.

**Rejected: an overlay, like the disclosure sheet.** The sheet is a panel over a screen the player
is still in the middle of. The history is the opposite: Decision 3 states that the player visits it
rarely and never in the middle of a decision. An overlay also puts every control of section 3 in the
document underneath it, so a keyboard reaches the roll flow through the history and both walks of
section 6 grow.

**Taken: a route.** The roll flow leaves the document. Three things follow, and each one is
measured rather than claimed.

- **Section 3 is untouched.** The destination carries its own header and its own footer, exactly as
  the section 3 subsection "The history is a separate destination" says, and it holds no control of
  the roll flow.
- **Section 6 is untouched.** Both walks are walks of the roll flow at rest. The history is closed
  at rest, and while it is open the roll flow holds no element at all. Eleven visits before the
  throw and thirty-five after it, in both instruments.
- **The focus never lands on nothing.** The destination takes the focus on `back-button` when it
  opens, and again when a record opens or closes. `back-button` returns the focus to
  `disclosure-toggle`, which is the control that led there.

### The record view is a shell in this unit

The summary is complete: `back-button` and `history-list`, one visit per logged roll. The record
draws the stored readings of one roll and nothing else. **The transposed matrix and `export-button`
belong to Unit 4.5**, and `LEDGER.md` row 2.2d carries the two matrix acceptances there unchanged.
A record with no view at all would have left `history-list` opening nothing, so the shell exists to
make the summary judgeable.

### The storage reading is read-only

`sheet-storage-estimate` sits beside `sheet-history` in the sheet and prints what
`navigator.storage.estimate()` answers. It holds no tab stop, so it is one of the read-only parts of
section 3, and it is a live region because the number arrives after the sheet is drawn.

---

## Decision 13 — the import control sits in the summary, and the export writes the whole log, taken by me 2026-08-10

**`import-button` goes in the footer of the history summary. `export-button` goes in the footer of
the record, where Decision 3 already put it, and the file it writes holds every roll of the log.** I
took this decision under the delegated interface authority of `CLAUDE.md`. Unit 4.5 builds the
export and Unit 4.6 the import.

### The import had no home, and there were two

Decision 3 gives the history two views and names the controls of each. Neither list holds an import.
The plan gives Unit 4.6 a file picker and says nothing about where it stands.

**Rejected: the record footer, beside the export.** The record is one roll. An import replaces the
whole log, so a control that destroys 5,000 rolls would sit inside a view of one of them, and the
record would then hold three controls where section 3 names two.

**Rejected: the disclosure sheet, beside `sheet-history`.** Section 4 already says of that row that
"the log, its statistics and its export live there, not here". An import is the same kind of thing
as an export, so the same sentence sends it to the destination.

**Taken: the summary footer.** The summary is the view of the whole log, and the whole log is what
an import replaces. It is also the view an empty log shows, which is the state a player imports
from. The summary therefore counts three controls, and section 3 says so.

### The picker is not a fourth control

`import-button` opens a hidden `input type="file"`. The input carries `tabindex="-1"` and
`aria-hidden`, so a keyboard never lands on it and the summary walk stays at three stops. It is
taken off the screen by clipping rather than by `display: none`, because a browser may refuse a
scripted click on a control that is not rendered at all.

### The export writes the log, not the roll

Decision 3 says "full statistics for one selected roll. An export control sits here", which fixes
WHERE the control is and not WHAT it writes. Two things settle what it writes, and neither is a
preference:

- Unit 4.6 settled that an import REPLACES the log and never merges. A file of one roll, read back,
  would delete every other roll of the campaign.
- The plan's own verification step 6 reads: roll fifty times, export, pivot in a spreadsheet,
  re-import, and confirm the log is unchanged. Only a whole-log file passes that.

The button says so. It prints the roll count of the log it will write, so a player reads what the
press does before pressing it.

### The size of a file is judged before the file is read

`src/log/import-file.ts` refuses a file over `MAX_IMPORT_BYTES` from `File.size` alone, and never
calls `text()` on it. `MAX_IMPORT_CHARS` in `src/log/csv.ts` is the second gate, over the text. The
byte cap is the same number as the character cap and is not a second budget: UTF-8 never spends
fewer bytes than the string spends UTF-16 code units, so a file inside the byte cap is always inside
the character cap.

**A full-buffer export nearly fills both.** `LEDGER.md` carries the arithmetic and hands the choice
to the owner. Nothing here raises a cap.

---

## Decision 14 — the statistics are a third view of the history destination, taken by me 2026-08-10

**The charts over the log live in their own view of the history destination. `statistics-button`
sits in the summary footer and opens it, and `back-button` returns to the summary.** I took this
decision under the delegated interface authority of `CLAUDE.md`. Unit 4.7 builds it.

Section 4 of `docs/design/0002-screen-design.md` already fixes WHERE the statistics live: the
`sheet-history` row reads "the log, its statistics and its export live there, not here". It does not
say which part of the destination holds them, and there were two ways to build it.

**Rejected: a section of the summary.** The summary is the list of every roll, and a player opens it
to find one roll. Charts above the list push the list itself off a 360 px screen, and charts below
the list are unreachable until the player has scrolled past a campaign. Unit 4.5 already met that
failure once: its matrix drew below the fold at 360 px with every check green, and the capture is
what found it. A section would also grow the summary's own scroll for a reading the player asked for
only sometimes.

**Taken: a third view.** The charts get the whole middle of the destination at every width, and the
summary keeps its list at the top of the screen where a player looks for it.

### Why the control sits in the summary footer

The record is one roll. The charts are the whole log. An import replaces the whole log and Decision
13 put its control in the summary footer for that reason, so the charts belong beside it. The record
therefore keeps the two controls section 3 names, and the summary counts four.

### The three views are peers, not a stack

`back-button` returns to the summary from the record and from the charts. Neither view opens the
other, so a player never has to remember how deep they are. The statistics view holds that one
control and nothing else, because every mark in it is read-only.

### What the charts draw, and what they do not

The charts draw the three statistics `summariseLog` returns and nothing else: the success rate by
pool size, what the pushes did, and how often pushing paid off. **No chart draws a bane.** The record
holds no bane statistic, so a bane bar would be a number the log never answered.

Each chart is a real table. The values are text in cells that name their row header and their column
header, and the bar beside each value is `aria-hidden` decoration. One document therefore serves a
screen reader and an eye, and the two readings are compared against each other rather than trusted.

Every series carries a shape as well as a colour — a circle, a square or a triangle — so a greyscale
copy still separates the three push outcomes. The circle keeps the meaning it has everywhere else in
this application: it is the good outcome.

---

---

## Decision 15 — the stylesheet spends a palette and holds no colour, taken by me 2026-08-10

`src/shell.css` holds no colour of its own. The role block left `:root`, and `src/theme/css-vars.ts`
is now the one place that says which palette token fills which role. `src/app.tsx` writes those
custom properties on the root element, so a change of a theme axis reaches the whole application at
run time. I took this decision under the delegated interface authority of `CLAUDE.md`.

### Three literals stay, and all three are the same kind of thing

Black at a fraction of one, spent twice as a shadow and once as a scrim. A shadow is the absence of
light rather than a colour of the theme, and a scrim has to darken every palette, including the
light one. `src/theme/css-vars.test.ts` enumerates every colour literal the file still holds,
compares the list against those three, and measures each one to be black and translucent. A fourth
literal turns it red, and a literal that is not black cannot join the list by being written into it.

### The palette grew four tokens, and each one is a literal in every row

`sunken`, `line`, `markSuccess` and `markBane`. The stylesheet paints four grounds and two semantic
marks, and the seven tokens of the data half named neither. Every one of the four is a literal in all
six rows, so a seventh preset is still a seventh row and no resolver derives a colour.

**`line` is not a decoration.** A button, a pool tile and a text field are each told from the page by
their boundary and not by their ground, so the boundary is a graphical object under WCAG 2.2 SC
1.4.11 and it holds 3 to 1 against all three grounds. That is a heavier edge than the drawn screen
carried, and it is the price of the claim.

**The two marks do not follow the theme.** A success is green and a bane is warm in every palette,
so the meaning does not move when the page does. Shape carries the same meaning — a circle and a
triangle — so neither one rides on hue.

### The flat dice take the dice axis, and the stress die loses its material

Every flat die now takes the body colour of its own type, which is what the 3D die has always done.
The drawn screen gave the stress dice a material of their own because every die was one neutral body
then. The six types are a lightness ladder, no two rungs closer than 8 CIE L*, so a greyscale copy
still separates them and colour is still never the only carrier. Section 7 of
`docs/design/0002-screen-design.md` carries the amendment.

### The builder keeps the player's colour, and reports what that costs

`derivePalette` has always kept the chosen colour as the accent, unchanged. `deriveDiceTheme` gains
the same promise behind a control, `theme-exact-dice`: off, the six dice are derived around the
chosen colour and are readable by construction; on, that colour itself goes on the rung nearest its
lightness and `checkDiceTheme` reports whatever that costs.

**The control exists because a check that cannot fail is not a check.** A laddered dice set is
readable by construction — every rung sits at a fixed CIE L*, so the ladder step, the black numeral
and the die against the tray all hold whatever colour arrived. `checkDiceTheme` could therefore
never report anything about a set the builder made, and the claim that its findings reach the player
had no route to be proved on. The exact-dice control gives it one, and it gives the player the same
promise the accent already had.

### A built theme replaces two axes and never the third

The tray surface stays a shipped row. Every surface is dark by construction, and the claim that a die
body holds 3 to 1 against a surface is measured over those six and over no other colour. A built
surface would put that claim outside the range it was proved in.

---

## Decision 16 — the share card lives behind the disclosure, and it names the application only, taken by me 2026-08-10

**`sheet-share` is an eleventh control behind the one disclosure. It makes one card of the roll on
the table, shows it, and offers two ways out: a saved file, and the browser's own share target where
the browser offers one.** Section 4 of `docs/design/0002-screen-design.md` lists it against Unit 4.9.
I took this decision under the delegated interface authority of `CLAUDE.md`.

### Where the control lives, and the two homes it was taken against

**Rejected: the footer of the roll flow.** The footer is the push decision. `roll-button` and
`push-button` are one tap each, and Decision 4 and section 3 keep that footer as tight as the screen
gets. A control that opens a file dialogue or a platform share sheet beside Push is a mispress in the
one place this application must not have one. It would also take rest B from five controls to six,
add a thirty-sixth visit to the after-throw walk of section 6, and rewrite the drawn screen the owner
approved at Unit 2.0.

**Rejected: the footer of the history record, beside `export-button`.** A card is a picture of the
dice **as they lie now**. A logged roll holds its stored readings and no tray, so a card of a record
would be a card of an empty table. The export writes the whole log and the card holds one roll, so
the two are not the same kind of act either.

**Taken: the disclosure sheet.** Three reasons, and the budget is not one of them.

1. **Making a card is rare and pushing is constant.** That is the rule Decision 11 took for the
   saved pools. A rare act does not buy space from a constant one.
2. **The sheet is a second surface.** It carries no share of the control budget of section 3 and
   neither keyboard walk of section 6 names a `sheet-` control, so the screen still shows five
   controls at rest A and five at rest B, and the walks stay at eleven visits and thirty-five.
3. **The refusal the flat renderer meets points at the control above it.** `sheet-tray-renderer`
   sits one row up in the same sheet, so a player told that a card is a picture of the table can see
   the switch that draws one.

### What the card says, and why that is the whole of it

**A card names the application and nothing else about where it came from.** Constraint 1 forbids a
publisher name, a game title, an engine name, a setting term, a reproduced dice colour convention
and the words "compatible with". It forbids a "not affiliated with" line as well, because writing one
requires naming the publisher. A bare application name is the safe answer and it is the one taken.

The card carries the roll and no rule of its own:

- the application name;
- the successes and the banes, which are what the roll was for;
- the dice count, the kept count, the count still in the cup, the stress and the push count.

Every one of those comes from `readout` and `zonesOf` in `src/shell/state.ts`, which ask the rules
core. `src/shell/share-card.test.ts` compares the drawn summary against those two functions over
random rolls, with the five readings enumerated so a missing one is a red and not an unread cell, and
it scans every string a card can hold through the branding gate's own tokeniser and hashes.

### The summary sits on an opaque panel, and that is the contrast claim

Text over a photograph answers to whatever the photograph happens to be, and a photograph of dice on
a table is not a colour anybody chose. The summary is therefore drawn on a filled panel of the
interface palette — `surface` as the ground, `text` and `textMuted` as the ink, `line` as the
boundary — so the claim the card makes is the claim the stylesheet already makes: 4.5 to 1 for text,
over all six interface palettes. The card is drawn and not styled, so that claim is measured on the
drawn pixels of six real cards rather than inherited from Unit 4.8.

The panel goes in the **upper left**. The capture half of this unit recorded that the pool spreads
over the lower half of the frame and leaves about a third of the card empty up there. The summary
fills the space the dice do not use.

### The two ways out, and why the second one may be absent

**Saving the file is the route that always exists.** It is the anchor download Unit 4.5 built, over
the same bytes the composition produced. No second download was written.

**The share target is the browser's, never a service of ours.** Constraint 4 keeps this a static
site: `navigator.share` hands the file to whatever the platform offers and this application makes no
network call. `share-send-button` is drawn only where `navigator.canShare` accepts **this very
file**, so a desktop browser that shares no file simply does not draw it. **That absence is not a
failure.** A check that cannot judge it prints `NOT JUDGED` with the reason and counts itself in
`skipped=`.

### The limit this decision accepts, priced rather than hidden

**A card needs the table.** `captureTrayJpeg` draws one fresh frame through the renderer, so the flat
dice of Unit 3.7 make no card. The panel says so and names the switch. Two alternatives were priced
and rejected: a card of the summary alone would fail the acceptance the plan sets for this unit,
because a panel of flat colour holds neither the luminance variance nor the thousand distinct pixel
values that a picture of dice holds; and drawing the flat dice onto the card a second time would be a
second renderer to keep true. A platform below the bar therefore makes no card, which is one reading
of the plan's own trade: the share card is the first thing effort is traded from.

### A card belongs to the roll it was made from

Any change of the dice — a throw, a push, or a die the player keeps or releases — clears the card and
its preview. A card left standing would be saved under readings the table no longer holds, which is
the hazard Decision 10 closes for the cost row and Unit 4.7 closes for the statistics.

---

## Decision 17 — the sound controls live behind the disclosure, and the volume stays reachable while sound is off, taken by me 2026-08-10

**`sheet-sound` is a twelfth control behind the one disclosure. It holds two controls: a checkbox
that turns the sound on, and a slider that sets the level.** Section 4 of
`docs/design/0002-screen-design.md` lists both against Unit 3.6. I took this decision under the
delegated interface authority of `CLAUDE.md`.

### Where the controls live, and the home taken against

**Rejected: a speaker button in the header.** The header carries status and never navigates, which
is Decision 2. A mute button there is a control, so it would break that rule, take rest A from five
controls to six, and add a twelfth visit to the before-throw walk of section 6.

**Taken: the disclosure sheet, under the renderer toggle.** Three reasons.

1. **The sound is made by the table.** Every voice comes from a collision the physics world
   reported. The flat dice of Unit 3.7 report none, so a player who reads the note under
   `sheet-tray-renderer` and switches the table on is one row above the switch that makes it heard.
2. **A level is set once and a push is taken constantly.** That is the rule Decision 11 took for the
   saved pools and Decision 16 took for the share card.
3. **The sheet is a second surface.** It carries no share of the control budget of section 3 and
   neither keyboard walk of section 6 names a `sheet-` control, so the screen still shows five
   controls at each rest state and the walks stay at eleven visits and thirty-five.

### The volume stays reachable while sound is off

The slider is marked `aria-disabled` while sound is off, and it is **not** disabled. A disabled
control leaves the keyboard order, and a reader would then be unable to find the thing the checkbox
above it is about to switch on. The level a player sets while sound is off is stored and is the level
the first voice plays at.

### The accessible name is written on the slider, not taken from its label

The row holds three things: the word "Volume", the slider, and the level in words. A slider that took
its name from the label around it would be announced as "Volume 25 per cent", and the level would then
be read twice, because `aria-valuetext` already carries it. So `aria-label` on the control says
"Volume" and nothing else, which is the word on the screen as well, and WCAG 2.2 SC 2.5.3 asks for
exactly that. The printed level is marked `aria-hidden`, because it is the same state for an eye.

### The step is one twentieth, and the slider is the full row height

An arrow press moves the level by 0.05. Twenty steps cross the range, which is a level a player can
tell from the one beside it and a few presses from one end to the other. A range input draws itself
about 20 px tall, so it is given the full 44 px row: that is the floor section 7 of the screen design
sets, and it is well over the 24 px of WCAG 2.2 SC 2.5.8. The first draft failed the check that reads
that height, at 20 px.

### A browser with no Web Audio is answered in words

`enable` constructs an `AudioContext`, and a browser without the Web Audio API has none. The failure
lands inside the press that asked for sound, so it is caught and the note under the controls says
"This browser makes no sound. The dice are silent here." **The record is not written in that case.**
A record that promised sound the browser cannot make would greet the next session with a switch that
reads on and a table that is silent.

---

## Decision 18 — the performance overlay is a session switch on the sheet, and it reports rather than gates, taken by me 2026-08-10

**`sheet-overlay` is a thirteenth control behind the one disclosure. It shows a panel of four
readings over the screen: p95 frame duration, p99 frame duration, the long-task total, and
throw-to-first-motion.** Section 4 of `docs/design/0002-screen-design.md` lists it against Unit 3.8.
I took this decision under the delegated interface authority of `CLAUDE.md`.

### The overlay reports. It never gates.

The End state of `CLAUDE.md` splits the performance claims in two. The deterministic gates are
integers, they run in CI, and they read a bound out of `budgets.json`. The timing figures are
**reported, on real hardware**, once per phase, and the owner pastes them into `LEDGER.md`. The
overlay is the second kind. So it reads no budget, it compares no reading against one, it prints no
verdict, and no command in `validate` and no step of CI runs it. A timing figure that gated would
fail on the machine that ran it rather than on the code, which is the reason the split exists.

The panel says so in its own words: "These are readings, not a pass or a fail."

### Every number names its unit and its sample count

The owner reads these figures off a photograph of a phone. A bare number there is ambiguous, so every
line prints the unit and the number of observations behind it: "50.2 ms over 476 frames in a throw".

### A percentile below its floor is refused

A quantile q over n samples names a value that at most n(1-q) samples lie above. Below 1/(1-q)
samples that count is under one, so the "p95" is simply the largest sample and the "p99" is the same
number again. The floor is therefore **derived from the quantile** and is not a taste: 20 frames for
p95 and 100 for p99. Below it the panel prints "too few samples: 4 of 20 frames in a throw" and no
number at all.

### A figure with no source says so by name, and never prints a zero

`PerformanceObserver` with the `longtask` entry type is not offered by every browser, and Firefox is
one that does not offer it. The panel reads "not measured here: this browser reports no long tasks".
A zero would be a measurement and it would be a lie. The same rule covers throw-to-first-motion on
the flat dice, where no table moves.

### The frames are sampled inside a throw and nowhere else

A probe that samples a resting table measures the browser idling. The cost of this application is the
throw: the library simulates the whole tumble in one synchronous block before it draws anything. So a
measurement window opens at the press that threw and closes when the tray reports the table at rest.
A window nothing reports rest for shuts after four seconds, because the flat renderer acts no throw
out and would otherwise fill the samples with idle frames.

### Throw to first motion is bounded by a moved die

The near end is the press itself: the `timeStamp` of the click event, which the browser wrote before
any handler of this application ran. The far end is the first animation frame that draws a die
somewhere **other than where the press left it**, read off the drawn positions of the dice.

**The first frame is not the first motion.** The screen redraws as soon as the player presses — the
builder collapses and the footer changes — and the browser paints that frame before any die moves. A
probe that stopped there would report the redraw and miss the whole stall, which is the number the
plan calls first-class.

### The switch is a session switch and is not stored

Nothing about the overlay reaches the settings record. A stored diagnostic panel would greet a player
who forgot it with a permanent cost and a permanent panel over the dice. The reading belongs to the
sitting it was taken in.

### The panel holds no tab stop and takes no pointer event

It is a named region, so a reader reaches it as a landmark, and it carries no control, so both
keyboard walks of section 6 are the walks they were. It is drawn over the screen rather than inside
the middle region, because the middle scrolls and a reading being photographed must stay beside the
dice it belongs to. It takes no pointer events at all, so it can never swallow a tap on a control
under it.

---

## Decision 19 — one fault banner, four rows, no control, taken by me 2026-08-10

**A failure the player is told about is drawn in ONE surface, at the head of the middle region, on
whatever screen the player is on.** The surface holds one row per SLOT, not one row per failure.
Every row is in the document from the first paint with no text. The surface holds no control, and
each row names the control the player already has.

Unit 4.10 owns this. The failures themselves were all detected before it: `src/log/store.ts`
answers four refusals by name, `src/log/import-file.ts` answers twelve, and `src/shell/renderer.ts`
answers three causes for flat dice. What was missing was what the player is TOLD, and what the
player can do next.

### The four slots, and why the count is fixed

| Slot | Row | Faults it draws |
|---|---|---|
| table | `flat-fallback-note` | the browser cannot draw the table, the table did not load |
| log | `log-fault-note` | the browser keeps no log, another tab holds it, the log stopped, the storage is full |
| import | `import-fault-note` | a file this application cannot read |
| settings | `settings-fault-note` | the browser keeps no settings |

Eight faults over four slots. The faults inside one slot cannot hold at once: a log that refused to
open writes nothing, so it cannot then be full, and the newest log fault replaces the one before it.
So the row count on the screen is the slot count and never the fault count, which is what bounds the
surface. A banner that grew a row per failure has no bound, and a phone at 360 px has no room for
one.

`src/shell/faults.ts` holds the slots, the words and the accounting, and `src/shell/faults.test.ts`
parses the union declarations out of every module that refuses and asserts the accounting against
them. A refusal added later is therefore a red rather than a cell nobody read.

### The banner holds no control, and that is forced

Both keyboard walks of section 6 are fixed at eleven visits before the throw and thirty-five after
it. A control that appeared with a fault would move them. So every recovery route is a control that
already exists, and the row names it: More for the table, the history for the log, the import control
for a file. The row is read by a screen reader through the live region, and the control it names is
reachable by keyboard alone with an accessible name.

Section 3 lists the banner under the read-only parts. The control inventory is unchanged at five
controls at rest against a budget of eight.

### The banner is the live region, and the row inside it is not

The banner carries `role="alert"` and the name "Problems". Every row carries no role of its own. A
live region inside a live region is announced twice, and Unit 3.7 had given the flat-dice notice its
own `role="status"` when it was the only surface there was. That row keeps its name, because the
notice it draws is the same notice and two names for one element would be a second surface.

### A fault reads like the seven-day note, and that is deliberate

Both are a shaded pad with a marked left edge and full ink. They are the same kind of thing to a
player: read this, it is about your data. The two differences are the ones that matter — a fault
carries its instruction in bold on its own line, and a fault is announced when it arrives.

### The order of a recovery route is measured, not chosen

Two of the routes take two steps, and both orders were found by taking the route rather than by
reasoning about it.

- **A refused chunk.** The toggle alone can never bring the table back. A dynamic import that failed
  once is remembered by the module map, so the same document makes no second request at all —
  measured through `node scripts/browser.mjs --faults`, where the chunk's resource list still held
  one entry of zero bytes after the toggle. The words therefore read: reload, then switch the table
  on. The reload has to come first, because the stored fall keeps the dice flat until the toggle
  clears it, and the toggle is what asks the fresh document for the chunk.
- **A full store.** Making room is not enough. A transaction that aborts on the quota leaves the
  connection unusable, so the next throw answers a fault of the log rather than a full one —
  measured through the same command with `--quota-kb`. The words therefore read: make room, then
  reload.

Both orders are measured on every run of that mode, in one check each, so a change that repairs
either one turns the check red rather than leaving a stale instruction on the screen.

### What a fault never prints

No code identifier, of any kind. `importCsv` names a column, a line and a value in its message,
because the person repairing the file needs all three, and a column name in a file the player did not
write is whatever the file says it is. So a rejection carries a CODE as well, the screen reads its
words off that code, and the message stays in a field nothing draws. Unit 4.4 found `1 ratingPoint`
and `pool-banes-damage-ratings` printed on a player's screen, and only a capture caught them.

### Captures

Six surfaces, every one read at 360 px after it was written:
`0024-fault-nothing-kept-360.png`, `0024-fault-table-absent-360.png`, `0024-fault-table-lost-360.png`,
`0024-fault-log-stopped-360.png`, `0024-fault-import-refused-360.png` and
`0024-fault-storage-full-360.png`.
