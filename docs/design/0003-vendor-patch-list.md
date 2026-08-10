# 0003 — Vendor patch list

Status: **GO.** Vendoring delivers the criterion. This file is the plan for Unit 3.1.

The criterion is a conjunction, not two facts:

> **A predetermined value is honoured on a re-throw of a named subset**, for d6/d8/d10/d12.

The conjunction was **run, not reasoned**. Section 6 records the run, its two red-proofs and the
render. The library fails the conjunction as published. Three edits, 972 bytes, make it pass on all
four dice types.

Nothing from the library is in this repository. It was installed into a scratch project outside the
repository and read there. Section 5 gives the install command.

---

## 1. The outcome, priced against the two options rejected

| Option | Price | Evidence |
|---|---|---|
| **Go — vendor and patch. Chosen.** | Three edits to one file. Two are one line each. The third replaces a 13-line method with a 32-line one. 972 bytes. | The conjunction runs green 16 of 16 cases over four runs on the GPU. Section 6. |
| No-go — build on three.js and cannon-es directly | The plan prices it at 1,500 to 2,500 lines and one to two weeks. | The hard part it names — forcing a predetermined outcome out of a physics simulation — is already solved in the library, and the solve is 4 lines of ordering: simulate to rest, read the face, swap the face, replay the same fixed steps. Rebuilding that buys no measured thing. |
| Defer — keep the flat renderer, defer 3D | The plan calls this "nearly free now that Phase 2 shipped". **Phase 2 has not shipped.** Unit 2.0 is at `BLOCKED:owner-gate` and Units 2.1 to 2.3 are unbuilt. | Defer today keeps a flat renderer that does not exist, so it defers to nothing. It also drops the gap the intent names: every virtual-tabletop integration hides the kept dice, and showing them is the reason this project exists. |

Go costs less than the flat fallback it replaces, because the flat fallback still has to be built
either way for Unit 3.7.

---

## 2. The four facts, against the installed source

Every line reference is into
`node_modules/@drdreo/dice-box-threejs/dist/dice-box-threejs.es.js` at version 1.1.0, the file the
package ships. The package publishes `dist` and `types` only. There is no other installed source.

### Fact 1 — `reroll()` never applies a predetermined value. **CONFIRMED.**

| Method | Line | Simulates first | Applies the forced face |
|---|---|---|---|
| `roll(e)` → `rollDice(e)` | 19272, 19335 | `simulateThrow()` at 19343 | `swapDiceFace` at 19349 |
| `add(e)` | 19296 | `simulateThrow()` at 19303 | `swapDiceFace` at 19312 |
| **`reroll(e)`** | **19283** | **none** | **none** |

`reroll` at 19283 to 19294 wakes each named body, sets it dynamic, and applies an angular velocity
and a linear velocity. It then calls `animateThrow` at 19288. It never calls `simulateThrow` and it
never calls `swapDiceFace`. Its signature takes ids only, so a caller has no way to name a value.
The push therefore shows what the physics produced. Measured: section 6, `lib=plain`.

### Fact 2 — the trademark count. **58 CONFIRMED. "17 colorsets" CONFIRMED. One part refuted.**

The forbidden colorset term occurs **58 times** in the shipped bundle. It sits in **17 of the 51
colorset entries** and, additionally, in **17 of the 41 dice-type definitions**.

| Table | Lines | Entries | Entries carrying the term | Occurrences |
|---|---|---|---|---|
| Themes | 16820 to 17121 | 38 | 0 | 0 |
| Colorsets | 17122 to 17593 | 51 | 17 | 41 |
| Dice types | 17638 to 18223 | 41 | 17 | 17 |
| **Total** | | | | **58** |

Indexed dynamically, so no bundler can strip it:

- Colorsets: `getColorSet` at 17615 does `fl[t]` at line 17619, where `t` is a runtime string.
- Dice types: the factory reads `Fr[e]` at lines 18226 and 18228, keyed by the notation string.
- Themes: `j_[this.theme_surface]` at line 18792.

Rollup and esbuild both keep a whole object literal that is indexed by a computed key. The term
would reach `dist/`.

**Refuted, and it matters:** the plan says the term "would fail Unit 0.3's gate". It would **not
have**. The gate matches hashed terms, and this term's hash was **not on the list** — the list
covers the publisher of the reference document, not this one. Measured before the fix:
`node scripts/check-branding.mjs --file <bundle>` printed `hits=0` and exited 0. This unit adds the
salted hash to `scripts/forbidden-hashes.json`. The same command now prints `hits=58` and exits 1.
The plaintext term appears nowhere in this repository.

### Fact 3 — `preserveDrawingBuffer` cannot be reached. **CONFIRMED.**

Line 18801, inside `initialize()` at 18800:

    this.renderer = new Y_({ antialias: !0, alpha: !0 })

Two independent locks:

1. The option object is a literal. No configuration field reaches it. The default config at 18740
   to 18771 has no renderer key, and neither does `DiceConfig` in `types/index.d.ts`.
2. `types/index.d.ts` exposes `scene`, `world` and `camera` on the `DiceBox` class, and **not**
   `renderer`. A TypeScript caller cannot reach the renderer to draw a fresh frame either.

So an unvendored library gives the share card a black frame, and gives it no legal way to avoid one.
Vendoring fixes both with one property and one typings line.

### Fact 4 — `reroll()` applies velocity `(0,0,3000)`. **CONFIRMED.**

Line 19287:

    s.body.angularVelocity = new S(25, 25, 25), s.body.velocity = new S(0, 0, 3e3)

Z is up. Line 18801 sets `this.world.gravity.set(0, 0, -9.8 * this.gravity_multiplier)` and the
multiplier default is 400 at line 18752, so gravity is 3920 units per second squared downward.

| Quantity | Value |
|---|---|
| Horizontal velocity | 0, 0 |
| Vertical velocity | 3000 up |
| Apex height | 1148 units |
| Time to apex | 0.765 s |
| Die width, `baseScale` 100 | about 90 units |

The die rises about twelve die-widths and lands on the spot it left. It is a hop, not a throw. The
same vector appears a second time at line 19140, inside `throwFinished`, for the library's own
exploding-dice path.

---

## 3. The patch list

Three edits. Each one is required. Section 6 red-proofs the second and third against each other.

### Patch A — `swapDiceFace`, line 19056

    e.geometry = a, e.result = [];

**Now:** it replaces the die's geometry with `a`, a clone made at line 19036. Three.js
`BufferGeometry.copy` carries name, attributes, morph attributes, groups, bounds, draw range and
user data. It does **not** carry an arbitrary added property, and `cannon_shape` is one — the
factory sets it at line 18679. So every forced die loses its collision shape.

**Must:** carry the property across the clone.

    a.cannon_shape = e.geometry.cannon_shape, e.geometry = a, e.result = [];

**Why it is invisible today:** the library never re-spawns a body from a swapped geometry.
`rollDice` clears the table at line 19340 and builds fresh dice, and `add` re-spawns only the new
dice. Patch C is the first caller that re-spawns an existing die, so patch C is what makes this
defect reachable. Measured: with patch C alone, every pushed die spawns with `shape: undefined` at
line 19093, falls through the tray, and is 328,000 units away when the iteration limit stops it —
**while still reporting the forced value**. See section 6, `lib=conly`.

### Patch B — `swapDiceFace_D4`, line 19076

    ..., e.geometry = o;

Same defect on the D4 path. Same fix.

    ..., o.cannon_shape = e.geometry.cannon_shape, e.geometry = o;

D4 is out of scope for the six Clatter dice types, but the patch is one clause and leaving one path
broken invites a later unit to trip on it.

### Patch C — `reroll`, lines 19283 to 19294

**Now:** `async reroll(e)`. Wakes the named bodies, applies `(0,0,3000)`, animates. 13 lines.

**Must:** `async reroll(ids, forced)`. Take one predetermined value per named die and honour it, by
running the same four-step order `rollDice` already runs, restricted to the named subset and with no
`clearDice`:

1. Build a notation for the subset from each die's own `notation.type`, with the forced values after
   `@`. The notation grammar reads them at line 18703.
2. Call `getNotationVectors` at 18963 for real throw vectors — a start position at the tray edge, a
   velocity across the tray and a random spin. Do **not** call `startClickThrow` at 19196: line
   19197 clears the whole table when `this.rolling` is set, which would delete the kept dice.
3. Re-spawn each named die on its new vector with `spawnDice(vector, existingDie)` at 19078, then
   `simulateThrow()` at 19146, then `swapDiceFace` for each die whose settled value differs from the
   value the caller named.
4. Re-spawn each named die on the **same** vector a second time and call `animateThrow`. The world
   steps at a fixed `framerate` in both 19148 and 19158, so the replay repeats the simulated
   trajectory and lands the swapped face upward.

Reset `die.result = []` before step 3, so `throwFinished` at 19139 stores a fresh value rather than
treating the die as already settled.

32 lines. The full text is in the measured patch; it is reproduced by
`/tmp/claude-1000/probe/make-patched.mjs` in the run of section 6 and is not copied here, because a
second copy of code nobody updates is worse than none.

**Kept dice need no patch.** `throwFinished` sets a settled body to `KINEMATIC` at line 19141, and
line 19136 skips kinematic bodies. A kinematic body has infinite mass, so a re-thrown die bounces
off a kept die and the kept die does not move. Measured displacement of every kept die: 0.0 units.

### Patch D — expose the renderer

Add `preserveDrawingBuffer` handling and a `renderer` field to the vendored typings, for Unit 4.9.
One property at line 18801 and one line in `types/index.d.ts`. Not needed for the conjunction, and
listed here because fact 3 is the reason the library is vendored at all.

### Patch E — deletions, Unit 3.1

| Delete | Where | Measured saving |
|---|---|---|
| The colorset table, replaced by Clatter's six abstract sets | lines 17122 to 17593 | see M5 |
| The theme table | lines 16820 to 17121 | see M5 |
| The 17 dice-type definitions carrying the term | inside 17638 to 18223 | not measured separately |
| The sound files | `dist/sounds` | M2. Unit 3.6 supplies its own. |
| The `peerDependencies` declaration | `package.json` | three.js and cannon-es are already inlined in the bundle. Nothing imports them by name. |

`dist/textures` is fetched at runtime from `assetPath` through `loadImage` at line 17607. It is not in the JavaScript chunk and is not covered by the 3D chunk budget.

---

## 4. What Unit 3.1 must not assume

- **`getScreenPosition` at 19399 takes a three.js `Vector3`, not a cannon `Vec3`.** It calls
  `.project`. Passing `body.position` throws `n.project is not a function`. Pass the mesh position,
  which `animateThrow` syncs at line 19161. This cost one run in this unit.
- **`getFaceValue` at 18336 reads the geometry and the body quaternion.** It is a real read of what
  the player sees, not a stored intention, so a check built on it can fail. Unit 3.3 should use it.
- **A die at 328,000 units still projects inside the viewport.** An on-screen test is not a
  substitute for a settled test. Section 6 measured both, and only the settled test caught the
  fall-through.
- **`kept_did_not_move` cannot fail while kept dice are kinematic.** It is true by construction.
  Unit 3.4 must red-proof it with the test-only offset hook the plan already names, or it is a check
  that reads the constant it bounds.

---

## 5. Five committed machine measurements

Install into a scratch project outside this repository. Never add the library to this repository's
`package.json` or lockfile.

    mkdir -p "$TMPDIR/dice-probe" && cd "$TMPDIR/dice-probe"
    printf '{"name":"dice-probe","private":true,"version":"1.0.0"}\n' > package.json
    npm install --cache "$TMPDIR/npm-cache" @drdreo/dice-box-threejs
    export PKG="$TMPDIR/dice-probe/node_modules/@drdreo/dice-box-threejs"
    export LIB="$PKG/dist/dice-box-threejs.es.js"

`--cache` is required on this host, because `~/.npm/_cacache` is read only inside the sandbox.

### M1 — installed version and tarball integrity

    $ node -p "require('$TMPDIR/dice-probe/package-lock.json').packages['node_modules/@drdreo/dice-box-threejs'].version"
    1.1.0
    $ node -p "require('$TMPDIR/dice-probe/package-lock.json').packages['node_modules/@drdreo/dice-box-threejs'].integrity"
    sha512-BKQlSKLnNVlqvUQ9GUPah7QXoRiu+NkU75OG6Y4IuyLd1dd00pxjcz20mBbIXA9WITXIc1Y/zHuQ661hugXCdQ==

Every line reference in this file is against that integrity hash.

### M2 — sound assets

    $ find "$PKG/dist/sounds" -type f -printf '%s\n' | awk '{s+=$1;n++} END{print s" bytes in "n" files"}'
    540987 bytes in 75 files

The plan says 672 KB. `du -sh` reports `672K` for the same directory, because 75 small files round
up to the 4 KB block. The byte count is 540,987. Unit 3.6 replaces them.

### M3 — colorset count

    $ grep -c '^    category: ' "$LIB"
    51

`category` is a key of the colorset entries only. Themes and dice definitions do not carry it.

### M4 — occurrences of the forbidden term

Run from this repository, with the hash added by this unit.

    $ node scripts/check-branding.mjs --file "$LIB" | grep -c 'HIT'
    58
    $ node scripts/check-branding.mjs --file "$LIB" > /dev/null; echo $?
    1

The gate prints a surface, a file, a token offset and a 12-character hash prefix per hit. It never
prints the text. Before this unit the same command printed `hits=0` and exited 0.

### M5 — gzipped size of the parts to keep

    $ gzip -9 -c "$LIB" | wc -c
    172983
    $ sed '17123,17593d;16821,17121d' "$LIB" | gzip -9 -c | wc -c
    169246

172,983 bytes is the whole bundle, three.js and cannon-es inlined, against the
`lazy_3d_chunk_gzip_bytes` budget in `budgets.json`. 169,246 bytes is the same bundle with the
theme and colorset table bodies emptied, which is patch E's first two rows. The two tables are worth
3,737 gzip bytes. Both figures are under the budget with room to spare. Do not retype either number
into prose elsewhere — read `budgets.json` for the ceiling and re-run the command for the value.

---

## 6. The conjunction check — it ran

**Sandbox off**, on this host's GPU. `scripts/browser-driver.mjs` drives `/usr/bin/firefox`. The
whole probe lives outside this repository, at `/tmp/claude-1000/probe`.

### The check

One case per dice type. Throw four dice with forced values. Then re-throw **dice 2 and 3 by id**
with new forced values, and assert all of the following at once:

| Assertion | What it catches |
|---|---|
| `roll_forced` — all four faces equal the first forced list | predetermination is reachable at all |
| `push_forced` — dice 2 and 3 equal the second forced list | the conjunction. This is the one the project needs. |
| `kept_values` — dice 0 and 1 still show their old values | a push that rewrites the kept dice |
| `kept_still` — dice 0 and 1 moved less than 0.5 units | a push that disturbs the table |
| `pushed_moved` — dice 2 and 3 moved more than 20 units | a push that does nothing |
| `on_screen` — every die projects inside the canvas | a die off the table |
| `settled` — every body reports cannon `SLEEPING` | a throw that never came to rest |

Every face is read live, by `getFaceValue()` off the body quaternion and the current geometry. No
assertion reads a stored intention.

### The three runs

| Library | Result | Which assertion broke |
|---|---|---|
| `plain` — as published | **0 of 4 cases pass** | `push_forced` false on d6, d8, d10 and d12. `roll_forced`, `kept_values`, `kept_still` and `settled` all true. |
| `conly` — patch C without patches A and B | **0 of 4 cases pass** | `settled` false on all four. The pushed dice carry the forced value and are 328,000 units from the tray. |
| `patched` — A, B and C | **4 of 4 cases pass**, repeated four times, 16 of 16 | none |

`plain` is the measurement of fact 1. Predetermination works and subset re-throw works, and the
conjunction still fails — which is exactly the trap the acceptance criterion was written against.

`conly` is the red-proof of patch A, and it is the more useful of the two. Before `settled` was
added, `conly` passed every assertion the check then had, at 328,000 units off the table. A
tolerance of "it moved more than 20 units" is wider than a defect that moves a die 328,000 units.
The instrument was blind and the fix was a property with no free parameter, not a smaller number.

### The render

`/tmp/claude-1000/probe/push-patched.png`, captured from the patched run of `4d6@6,1,2,3` then a
push of dice 2 and 3 to 6 and 1. Four dice lie flat on the tray reading 6, 1, 6, 1. The image agrees
with the machine read. It is not committed, because no library asset enters this repository.

### Reported, not blocking

- The probe cannot run inside the sandbox. The sandbox hides `/dev/dri` and there is no WebGL
  context. Unit 0.7 records the same limit.
- The check is not in `validate`. It needs a browser and a GPU. Unit 3.3 and Unit 3.4 own the
  permanent versions, driven through `scripts/browser.mjs`.
- The probe drives the library directly, with no Clatter code. It measures the library, not the app.
