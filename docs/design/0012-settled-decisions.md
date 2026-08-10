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

---
