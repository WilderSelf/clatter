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
