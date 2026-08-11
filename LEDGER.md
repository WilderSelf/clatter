# Ledger

Status table for each unit. Every unit appends one row after it lands.

| Unit | Title | Status | PR | Notes |
|---|---|---|---|---|
| 0.1 | Local repository, profile, and conventions | Done | — | Local only, no remote yet. |
| 0.2 | `CLAUDE.md` and the rules spec | Done | — | 8 constraints, 5 named `BLOCKED:` tokens, plan path linked. `specs/0001-rules-model.md` holds 8 step-ladder states and 4 push profiles. Local only, no remote yet. |
| 0.3 | The branding gate | Done | — | See the notes under this table. |
| 0.4 | Toolchain | Done | — | Vite 8 + TypeScript 6 strict + Preact 10 + Vitest 4, ESLint 10 flat config banning `innerHTML`/`outerHTML`/`insertAdjacentHTML`/`dangerouslySetInnerHTML` via core rules only, Prettier. `npm test` runs Vitest, the branding gate's own `node --test` suite, and the gate itself. Build output 4.87 KB gzip against a 60 KB budget. Branding gate over the tree plus `dist/`: `files_scanned=14`, `hits=0`. Local only, no remote yet. |
| 1.1 | Types and random source | Done | — | Built before Units 0.5 to 0.7. See the notes under this table. |
| 1.3 | Pool construction, modifiers, and the step ladder | Done | — | The eight-state ladder with an index offset clamped to `[0,7]`. The 56-case table ran, 44 cases reverse and 12 cases clamp. Also corrects the two stale artifact-curve figures in the rules spec to 4/3 and 5/6. See the notes under this table. |
| 1.2 | Success and lock tables | Done | — | `SUCCESS_TABLE` generated from the threshold rule of four curves over nine dice-type rows. 19 tables, 162 entries, both counts asserted against an independent enumeration. `score` and `lockState`/`isLocked` read the tables. See the notes under this table. |
| 1.4 | Roll and score | Done | — | `roll(pool, random)` plus the derived `successCount` and `baneCount`. The property test ran 20 seeds x 10,000 rolls over 14 dice-type and face-count combinations, 20 of 20 seeds held, and the whole file took 1.63 s. ESLint now bans the seeded source from shipping code. Ran before Unit 1.5, and the property test therefore runs per dice type and face count. See the notes under this table. |
| 1.5 | Push profiles | Done | — | The four presets as frozen data in `src/rules/push-profile.ts`, plus `mergeProfile` and `pushBlockedBy`. `PushCost.source` and `.unit` narrowed from `string` to two unions. The lock matrix ran 24 pairs against the computed product of 4 presets and 6 dice types, over a hand-built roll of 24 dice. Red-proof passed and named the preset and the dice type. Branding gate `files_scanned=38`, `hits=0`. See the notes under this table. |
| 1.6 | The push resolver and the cost preview | Done | — | `push(result, profile, random)` and `previewPush(result, profile)` in `src/rules/push.ts`, over one derivation of the pushable set. The matrix ran 20 pairs against the computed product of 5 fixture rolls and 4 presets, 68 draws against 68 independently computed pushable dice. Profile 3 raises stress before the throw, asserted by name. Two red-proofs passed, and both named the die. Branding gate `files_scanned=40`, `hits=0`. See the notes under this table. |
| 1.7 | Stress and complications | Done | — | `stressBefore` is a field of the roll request and `stressAfter` is derived on the roll and on the push. The application owns the counter and the core stores none of it. `complicationTriggers` reads the whole history matrix, so a stress 1 on the first roll calls for a check. One original complication table of 12 entries, with a rejection selector that reaches every entry of a table of any length. Vitest now shuffles files and tests at recorded seed 42. Two red-proofs passed. Branding gate `files_scanned=43`, `hits=0`. Closes Phase 1. See the notes under this table. |
| 0.5 | CI, public repository, protection | Local half done. Network step open. | — | `.github/workflows/ci.yml` and `scripts/check-bundle-size.mjs` landed. The branding gate runs after the build, over all four surfaces, through the file-count wrapper. Initial JavaScript measures 4843 gzip bytes against the 61440 in `budgets.json`. Three red-proofs passed. **Open:** create the public repository, push one squashed commit, wait for one green run, apply protection, and prove the block on `test/gate-proof`. The commands are in `docs/release-checklist.md`. See the notes under this table. |
| 0.6 | Pages deploy | Local half done. Network step open. | — | `.github/workflows/deploy.yml` landed, and `base` in `vite.config.ts` is `/clatter/`. The built page loads `/clatter/assets/index-Bpwk-FIa.js`, read from `dist/index.html`. **Open:** set the Pages source to GitHub Actions, run the deploy, and check the live page with `curl`. The commands are in `docs/release-checklist.md`. See the notes under this table. |
| 2.0 | Screen design. Owner gate. | BLOCKED:owner-gate | — | One self-contained mock at `docs/design/mock.html`, drawn at 360 px, 768 px and 1440 px, plus the control inventory and the budget at `docs/design/0002-screen-design.md`. Controls at rest: 4 before a throw and 6 after one, against a budget of 8. A roll is one tap and a push is one tap. Branding gate `files_scanned=45`, `hits=0`. Waits for owner approval. See the notes under this table. |
| 0.7 | Browser harness and project skill | Done, with a recorded substitution | — | One entrypoint at `scripts/browser.mjs`, the driver behind `scripts/browser-driver.mjs`, the matcher table at `scripts/browser.test.mjs`, and the skill at `.claude/skills/run-clatter/SKILL.md`. **The plan named Playwright and a system chromium. The host has neither, so the driver is `puppeteer-core` against `/usr/bin/firefox`.** The substitution and the price of reversing it are recorded under this table. A hardware run outside the sandbox reads `AMD Radeon RX 6700 XT (radeonsi, navi22, ACO, DRM 3.64, 7.1.5-201.fc44.x86_64)` and exits 0. The same run with the software rasteriser forced reads `llvmpipe (LLVM 22.1.8, 256 bits)` and exits 1. Inside the sandbox it reads no renderer at all and exits 1. Five red-proofs passed. The bundle is unchanged at 4868 gzip bytes. Branding gate `files_scanned=49`, `hits=0`. See the notes under this table. |
| 3.0 | Vendor proof | **GO**, with a recorded order deviation | — | The conjunction ran on the GPU with the sandbox off. As published the library fails it on d6, d8, d10 and d12: predetermination works, subset re-throw works, and the combination does not. Three edits of 972 bytes make it pass, 16 of 16 cases over four runs. The patch list is `docs/design/0003-vendor-patch-list.md`. Facts 1, 3 and 4 confirmed with line references. Fact 2 confirmed at 58 occurrences across 17 of 51 colorsets, plus 17 of 41 dice definitions the plan did not name. **One part of fact 2 is refuted:** the branding gate did not hold the term, so it would have passed the tray straight through. This unit adds the salted hash. Branding gate over the library now `hits=58`, exit 1. Branding gate over this repository `files_scanned=53`, `hits=0`, exit 0. See the notes under this table. |
| 3.1 | Vendor and strip | Done, with a recorded order deviation | — | The library sits at `src/tray/vendor/`, 18,786 lines and 766,036 bytes, with its MIT notice. It is a copy, not a dependency, and `package.json` is unchanged. The colour-set table is gone and six sets this repository owns replace it. The 17 dice definitions that carried the term are gone. The sounds, the textures and the peer dependencies never entered. Six edits landed: the collision shape survives the face swap on both paths, `reroll` honours one predetermined value per named die, the renderer is reachable, and `getScreenPosition` takes any `{x, y, z}`. The tray is behind a dynamic import, so it builds into its own chunk. The lazy chunk measures 152,583 gzip bytes against the ceiling in `budgets.json`. Initial JavaScript moves from 4,843 to 6,392 gzip bytes, and none of that rise is library code. Lint and strict typechecking exclude the copy. Both gates still read it. The conjunction check ran again on the GPU against the stripped copy and passed 4 of 4. One red-proof passed and named the built chunk. Branding gate `files_scanned=60`, `hits=0`, exit 0. See the notes under this table. |
| 3.2 | Tray scene | Done, with a recorded order deviation | — | `src/tray/scene.ts` mounts the vendored tray through the dynamic import Unit 3.1 left, sets the surface colour and sets the pixel ratio. The three render counters are measured on the GPU and recorded in `budgets.json`: 841 draw calls, 842 triangles and 77 textures, against ceilings of 968, 969 and 89. The gate that reads them is red-proofed. Four vendor edits landed: the tray walls stand one `baseScale` inside the frame, a die enters inside its own walls, the ambient light is neutral, and a die face texture declares sRGB. `MAX_PIXEL_RATIO` is 2, priced at ratios 1, 2 and 3. Initial JavaScript moves from 6,392 to 6,805 gzip bytes. The lazy chunk falls from 152,583 to 152,290. Two captures at 360 and 1440 pixels are in `docs/design/`. Branding gate `files_scanned=64`, `hits=0`, exit 0. See the notes under this table. |
| 3.3 | Throw a pool | Done, with a recorded order deviation | — | `src/tray/throw.ts` acts out a `RollResult`. The tray reads no random source and decides nothing. The library spawns grouped by face count, so `trayOrder` fixes the order the values map to. Dice are coloured by type: one neutral base, one colour multiplied in per type, and no extra texture — the 24-die pool draws the same 77 textures as the one-colour twelve-die scene. The six colours form a lightness ladder with no two closer than 8 L*, so hue is never the only carrier. The machine check ran on the graphics card with the sandbox off: `compared=24 of a pool of 24` up-faces read off the body quaternions, `wrong=0`, and 24 type and face-count combinations against a product of 24. One red-proof passed and named the die, the expected value and the value read. The capture is `docs/design/0005-typed-pool-1440.png`. The lazy chunk is unchanged at 152,290 gzip bytes. Branding gate `files_scanned=69`, `hits=0`, exit 0. See the notes under this table. |
| 3.4 | The push, on the table | Done, with a recorded order deviation. **Closes the main effort.** | — | `pushPool` in `src/tray/throw.ts` re-throws only the subset `src/rules/push.ts` names, with the values that module decided. The tray decides nothing and reads no random source. `scripts/browser.mjs --push` ran on the graphics card with the sandbox off, over a fixture where locking is guaranteed: `compared=4 of the 4 dice the rules core reports as locked, out of a pool of 8`, every kept-die screen-space centroid delta 0.000 px against a bound of 1 px, `awake=0 outside=0` over 8 of 8 bodies, 8 of 8 up-faces equal to the core's values, and 8 combinations against a product of 8. **Two criteria the plan wrote were repaired first, because Unit 3.0 measured both blind.** The distance a pushed die travels is reported and never gated, and the gate is that every body is asleep and inside the tray walls. The kept-die bound gets a test-only offset hook, because a kinematic body cannot move on its own. Both red-proofs passed: the hook moved `kept-d8` by 3.000 px and the failure named it, and patch A removed from the vendored bundle left three bodies awake and 14,000 units outside the walls while the pushed dice still carried the right values and still measured a plausible few hundred pixels of movement. The vendored file was restored from a saved copy and its hash matches. The captures are `docs/design/0006-push-before-1440.png` and `docs/design/0006-push-after-1440.png`. The lazy chunk is unchanged at 152,290 gzip bytes and the twelve-die render counters are unchanged at 841, 842 and 77. Branding gate `files_scanned=71`, `hits=0`, exit 0. See the notes under this table. |
| 3.8 | Performance gates and the phone overlay | CI-gate half done. Overlay half open. Recorded order deviation. | — | The fourth CI gate is `scripts/perf.mjs`, and it closes the last `null` in `budgets.json`. It runs the tray physics in node with no renderer, steps the world until every die sleeps, and counts the steps. Fifty measurements over ten processes all read 203, a spread of 0. `steps_to_rest_fixed_seed_scene` is 224, which is 203 plus ten per cent. The scene is pinned at `scripts/perf-scene.json`, and `steps_to_rest_scene_sha256` fingerprints it, so a changed scene fails by name instead of comparing against a bound for a different scene. Three red-proofs passed. `npm run perf` and `npm run perf -- --quick` are wired, CI runs the gate, and `validate` is unchanged at four commands. **Open:** the in-app debug overlay for p95 and p99 frame duration, long-task total and throw-to-first-motion. It needs the Phase 2 application shell, which waits at `BLOCKED:owner-gate` on Unit 2.0. The lazy chunk moves from 152,290 to 152,331 gzip bytes. Branding gate `files_scanned=73`, `hits=0`, exit 0. See the notes under this table. |
| 4.4 | Roll log | Entry model and profile hash done. Store open. Recorded order deviation. | — | `src/log/entry.ts` holds `LogEntry`, `LoggedDie`, `DieCell`, `createLogEntry` and `profileHash`. An entry stores its derived values and a SHA-256 hash of the whole profile, as the spec's "Derived values" section requires. The hash comes from `node:crypto` and adds no dependency. It is stable across key order over 4 of 4 presets, and sensitive over 16 of the profile's 16 leaf fields under 9 top-level keys, with both counts asserted. **Open:** IndexedDB, the 5,000-roll ring buffer, the two-connection trim test, the `visibilitychange` flush, the quota and `blocked` handling, and the long-task measurement. All of them need application state that waits at `BLOCKED:owner-gate` on Unit 2.0. See the notes under this table. |
| 4.5 | CSV export | Codec done. Full-buffer measurement open. Recorded order deviation. | — | `csvParts` and `exportCsv` in `src/log/csv.ts` write the long format, one row per die per generation, over the 20 columns the plan fixed. A `null` cell emits no row: 110 rows against 110 non-null cells counted a second way. The writer returns a list of 111 pieces and never joins them, and the longest piece is 216 characters against a whole of 21,590. A `note` of `=1+1` exports as `'=1+1` and the raw form never reaches the file. **Open:** the full-buffer export with no long task over 50 ms, which needs `PerformanceObserver` in a browser. See the notes under this table. |
| Roster | Repository-local reviewer | Done | — | `.claude/agents/reviewer.md` carries the two duties the plan's roster mapping names, plus the repository's own review context. It closes an item that was open since Unit 0.2. See the notes under this table. |
| 4.1 | Settings and persistence | Migration done. `localStorage` binding open. Recorded order deviation. | — | `Settings`, `DEFAULT_SETTINGS` and `migrate` in `src/settings/settings.ts`. The migration takes `unknown` and never throws. Ten stored values ran against a ten-item enumeration written in the test, and the count is asserted. One red-proof passed and named the migration path. **Open:** the `localStorage` read and write, which needs application state that waits at `BLOCKED:owner-gate` on Unit 2.0. The unit is not complete. See the notes under this table. |
| 4.6 | CSV import | Codec done. Wiring to the store open. Recorded order deviation. | — | `importCsv` in `src/log/csv.ts` REPLACES the log and REJECTS a duplicate `roll_id`. It caps the text at `MAX_IMPORT_CHARS`, validates the header against the exact schema, and rejects on the first unknown column. Four rejections carry four separate messages, each asserted by name. The round trip runs over 16 entries, a computed product of 4 presets, 2 modes and 2 push choices, with 2 null cells present, and compares 224 fields against a product of 16 entries and 14 fields. Two red-proofs passed and both named the field. **Open:** the call site that hands the new log to the store, which is Unit 4.4. See the notes under this table. |
| 3.7 | Capability probe, fallback, context loss | Engine half done. Interface half open. Recorded order deviation. | — | **Done:** the startup probe, the pure decision, the persisted permanent fall, context loss and reduced motion. `src/tray/capability.ts` reads WebGL2, device memory, core count and `canvas.toBlob`, and `decideTray` decides over that record alone. The decision ran over a cross product of 64 readings against a product of four class lists, 9 above the bar and 55 below, with every reason reachable. On the graphics card the probe reads `webgl2=true device_memory_gb=null cores=16 to_blob=true` and decides `tray=true`. Inside the sandbox it reads `webgl2=false` and decides `tray=false, reasons=[no-webgl2]`, exit 0, so the probe answers rather than throws with no context at all. `Settings` gains `flatFallback` at version 3, with a 2 to 3 migration step and a store of `readSettings`, `writeSettings` and `recordFlatFallback`; the migration table runs 13 cases against a 13-item enumeration. `watchContextLoss` in `src/tray/scene.ts` records the fall on `webglcontextlost` and again on `webglcontextrestored`. Forced through `WEBGL_lose_context` on the graphics card, both handlers fired and the stored flag moved false to true. Reduced motion skips the tumble by winding the library's animation clock back: 24 of 24 faces equal the core's values in both modes and 24 of 24 agree die for die, while the tumbling throw drew 223 frames and the skipped throw 4. Three red-proofs passed. **Open:** the flat-dice renderer of Unit 2.2, the message shown once, the settings toggle back, and the plan's acceptance, a driven-browser run with the 3D chunk blocked. All four need the Phase 2 application shell, which waits at `BLOCKED:owner-gate` on Unit 2.0. **Unit 3.7 is not complete.** See the notes under this table. |
| 3.5 | Locked-dice affordance | Tray half done. Screen half open. Recorded order deviation. | — | **Done:** the three states drawn on the dice and the click that answers them. `src/tray/affordance.ts` reads `lockState` from the rules core and derives nothing of its own. **Shape carries the state, not colour.** A rule lock draws a closed frame around the die, a player choice draws four corner blocks, and a loose die draws nothing. `scripts/browser.mjs --affordance` measures that by dropping a ray straight down onto the desk in 48 directions out from each die, so the probe reads geometry and can see no colour at all: 12 of a pool of 12 measured, rule 48 of 48 directions, choice 20, loose 0, three separated ranges, overlaps=0. The mark's own pixels are then read off the frame composited over the tray surface, at points a raycast proves are its own frontmost surface: 8 of the 8 marked dice, dimmest reading 4.91:1 against a floor of 3:1, which is what WCAG 1.4.11 asks of a graphical object. `affordance.test.ts` computes the same two contrasts from the hex values, unrendered. Every die was then clicked through the driver at a point a raycast proves belongs to it: refused=4 against the 4 the core locks by rule, toggled=8 against the 8 it does not, and the two sum to the pool size 12. Both red-proofs passed and both named what they broke. The vendored bundle exports four three.js primitives so a mark can be a mesh at all. The twelve-die render counters move from 841, 842 and 77 to 849, 906 and 77, against ceilings of 968, 969 and 89, and each mark costs one draw call and eight triangles. Initial JavaScript 6,953 gzip bytes, from 6,951. The lazy chunk 151,876, from 151,842. `npm run perf` still reads 203 steps with the scene digest unchanged. The capture is `docs/design/0008-affordance-1440.png`. Branding gate `files_scanned=89`, `hits=0`, exit 0. **Open:** roles, accessible names, `aria-pressed` state and focus order asserted in the driven browser, and the keyboard route to the same toggle through the history matrix. All of it is DOM, the history matrix is Unit 2.2, and both wait at `BLOCKED:owner-gate` on Unit 2.0. **Unit 3.5 is not complete.** See the notes under this table. |
| 4.1 | Settings and persistence — the screen. **Unit 4.1 is now complete.** | Done | #12 | `sheet-ruleset` picks one of the four presets and `sheet-artifact-curve` picks the curve the artifact dice score on. Both reach the rules core and both survive a reload. The core is the oracle for every effect: a change of preset is asserted by comparing the kept dice on the screen against `isLocked` under the profile in force, over a stub source that answers one face, and the curve is asserted against `successCount` under each curve. Three parts of the core moved so that one answer serves every reader. `src/rules/success.ts` gains `ArtifactCurveId`, `ARTIFACT_CURVE_IDS` and `curveFor`, and `src/log/entry.ts` now reads that one function rather than its own copy. `src/rules/push-profile.ts` publishes each of its unions as a list built from a total record, so a member added to a union is a type error until the list holds it, and the blocker list is read off the record of blocker readers that already exists. **A new claim, and it is what lets a lock ignore the curve:** both artifact curves pay from a face of six upwards, asserted over every face of every artifact size, so `score(die) > 0` reads the same under either one while the successes differ. **The two defaults were one value apart and are now one value.** `DEFAULT_SETTINGS.presetId` is the preset the drawn screen holds, and `DEFAULT_PROFILE_ID` in the shell reads that field, so the screen and the store cannot open under two different rule sets. `Settings` gains `profileOverride` at version 7 with a step from version 6, and the migration table runs 32 cases against a 32-item enumeration, 6 of them new. The screen writes the record through the one writer `src/app.tsx` already held, so a later fall to flat dice cannot put an older rule set back, and the first run of that effect is skipped, because the screen writes what the player changed and never what it opened with. Initial JavaScript moves from 18,944 to 21,152 gzip bytes against the 61,440 in `budgets.json`. The lazy 3D chunk is unchanged at 151,876. Branding gate `files_scanned=120`, `hits=0`, exit 0. See the notes under this table. |
| 4.2 | Override panel | Done | #12 | `sheet-overrides` draws every field of the push-profile record and changes any of them on top of the chosen preset. **The panel is generated from the record.** `src/settings/profile-fields.ts` walks the record and lists no field of a push profile, so a field added to `PushProfile` later appears with no edit to the panel. The editor of a leaf follows the run-time type of the value the preset holds, and a text value belongs to a published domain or it is not editable at all: the identifier, the name and the description belong to no domain, so the identity of a profile is read-only by rule rather than by a list of exceptions. **The denominator is counted a second way, twice.** `src/settings/profile-fields.test.ts` and `src/app.test.tsx` each walk the record themselves and compare the rows path for path, so a field the panel stops drawing turns both red rather than going unread. The record holds 16 leaves under 9 top-level keys, which is the count Unit 4.4's profile hash already asserts: 3 read-only, 7 toggles, 2 numbers, 3 choices and 1 set. Every editable leaf is edited once and asserted to move that leaf and no other. **An override is a change on top of the preset, never a copy of one.** `mergeProfile` from Unit 1.5 applies it, no second store exists, and a leaf put back to the preset's own value leaves the override, so the row marks and the reset control cannot disagree. A stored override is read leaf by leaf through the same rule the panel draws it by. **The effect is asserted through the core:** an override that raises the push limit lets the core allow a second push, where the preset refused one. Vitest moves from 252 to 272 tests over 28 files. `node scripts/browser.mjs --sheet` is the new mode and it exits 0 at `checks=7 failures=0 skipped=0`. See the notes under this table. |
| fix | The tray world clock ran on into the replay | Done | — | Unit 3.3's up-face check went red at random. The cause is the vendored library, not the read and not the throw. The library decides every face in a first pass, puts the bodies back at the spawn state, swaps the face labels, and replays the same fixed-step sequence. A body sleeps when `world.time` minus `timeLastSleepy` passes `sleepTimeLimit`, and 0.9 seconds is exactly 54 steps of the 1/60 second timestep, so that test lands on a step boundary. The clock ran on into the replay, where `world.time` is larger and carries different accumulated rounding, so a die slept one step earlier and the two passes came to rest in different poses. Measured for seed 44: the passes first differ at step 129 on one die at an identical position and quaternion, where the first pass reads velocity `(0.00207, 0.00842, 0.0000208)` and sleep state 1, and the replay reads velocity `(0, 0, 0)` and sleep state 2. `simulateThrow` now saves the clock and puts it back, and the replay repeats the first pass step for step. Rates over the harness, on the graphics card with the sandbox off: 1 failing run of 20 before and 0 of 20 after, plus 3 of 60 before and 0 of 60 after over a direct seed sweep. Every die now reads a pose drift of 0.000000 radians against the simulated pose, over all 60. `scripts/browser.mjs` gains `--throw-seed`, which pins the seed the tray throws from through the generator `scripts/perf.mjs` already uses. Every run prints its seed, so a red run repeats exactly. The same seed gives byte-identical captures across two processes and a different seed gives a different one. The six harness modes all exit 0 at seed 5. **Reported, not fixed:** `pool.colour-separates-the-types` fails on 6 runs of 20, before this change and after it, for an unrelated reason. The dice pile up, so the patch at a die's projected centre often reads a neighbour. Initial JavaScript 6,956 gzip bytes. The lazy chunk moves from 152,331 to 152,342. Branding gate `files_scanned=84`, `hits=0`, exit 0. See the notes under this table. |
| fix | One check answered two questions | Done | — | The pool colour check carried two different findings under one name. It now compares in chromaticity, where brightness is divided out, so a die in the shadow of its neighbour keeps its own hue. Visibility is a separate check, `pool.every-die-shows-its-own-surface`, whose floor is the whole pool, because Unit 3.5 asks the player to click a single die and a buried die cannot be clicked. The colour check judges the visible dice and fails when the compared count and the visible count part, so no run passes with nothing to compare. Over seeds 1 to 40 on the graphics card with the sandbox off, the colour check moves from 1 red to 0 and the new visibility check goes red on seed 22 alone, which is the buried `stress-d6`. **The palette test and the render check are two claims and stay two instruments:** `src/tray/dice-colors.test.ts` measures the CIE L* ladder over the hex values and proves a greyscale copy still separates the types, and the harness check asks whether each die on the screen reads as its own type. Three red-proofs passed, one per check. No budget moved and the throw is unchanged. Branding gate `files_scanned=84`, `hits=0`, exit 0. See the notes under this table. |
| 3.6 | Sound | Engine half done. Interface half open. Recorded order deviation. | — | **Done:** the sound engine, its stored state and the collision hook it reads. `src/tray/sound.ts` synthesises every sound with the Web Audio API. The repository holds no audio file and fetches none. A voice is a burst of noise through a band-pass filter: a die meeting a die is bright and short, a die meeting a wall or the desk is lower and longer, and the level rises with the closing speed along the contact normal. The vendored `eventCollide` reports the collision and plays nothing, and `loadSounds` and `loadAudio` are deleted with the six fields they used. `Settings` gains `soundEnabled` and `soundVolume` at version 4, with a 3 to 4 migration step; the migration table runs 17 cases against a 17-item enumeration. `scripts/browser.mjs --sound` ran on the graphics card with the sandbox off, at `--throw-seed 5`, and 7 of 7 checks passed. Over one silent throw the page built 0 audio contexts and the engine started 0 voices, while the tray reported 507 collisions and the physics world reported 181 new contacts by its own route. Over one sounded throw the engine accounted for 683 of 683 collisions as 224 voices, 246 second reports of one contact and 213 too soft to hear. The context is born suspended and a real click starts it. The stored 0.4 reaches the output gain, and a level of 0 renders a peak of exactly 0 while a context still exists. Four red-proofs passed. Initial JavaScript is 6,951 gzip bytes and the lazy chunk falls from 152,342 to 151,842. `npm run perf` reads 203 steps over 5 runs with the scene digest unchanged. Branding gate `files_scanned=86`, `hits=0`, exit 0. **Open:** the volume control, the settings toggle and the wiring that hands the engine to `mountTray` in the application. All three need the Phase 2 application shell, which waits at `BLOCKED:owner-gate` on Unit 2.0. **Unit 3.6 is not complete.** See the notes under this table. |
| 4.1 | Settings and persistence | Migration and `localStorage` binding done. Screen open. Recorded order deviation. | — | **Done:** the browser binding. `src/settings/local-store.ts` holds `localSettingsStore`, which answers the page's own store or null where the browser refuses one. `src/settings/settings.ts` stays pure and names no browser API. The `--settings-store` harness mode drives the plan's acceptance through the real store, plus five more unusable stored values, a refused store and a real quota error. **Open:** the settings screen. The unit is not complete. See the notes under this table.
| 4.4 | Roll log | Store half done. Interface half open. Recorded order deviation. | — | **Done:** the IndexedDB store. `src/log/store.ts` holds the 5,000-roll ring buffer, and the insert and the trim run in ONE readwrite transaction. A `LogWriter` queues rolls and `flushOnHide` writes them when the page goes to the background. `persistOnce` asks for persistent storage once per page and `estimateStorage` reads the usage and the quota. Four refusals get four answers: `refused`, `blocked`, `full` and `error`. The `--log-store` harness mode fills the buffer, then writes on top of it from **two** connections at once. **Open:** the settings screen that shows the estimate, the log view, the export button, and the interface note about the seven-day rule on iOS. The unit is not complete. See the notes under this table.
| 4.5 | CSV export | Export half done. Export button open. Recorded order deviation. | — | **Done:** the full-buffer measurement. `exportCsvInChunks` in `src/log/csv.ts` builds the file a chunk of rolls at a time, and each chunk becomes its own `Blob`, so the heap holds one chunk and never the whole document. `readRollsInPages` in `src/log/store.ts` reads the buffer a page at a time, because `readRolls` rebuilds 5,000 rolls in one task. The `--log-csv` harness mode measures the whole of what an export button does. **Open:** the export button and the download. Both are interface work and wait at `BLOCKED:owner-gate` on Unit 2.0. The unit is not complete. See the notes under this table. |
| 4.6 | CSV import | Round trip through the real store done. Import control open. Recorded order deviation. | — | **Done:** store, export, import, store, with every field of every roll compared. `appendRolls` takes a `replace` option that empties the log inside the transaction of the insert, which is the call site Unit 4.6 was waiting for. The three decisions the plan settled are now asserted through the real store: an import replaces the log, a duplicate `roll_id` is rejected, and the size cap refuses a file before it is parsed. **Open:** the import control, the file picker and the byte-size check on the file itself, plus the message an invalid import shows, which is Unit 4.10. All of it is interface work and waits at `BLOCKED:owner-gate` on Unit 2.0. The unit is not complete. See the notes under this table. |
| 4.9 | Share card. **Unit 4.9 is now complete.** | Done | #18 | The open half lands: the summary composition, the download and the Web Share call. `sheet-share` sits behind the one disclosure, which Decision 16 of `docs/design/0012-settled-decisions.md` settles and section 4 of `docs/design/0002-screen-design.md` lists, so the control budget of section 3 and both keyboard walks of section 6 are untouched: five controls at each rest state against a ceiling of 8, and eleven visits before the throw and thirty-five after it, in both instruments. **The card names the application and nothing else about where it came from.** `src/shell/share-card.test.ts` scans every string a card can hold through the branding gate's own tokeniser and its own hashes, over twelve real rolls, and a positive control proves the scanner answers. The summary sits on an OPAQUE panel of the interface palette, drawn in the upper left where the capture half recorded the frame is empty, and `drawShareCard` runs inside the overlay of `captureTrayJpeg`, between the copy of the frame and the encode, in one task. An async overlay is refused by name. **The two acceptance measures now run over the PHOTOGRAPH and not over the whole card**, because a panel of text carries variance and thousands of distinct values by itself and would pass them on a cleared buffer: `--capture-later` still reads variance 0.00 and 59 distinct values outside the panel while the whole card reads 253.03 and 2,810. The good run reads 309.78 luma levels squared against a floor of 25 and 19,522 distinct values against a floor of 1,000, over 1,123,800 photograph pixels, and the photograph and the panel add back up to the 1,296,000 of the card. Six cards, one per interface palette, were drawn and measured on the graphics card: every panel ground and every run's ink read off the DRAWN pixels, 48 readings, dimmest 5.28 to 1 against the 4.5 to 1 of WCAG 2.2 SC 1.4.3. **A capture found a defect a green suite could not see:** the headline ran off the side of the panel and its last word landed on the photograph, unreadable, while every check stayed green, because a run's BOX fitted and its TEXT did not. The successes and the banes are now two lines, the drawing measures every run against its box and fits it, and the widest card the readings can make is measured as well. The download reuses the anchor of Unit 4.5 and its file is compared BYTE FOR BYTE against the composition: 69,460 of 69,460 bytes, first difference -1. The share target is the browser's own and is drawn only where `navigator.canShare` accepts the file: this host offers none, so the control is absent and the call check prints NOT JUDGED and counts in `skipped=1`. Twenty-one injections were proved red, every one restored by editing the injection back. Initial JavaScript 37,631 to 39,932 gzip bytes and the lazy chunk unchanged at 151,876, both under the budget in `budgets.json`. `npm run perf` reads 203 steps with the scene digest unchanged. Cards at `docs/design/0020-share-card-<palette>-1440.jpg`, six of them, looked at before this row was written. See the notes under this table. |
| 4.8 | Themes. **Unit 4.8 is now complete.** | Done | #17 | The open half lands: the picker, the colour builder's controls, and the stylesheet that spends a palette. **`src/shell.css` holds no colour of its own.** The role block left `:root`, `src/theme/css-vars.ts` says which palette token fills which role, and `src/app.tsx` writes those properties on the root element in a layout effect, so a change of an axis reaches the whole application at run time and not only at startup. Decision 15 of `docs/design/0012-settled-decisions.md` records it. **Three colour literals are left and all three are the same kind of thing:** black at a fraction of one, spent twice as a shadow and once as a scrim. `css-vars.test.ts` enumerates every literal the file still holds, compares the list against those three, and measures each one to be black and translucent, so a fourth literal cannot join the list by being written into it. **The palette grew four tokens** — `sunken`, `line`, `markSuccess` and `markBane` — and every one is a literal in all six rows, so no resolver derives a colour and a seventh preset is still a seventh row. `line` answers the non-text floor against all three grounds, because a button, a pool tile and a text field are each told from the page by their boundary. The two marks do not follow the theme, and the row says why. `checkPalette` moves from 7 pairs to 21, and the six rows pass all 126. **Three axes reach three places, and every value is read off the rendered result.** `node scripts/browser.mjs --theme` is the new mode and it exits 0 at `checks=10 failures=0 skipped=0` on the graphics card: 6 of 6 page colours read off `.screen`, 6 of 6 tray surfaces read off the element the tray mounts into, 18 flat die bodies against a product of 6 rows by 3 dice types with 18 distinct readings, and 18 more read off the 3D materials through the seam `table.tsx` publishes, with the throw counter held at 2 through all six so the dice were repainted where they lay. **Every contrast claim holds on the rendered screen:** 90 readings against a product of 6 interface palettes by 15 roles, each ink off the element and each ground off the first ancestor that really paints one, lowest 3.06 to 1 on the bone edge of a button, at the WCAG 2.2 floors of 4.5 and 3. **The report reaches the player by name:** 7 findings, 5 from `checkPalette` and 2 from `checkDiceTheme`, computed IN NODE over the same seeds, and the screen names all 7; the page did not move, so the colour is reported and never replaced. **`deriveDiceTheme` gains `exact`, behind `theme-exact-dice`,** because a laddered dice set is readable by construction and `checkDiceTheme` could otherwise never report anything a builder made — the claim had no route to be proved on. **A built theme survives a reload** through the real store, and the record holds the two SEEDS and never the colours. **Keyboard alone reaches and operates the panel:** 26 controls, 0 unnamed, 0 without a state, in 5 groups, and one arrow key moved the page from `rgb(31, 32, 33)` to `rgb(24, 33, 32)`. Section 6 still reads eleven visits before the throw and thirty-five after it, in BOTH instruments. `Settings` gains `builtTheme` at version 8, with a 7 to 8 step, and the migration table runs 36 cases against a 36-item enumeration. Vitest moves from 334 to 353 tests over 35 files. `--shell`, `--sheet`, `--history` and `--blocked-chunk` all stay green. Initial JavaScript moves from 33,449 to 37,631 gzip bytes against the 61,440 in `budgets.json`; the lazy chunk is unchanged at 151,876; the three render counters are unchanged at 841, 842 and 77. Seventeen injections were proved red and every one was restored by editing the injection back. The captures are `docs/design/0019-theme-<row>-1440.png` for all six interface palettes, plus the panel and the builder at 360 px and 1440 px. **Open:** nothing. One pre-existing `--table` failure is reported under the notes and it is not this unit's. |
| 4.7 | Statistics view | Computation done. Charts open. Recorded order deviation. | — | **Done:** the computation. `summariseLog` in `src/log/statistics.ts` answers the three statistics the plan names: the success rate by pool size, the push outcomes, and how often pushing paid off. **It reads the stored derived values and re-derives none.** It reads `dice[].cells[].successes`, the null cells that say a die did not exist yet, `successes`, `pushCount`, `costType` and `costAmount`, and nothing else. It never reads `cells[].value` and it imports no push profile as a value, so no profile can reach the code to re-price a past roll. **"Pushing paid off" is defined in the code, and the definition travels in the returned record as `paidOffDefinition`:** a push paid off when the roll ends with more successes than it held before the first push. Three definitions were rejected and the reasons are in the module: successes per unit of cost, because the four cost units are different things and do not add together; crossing a target number, because the rules have none; and the last push alone, because a player pushes a roll and not a generation. The hand-built log of 6 entries runs against expectations written out by hand: pool size 3 gives 3 rolls, 2 with a success, 3 successes and a rate of 2/3, pool size 5 gives 3 rolls, 3 with a success, 5 successes and a rate of 1, the pushes give 4 pushed rolls over 5 pushes, 1 better, 2 the same and 1 worse, 6 successes before and 7 after, and a cost of 3 rating points, 3 complication checks, 1 health point and no referee point, and the paid-off rate is 1/4. Three denominators are counted a second way: the rolls of every pool-size row sum to the entries read, the better, same and worse counts sum to the pushed rolls, and the pushes are counted again off the case table. **An empty log cannot pass silently:** the entries read are asserted above zero, and the three degenerate cases answer for themselves — no rolls gives 0 entries, no rows and a null rate, no pushes gives a null rate that is asserted to be neither zero nor a NaN, and one roll gives one row. **Two red-proofs passed, and each named the statistic that shifted.** Re-deriving the cost from the edited profile moved `pushes.costByUnit.ratingPoint` from 17 to 34 over 8 rolls, which is the doubled price the edit set, exit 1. Re-deriving the successes from the stored face turned 5 tests red at once: every pool-size row fell to 0 successes and a rate of 0, the paid-off rate fell from 0.25 to 0, and the artifact roll read 7 successes on the escalating curve against the 4 the entry stored under the flat one. Both injections were restored from a saved copy and the file hash matches. Vitest moves from 176 to 194 tests. Both chunks are unchanged at 7,028 and 151,876 gzip bytes, because nothing in `src/` imports the module yet. **Open:** the charts. They are interface work and wait at `BLOCKED:owner-gate` on Unit 2.0. **Unit 4.7 is not complete.** |
| 4.3 | Saved pool presets | Store done. List interface open. Recorded order deviation. | — | **Done:** the storage. `Settings` gains `poolPresets` at version 6, over the same injected store `src/settings/settings.ts` already carries. No second store was built. A preset holds a name and a `PoolCounts`, which is what `poolBuilder` takes, so a recalled preset goes straight back into the rules core. **Step mode is not saved:** its pool is one index on the ladder plus the extras, and the unit asks for a named pool. Four operations answer a new record and never throw: `savePoolPreset`, `recallPoolPreset`, `movePoolPreset` and `deletePoolPreset`. A refusal is a record, and there are four: `emptyName`, `nameTooLong`, `atPresetLimit` and `noSuchPreset`. The name is the identity of a preset, so a save under a name the record holds replaces that preset where it stands. **The reorder is asserted over three presets, because a move of one of two is not observable.** The recall is asserted by rolling the recalled pool through `firstRoll`, not by comparing records: 6 dice came back, the artifact die kept its 10 faces, and all 6 threw one generation. **The two caps are asserted separately.** Twenty presets save one at a time and the twenty-first is refused with `atPresetLimit`, while a replacement is still let through. A name of 60 characters saves and one of 61 is refused with `nameTooLong`, and the same pair of assertions runs over 60 and 61 emoji, because the cap is counted in code points. **The name is user text and storage keeps every byte of it.** A name holding markup, both kinds of quote, an ampersand and an emoji round trips through the store and is compared byte for byte in UTF-8 over all 54 of its bytes. Nothing is escaped, stripped or executed here. **The interface must render the name through `textContent`.** That is Constraint 8, it is not closed by this half, and it belongs to the list interface. The migration gains a 5 to 6 step, and the migration table runs 26 cases against a 26-item enumeration, 6 of them new. An over-long stored list is cut at the cap rather than emptied, and that is asserted by name, because a migration that answered with an empty list would pass a bound alone. A stored preset with a bad name, a bad count or a duplicate name is dropped. `scripts/browser.mjs` compared every settings field by identity, which a field holding a list breaks, so it now reads them through `sameSetting`. That helper runs 11 cases in `scripts/browser.test.mjs` under `npm test`, and the identity defect turns them red. Vitest moves from 176 to 194 tests. Both chunks are unchanged at 7,028 and 151,876 gzip bytes. **Open:** the preset list on the screen, the name field, the drag or the buttons that reorder, and the `textContent` rendering. All of it is interface work and waits at `BLOCKED:owner-gate` on Unit 2.0. **Unit 4.3 is not complete.** |
| fix | Two harness checks measured the wrong thing | Done | — | `--settings-store` failed with `an unknown stored version read poolPresets away from the defaults`, and `--log-csv` failed with a longest task of 58.0 ms against the 50 ms ceiling. Neither shipping module was wrong and neither changed. **Cause 1: the driver drops a repeated object reference.** `readSettings` answers the one frozen `DEFAULT_SETTINGS` record for every unusable stored value, and that record holds one frozen `poolPresets` array. The driver serialises a repeated object once and delivers every later reference to it as `undefined`. The first of the six reads therefore arrived with `[]`, the other five arrived with the field missing, and so did the default record the run compared them against. Three checks compared `[]` against `undefined` and failed. Five field readings compared `undefined` against `undefined` and could not have failed at all. Every settings record now crosses the connection as JSON text, because text is a primitive and cannot be shared. The run counts the field readings it makes: 66 of 66, over six cases and eleven fields, with the field list taken from the default record, so a field added later is compared without an edit. `migrate` is unchanged. It answers an unknown version with the identical frozen defaults record, over all eleven fields, and a probe in the page proved that identity. **The pure test was the deeper defect.** `src/settings/settings.test.ts` bounded each field to its allowed values and never compared it against the value the case names, so 26 migration cases passed while the plan's own acceptance went untested. Each case now carries the record it must answer with, and the loop walks `Object.keys(DEFAULT_SETTINGS)` and counts 286 comparisons against 26 cases times 11 fields. Red-proof: a `migrate` that answers an unknown version with one leftover preset leaves the old test green at 16 of 16 and turns the repaired test red at `an unknown future version: poolPresets`. The same defect turns the repaired harness check red. **Cause 2: the export check measured the wall clock and not the work.** The gate was the longest gap between two ticks of a re-arming timer, and such a gap also counts a garbage collection and anything else the browser runs in the same window. Measured with the sandbox off, on an idle machine, over ten runs of `--log-csv` alone: the gap read 13, 14, 14, 15, 15, 15, 57, 57, 58 and 58 ms, so four runs of ten failed. The export's own longest stretch of the main thread held at 9 to 11 ms in those same runs. The spike always lands at a chunk boundary about a third of the way in, and a second and a third export in the same page never reproduce it. Eight busy cores moved the gap by about 7 ms and explain none of the spike. `src/log/csv.ts` and `src/log/store.ts` have not changed since Unit 4.5, so no regression exists and the 13 ms recorded there was one of the six runs in ten that miss the spike. The ceiling stays at 50 ms and `budgets.json` is untouched. **The gate is now the longest stretch the export itself held the main thread.** The run marks the thread on both sides of every yield, which gives one window per chunk plus the tail: 101 windows against the 100 chunks plus one, which is its own denominator. An export that stopped yielding would be one window of the whole build. The timer stays beside it and is reported, and the read phase is named as reported and not gated, because the browser rebuilds a page of rolls in a task of its own. Red-proof: `--long-task-ms 80` reads 83.0 ms and turns the check red. Eight runs after the fix all exit 0, with the gate between 9.0 and 11.0 ms, and one of them reports a 57 ms wall gap beside a 10 ms gate. All thirteen harness invocations exit 0 at seed 5. Vitest holds at 194 tests. Branding gate `files_scanned=101`, `hits=0`, exit 0. |
| 5.1 | Offline | Offline mechanism done. WebGL mount open. | — | **Done:** `vite-plugin-pwa` in `generateSW` mode handles the offline cache. No hand-written service worker. `PRECACHE_GLOBS` in `vite.config.ts` names the patterns to cache. A `manifestTransforms` function `coverPrecache` compares the precache manifest against `dist/` and turns the build red when a shipped file is missing. It names the file and the constant to edit. Three paths are exempt by rule: the workbox runtime it imports directly, source maps, and `manifest.webmanifest`, which the plugin appends after every transform. `scripts/gen-icons.mjs` draws the two installable icons at 192 and 512 pixels. This repository downloads no asset. **Defect 1:** The config comment said the worker claims the page. The built worker held no `clients.claim`. The plugin sets `skipWaiting` and `clientsClaim` only when `injectRegister` is `auto` or null and `registerType` is `autoUpdate`. This config sets `injectRegister: 'script'` on purpose, so the branch never ran. Both flags are now set explicitly, with a comment naming the disabled branch. Red-proof: with `clientsClaim` removed, the rebuild put 0 occurrences in `dist/sw.js` and the run went red at `offline.the-worker-installs-on-the-first-visit`. **Defect 2:** `runOffline` disabled the network with `page.setOfflineMode(true)`. On Firefox that fails the navigation with `NS_ERROR_OFFLINE` before the service worker can answer. Four checks went red against a correct application. Two earlier attempts failed and were caught by probes: a kill of the `npm run preview` PID left `vite` listening and reported `origin_unreachable=false ... status 200 after 10000 ms`, and a `setsid` wrapper gave `$!` the setsid PID rather than the group leader. The harness now spawns its own preview server with `detached: true`, holds the real group leader, and confirms the origin is unreachable before the reload. **Two checks that could not fail, both closed.** `offline.the-application-rendered` read the first visit's document when the reload threw and stayed green at 3 of 3 named parts. It now requires `reloadError === null`, and the red-proof shows the same 3 of 3 reading turn red with the detail naming why. The joined tray check mixed a precache claim with a mount claim. It is split. `offline.the-lazy-3d-chunk-is-precached` asserts both directions: a positive `fetched > 0` and a negative `chunkFailures === 0`. A chunk nobody requested also fails no request. Its red-proof deleted only the chunk from Cache Storage and read `NS_ERROR_INTERCEPTION_FAILED`, with every other check still green. **The skip, named.** `offline.the-lazy-3d-chunk-mounts` is `SKIP`, printed as `NOT JUDGED`. This browser gives no WebGL context, so the tray cannot mount whatever the precache holds. It fails the same way with the network up, measured on this host on 2026-08-09: `WebGL creation failed: Exhausted GL driver options`, status line "The dice tray did not load.", 0 canvas elements. The sandbox hides `/dev/dri`. The summary line now prints `checks=` and `skipped=` beside `failures=`, so a skip cannot pass as coverage by omission. The mount half has never been judged anywhere, and that is not a regression, because the joined check never passed in this sandbox either. **Acceptance run:** `node scripts/browser.mjs --offline` exits 0: `checks=8 failures=0 skipped=1`. The worker holds 7 entries over 1 cache. The manifest reads offline over 8 of 8 fields and 2 icons. **Unit test:** `src/precache-coverage.test.ts` runs two cases over `coverPrecache`, one per direction. Both injections landed and were restored by edit. **Validation:** `npm run lint` 0, `npm run typecheck` 0, `npm test` 0 over 24 files with 196 vitest tests and 18 node:test tests, `npm run build` 0 printing `precache coverage: 6 of 6`, `check-bundle-size.mjs` 0, `check-branding.mjs` 0 with `files_scanned=111 hits=0`. **Bundle figures:** Initial JavaScript 7,160 gzip bytes. Lazy 3D chunk 151,876 gzip bytes. Service worker 5,958 gzip bytes over 2 files, reported with no budget. Point at `budgets.json` for the budgets rather than retype them. No figure approached its budget. **Also record:** `@types/node` was added as a devDependency and `tsconfig.json` gained `"types": ["node"]`. The `manifestTransforms` parameter type is derived from the exported `ManifestTransform` signature rather than restated, so it cannot drift from the library. No cast and no suppression was used. The transform receives entries carrying `size`, and `workbox-build` deletes `size` from every entry before it writes the manifest. **Open:** The `--hardware` run stays with the owner. The sandbox gives no WebGL. |
| 5.2 | Release | README and LICENSE shipped. Version tag open. | — | **Done:** `README.md` and `LICENSE`, both absent before, were added. The project licence is MIT. The copyright line reads `(c) 2026 WilderSelf`. **The owner confirmed that name on 2026-08-09.** The README covers the project purpose, the push affordance, build instructions, how to check the application, and the separate browser harness. It notes that the 3D tray needs a graphics card and that without one the application falls to flat dice where every rule and control still works. The vendor code at `src/tray/vendor/` is third-party MIT software from 3D Dice 2022; the README points to that license. Four errors were caught by review before any commit. (1) The draft falsely claimed the application renders nothing without a graphics card, contradicting Unit 3.7 which built the flat-dice fallback; the correction states that the 3D tray needs a graphics card and the application falls to flat dice without one. (2) The draft claimed the test suite includes the browser harness; the correction states `npm test` runs unit tests only and the harness is separate. (3) The draft read "every existing dice tool hides the kept dice"; the correction uses only the narrower claim that every existing 3D integration hides them. (4) The draft held one marketing adjective and one semicolon, both banned in README text by `CLAUDE.md`; the file now holds zero semicolons. Branding gate `files_scanned=113`, `hits=0`, exit 0. **The lesson:** a green branding gate is not a review of the document—it reads forbidden tokens, not false statements. **Open:** the version tag. The owner set the repository description and the six topics on 2026-08-09 through `gh repo edit`, and `gh api` reads both back for the branding gate. The remaining commands are in `docs/release-checklist.md`. |
| 2.0 | Screen design | Done | — | **Done:** The owner gate cleared on 2026-08-09, releasing twelve half-built Phase 4 units plus Units 4.10 and 4.11, fourteen units total. The pool maximum is twenty-five dice: fifteen pool dice and ten stress dice. Five tray layouts were drawn and measured at `docs/design/0010-tray-25-option-a.html` through `-option-e.html` (two renders each, ten total), all holding the same twenty-five faces and lock mix. Every figure came from `getBoundingClientRect` in headless Firefox, not from arithmetic. The owner chose option C for the kept shelf and throw zone. Three owner decisions and six delegated ones are recorded at `docs/design/0012-settled-decisions.md`. The drawn screen is at `docs/design/0013-screen-final.html` with thirteen renders. The control budget holds: five controls before the throw and five after, against a budget of eight. Hit targets measure twenty-four and nineteen pixels. The keyboard order was derived, not scaled. Eleven named visits before the throw and thirty after, totalling forty-one. An earlier estimate scaled the old seven-die list and reached forty-one over two lists split ten and thirty-one; the true split is eleven and thirty because `collapse-button` enters the first list, `pool-bar` and `difficulty` leave the second (the builder collapses after a roll), and `edit-pool-button` enters it. Trusting the estimate would have given a right total over two wrong lists; Unit 4.11 asserts those lists. The push decision was measured at two heights. At 360 by 760 pixels (installed case) the middle does not scroll. At 360 by 660 pixels (browser tab) it scrolls. At both heights the header, cost row and Push button stay in view, and the kept shelf is visible at rest. No content is lost at 660 because `.shell-m` carries `overflow-y: auto` and the layout degrades by scrolling rather than clipping. The die was not shrunk, to avoid penalizing the installed application to rescue the browser tab. Every touch target under twenty-four pixels is gone. The pool cell ends went from twenty-two pixels wide to forty-four. The phone builder holds two columns and scrolls. The seven difficulty notches clear the twenty-four pixel floor of WCAG 2.2 SC 2.5.8 and stay under the forty-four pixel target. The measurement moves with scrollbar style, so state that as the property, not the pixel figure. A phase-tab shell was proposed and rejected; it is unfinished at `docs/design/0011-shell-option-f.html`, unrendered and unmeasured. The reasoning is in the decisions file. Two documents were rewritten: `docs/design/0002-screen-design.md` and `docs/design/0012-settled-decisions.md`. Branding gate `files_scanned=101`, `hits=0`, exit 0. |
| fix | The branding gate scanned binary as text | Done | — | **Done:** The gate reported four surfaces while producing garbage tokens from every binary file. It went red on a rendered screen image; the matched token was a three-letter fragment of decoded image bytes at index 2112, between other fragments, with one image yielding 11,598 such tokens. A file is treated as binary when a NUL byte appears in its first 8,000 bytes. Content decides, not the extension, because an extension can lie. The rule was verified against git's decision in `xdiff-interface.c` line 197. The skip is counted, not silent. The gate prints `files_scanned`, `binary_skipped`, `unreadable`, `enumerated` and `terms_loaded` on every run, and adds the first three to check against the fourth. Today: 110, 47, 0 and 157. `scripts/check-branding-count.sh` enumerates independently from tracked files plus built output, and reaches 157 too. The gate now names what it does not read: binary metadata goes unscanned, and the gate names the formats. A per-format chunk parser was rejected, because this repository draws every image with its own script and no foreign metadata arrives. The document records the trigger to add one. `loadConfig` never checked that the hash list held anything. An empty list would have scanned every file, matched nothing, printed no hits and exited 0: a gate reporting full coverage while checking for nothing. An empty list now exits 2 with a message naming the cause. The run prints how many terms it loaded (from the loaded set), so a drop is visible in a log. No expected count was hard-coded, because a second copy would be a cache with no invalidation. Neither `npm run lint` nor CI ran prettier. The lint script now runs it. Four files predated the check and were formatted in a separate commit, so the reformat did not hide inside the gate fix. Three measurements were compared before and after to show behaviour did not change: the test counts, the two bundle figures, and the branding counts line. Point at `budgets.json` rather than restating a budget. Five red-proofs passed, each restored by editing the injection back rather than by any git command that discards bytes. Branding gate `files_scanned=110`, `binary_skipped=47`, `hits=0`, exit 0. |
| 0.5 | CI, public repository, protection | Done | — | **Done:** Public repository created and branch protection live. History squashed to one parentless commit `1488de8` using `git commit-tree`, with three guards verified before push: tree SHA matched the pre-squash state, content diff was empty, and commit held no parent. **The owner ran `git push -u origin main`** because the permission deny list refuses the pattern, and branch protection did not yet exist to distinguish this bootstrap push from a bypass attempt. **Incident documented:** `git switch --orphan` empties the working tree while `git checkout --orphan` keeps it. A mistaken use of `switch` deleted every tracked file from the working tree. The files were gone from disk. `git add -A` then found only what remained: `node_modules` and `dist`. Recovery verified by every measure: branding gate counted 104 tracked files matching the pre-squash count, `npm ci` restored 529 packages, `npm run build` recreated the output, and `git reset --hard` restored the tree without loss. All commit objects survived. CI ran green on the pushed commit including the branding gate over four surfaces (tree, dist, commit messages, repository metadata) and bundle-size check against `budgets.json`. Branch protection installed: required status check `CI` with strict true, enforce_admins false, no required reviews, force pushes and deletions blocked, auto-merge and squash enabled, delete-on-merge enabled. Gate proved to block via test/gate-proof PR: `mergeStateStatus: BLOCKED` with `mergeable: MERGEABLE`, showing protection blocks merges while not falsely reporting conflict-detection as protection. All test branches torn down, no open PR. Incident and workaround recorded in `docs/release-checklist.md`. |
| 0.6 | Pages deploy | Done | — | **Done:** GitHub Pages enabled with build source set to GitHub Actions workflow. The first deploy run failed because Pages was not yet enabled when `deploy.yml` ran. Pages enabled, deploy re-ran and succeeded. The site answers at `https://wilderself.github.io/clatter/` with HTTP 200. **Every referenced asset verified:** not the page alone, because a wrong base path produces HTTP 200 with a blank screen. All three asset paths answered 200: the entry script at `/clatter/assets/index-Bpwk-FIa.js`, the web manifest, and the service worker registration script. The base path `/clatter/` in `vite.config.ts` matches the repository name. No asset path was guessed or restated; every URL comes from fetching the page itself. All steps recorded in `docs/release-checklist.md`. |
| 2.1 | Application shell and pool builder | Done | — | The Preact shell, the state store and the pool builder, drawn from `docs/design/0013-screen-final.html`. `src/shell/state.ts` holds the whole state and asks the rules core every question: the pool, the caps, the step ladder and the effect of the difficulty. The shell decides no rule. **The keyboard order is read out of the design, never restated.** `src/app.test.tsx` parses section 6 of `docs/design/0002-screen-design.md`, which states the same walk three ways, and asserts the walk against all three: 11 numbered names, the count in words, and the sentence splitting Tab from the arrow keys. Tab reached items 1, 2, 9, 10 and 11 and the arrows reached 3 to 8, in both instruments. `node scripts/browser.mjs --shell` presses the real keys in a real browser and reads the same 11. **The browser adds one tab stop of its own at `shell-mid`,** because a scrollable box earns one so a keyboard can scroll it. It is reported by name and not counted, and the drawn screen earns the same stop. The live region is the status line, and it moves from `The throw takes no dice. A roll of no dice fails.` to `The throw takes 25 dice. 5 attribute, 5 skill, 3 gear, 2 bonus, 10 stress.` A mode switch clears a pool of 25 dice, and the core is the oracle: the switched builder equals `switchMode` over the same builder. Four red-proofs passed. The three widths are captured and compared against the `0013-screen-final-builder-*` renders: the builder card, the header and the footer match at 360, 768 and 1440, and every difference is a part no throw has produced yet. Initial JavaScript moves from 7,160 to 10,663 gzip bytes against the 61,440 in `budgets.json`. The lazy 3D chunk is unchanged at 151,876. Branding gate `files_scanned=115`, `hits=0`, exit 0. **Open:** the dice on the table, the push button and the difficulty on `Roll again` all wait for Unit 2.2. See the notes under this table. |
| 2.2 | Flat dice, roll, push, readout | Done, with one acceptance deferred by a settled decision | — | `Roll` throws the built pool and the dice land flat over the kept shelf and the throw zone of Decision 4. The screen decides no rule: `src/shell/state.ts` asks `firstRoll`, `push`, `previewPush`, `isLocked` and `score`, and `src/app.tsx` renders the answer. The cost row and the push button read one `previewPush`, so the price the player commits to is the price the rules apply. **The history matrix is not built here.** Decision 3 moves it into the history record and transposes it, and the row below carries its acceptance to the unit that builds that record. Four checks, each red-proved by an injection that landed and named its gate: the push button is live below the push limit and dead at it; it is live with no stress bane showing and dead under the blocker; the thirty visits of section 6 are walked in the order the document states; and a push re-throws the loose dice alone, with the core as the oracle. The keyboard order is read out of the design and never restated, in both instruments. `node scripts/browser.mjs --shell` gains the after-throw half and passes 8 of 8 checks against the built output in Firefox. Initial JavaScript moves from 10,663 to 14,166 gzip bytes against the 61,440 in `budgets.json`. The lazy 3D chunk is unchanged at 151,876. Branding gate `files_scanned=115`, `hits=0`, exit 0. **Open:** the difficulty preview after a throw, the log entry a roll should write, and the 3D renderer, which Unit 3.7 chooses between. See the notes under this table.
| 2.2d | The history matrix, deferred with its acceptance | Deferred to the unit that builds the history record | — | **This row exists so the deferral has a home and a name.** The plan gives Unit 2.2 the matrix beside the dice, one column per die and one row per generation, with two acceptances: the matrix holds exactly `dice × generations` cells, and the blank count equals an independently computed count of locked-or-absent pairs. Decision 3 in `docs/design/0012-settled-decisions.md` moved the matrix out of the roll flow and into the history record, where it is transposed to one row per die, because 25 columns need 780 pixels of minimum content width against the 300 a phone gives. The settled decision is the authority over the plan text. **Both acceptances travel with the matrix, unchanged.** They land in the unit that builds the record view: Unit 4.5, whose open half is the record and its export control, which Decision 3 puts in the same place. Unit 4.4 builds the summary list beside it. Nothing of the pair is dropped and nothing is weakened. **One dependent item moves with it.** Unit 3.5 records that the keyboard route to a die the 3D tray buries runs through the history matrix of Unit 2.2. The flat tray of Unit 2.2 gives that route already: 25 dice, one arrow walk, every die reachable and named. The matrix route stays owed only for the 3D tray. |
| fix | Draw the tray for 30 dice and derive that target from the caps | Done | #5 | The tray was drawn for 25 dice against an incomplete composition. The artifact ladder ends at a rating of six, which is d12 plus d12 (two dice). The difficulty modifier reaches plus three, which adds three bonus dice. Both sources were omitted from the pool count. The largest first roll therefore holds 27 dice at difficulty 0 and 30 dice at plus 3, with no push at all. The tray has no ceiling. The third profile holds no push limit and adds one stress die before every re-throw, so a walk with an adversarial source reached 230 dice and was still rising. `worstCaseState` in `src/shell/state.ts` derives the target from the caps, the artifact ladder and the difficulty limit. `src/shell/drawn-screen.test.ts` counts the drawn screen against that derivation, so a raised cap turns the suite red and names the layout for a re-measure. The number is written down nowhere. The owner set the draw target at 30, and the tray scrolls past it per Decision 6. The keyboard order was re-derived from the drawn screen, not scaled: 11 visits before the throw and 35 after it. Both instruments read the list out of the design and walk it, under jsdom and under real Tab presses in Firefox. The artifact tile at its cap made the phone builder wider than the phone. That tile alone may now wrap. Branding gate `files_scanned=115`, `hits=0`, exit 0. |
| fix | Rate the step attribute and skill on independent scales | Done | #6 | The step model paired the two die sizes on one list of eight states. That list held eight of the sixteen pairs, so a large attribute beside a small skill was unwritable. It also tied a skill-less roll to a d6 attribute. The reference rates the attribute and the skill on two independent scales, and each rating names its own die size. Store the base pair and store the difficulty as one integer. Compute the rolled sizes from the two through a split table that reads the base pair alone. A round trip and the composition of two modifiers stay true by construction, which is what the eight-state list existed to give, and they now hold where a size clamps as well. The new table enumerates four attribute sizes, five skill states and seven modifiers, counts its own denominator, and asserts the split, the round trip, the composition and the clamp at both ends. The pool bar holds the same six tiles in both modes. In step mode the attribute tile and the skill tile each step their own die size. Branding gate `files_scanned=115`, `hits=0`, exit 0. |
| 2.3 | Roll again, and deploy the slice | Done | #8 | One tap on the roll button re-throws the built pool. The behaviour was already in place. This unit adds five checks that prove it and records what the difficulty readout is once the builder collapses. `src/app.test.tsx` gained five checks and `src/app.tsx` gained one comment block; no behaviour changed. **The five checks:** the re-throw calls the core and the core is the oracle; the re-throw is a new roll and not a continuation, generations back to one over every die; the stress counter carries in over a case where a push raised it; the difficulty on `roll-button` after a throw is the one the throw took; and the control inventory of section 3 holds at both rest states, 16 cells read out of the design. Each check was proved red by an injection that landed and named its gate. **The difficulty is settled.** Section 3 of `docs/design/0002-screen-design.md` keeps the difficulty control and its preview sentence in rest A alone because the builder collapses on a roll. Section 8 states that no control of rest B can change the difficulty, so what the last throw took and what the next throw will take are one number. The design treats the whole after-throw difficulty readout as the signed value on `roll-button`. **Validation:** `npm run lint` 0, `npm run typecheck` 0, `npm test` 0 over 230 vitest tests and 20 node --test tests, `npm run build` 0. Branding gate `files_scanned=116` `hits=0`. **Deploy:** PR #8 merged `2a4d751`, CI SUCCESS. Six URLs answered 200: the page at 544 bytes, the entry script `assets/index-CITyIdqU.js` at 39,652 bytes, the stylesheet at 9,895 bytes, the web manifest at 425 bytes, the service worker registration at 150 bytes, and the lazy 3D chunk at 596,587 bytes. The hashes match the build, so the live page is this commit. **Bundle:** Initial JavaScript 14,356 gzip bytes and lazy 3D chunk 151,876 gzip bytes, both unchanged because the only source addition is a comment. See the notes under this table. |
| 3.7 | Capability probe, fallback, context loss — the interface half | Done. The 3D tray still draws no result. | #10 | `src/shell/renderer.ts` is the choice and it is pure: it reads the probe answer and the stored record and answers which renderer draws the dice. `src/app.tsx` runs the probe once at startup, draws flat dice until it answers, and mounts the table only where the probe clears the bar, so a browser below the bar fetches no part of the 3D chunk. Three events fall to flat dice for good and every one records the flag and tells the player once: a probe below the bar, a table that does not mount, and a lost WebGL context. The notice carries `role="status"` and holds no tab stop, so both keyboard walks of section 6 stay at 11 visits and 35. The way back is `sheet-tray-renderer`, a ninth control on the sheet, which carries no share of the control budget of section 3. Decision 8 of `docs/design/0012-settled-decisions.md` records it. **The defect Unit 2.3 reported is fixed:** the die cell is keyed by a throw ordinal in `AppState`, and the old key held the count of the values a die carries, which reads the same before and after a re-throw. **The acceptance:** `node scripts/browser.mjs --blocked-chunk` removes the service worker and Cache Storage, refuses the chunk at the network layer, counts every refused abort, and then walks every rule and every affordance on the flat dice. On the graphics card outside the sandbox it exits 0 at `checks=11 failures=0 skipped=0`, with the probe reading `true`, one chunk request refused, 0 refused aborts, 0 encoded bytes, 0 canvases and the stored flag true. Eight injections were proved red and every one was restored by editing the injection back. Initial JavaScript moves from 14,356 to 16,355 gzip bytes and the lazy 3D chunk is unchanged at 151,876. Branding gate `files_scanned=118`, `hits=0`, exit 0. **Open:** the 3D tray draws no result yet, for three measured reasons. See the notes under this table. |
| 3.5 | Locked-dice affordance — the screen half. **Closes Unit 3.5, and puts the 3D tray to work in the application.** | Done | #11 | The 3D tray now draws the result inside the application. Three blockers Unit 3.7 named are closed. **1. The push defect.** `pushPool` in `src/tray/throw.ts` spawns the die a profile adds before the re-throw, through `box.add`, on the value the core decided, and it never throws that die twice. The library appends, so the added die takes the index after every die on the tray and the returned order says so. Two answers to "which die is new" — the set the tray does not hold, and `PushedRoll.stressAdded` — must agree, so a stale order fails by name. **2. The screen half.** Decision 9 of `docs/design/0012-settled-decisions.md`: the die cells are real DOM in both renderers, and over the 3D table they lie on the die each one names, draw no die of their own, and take no pointer. `dice-tray` is still ONE control with a roving tab index, and section 6 still reads 11 visits before the throw and 35 after it in BOTH instruments, with the 3D table running. **3. The click route.** A press with the pointer falls through to the raycast of Unit 3.5, which refuses a rule lock. **A defect the render found and no green suite could:** the library draws one last frame when a throw ends and none at all for a click, so a lock mark added after that frame kept the matrix of the frame before and the player saw the marks of the previous throw standing where the previous dice stood, up to 682 world units away. `drawMarkers` now draws the frame that shows them. `node scripts/browser.mjs --table` is the new mode and it exits 0 at `checks=9 failures=0 skipped=0` on the graphics card: `compared=30 of a pool of 30` up-faces read off the body quaternions against the faces the screen printed, `placed=30 of 30` cells inside 1 px of a centroid the harness projects itself, 23 dice answered a real Enter and 7 refused it, `reached=30 unreachable=0` under a real pointer click, and the push took the table from 30 dice to 31 with `die-st11` spawned and every kept die inside 1 px of where it lay. Nine injections were proved red and every file was restored by editing the injection back. Initial JavaScript 16,355 to 18,944 gzip bytes; the lazy 3D chunk unchanged at 151,876; the three render counters unchanged at 841, 842 and 77. See the notes under this table. |
| 4.3 | Saved pool presets — the list on the screen. **Unit 4.3 is now complete.** | Done | #13 | `sheet-presets` names a pool, recalls one, reorders the list and deletes a row, behind the one disclosure. **Decision 11 of `docs/design/0012-settled-decisions.md` settles where it lives**, and three reasons put it there: a recall writes over every tile of the built pool, which is the hazard `sheet-mode` already sits behind; a control in the builder would rewrite the drawn screen the owner approved at Unit 2.0 and both keyboard walks of section 6; and saving is rare where building is constant. **Section 3 is untouched at five controls at each rest state against a ceiling of eight**, and that is measured rather than claimed: the inventory check still counts the eight named controls, and a second check reads both rest states and finds no part of the panel there. Section 6 still reads eleven visits before the throw and thirty-five after it, in both instruments. **The rules core is the oracle for the recall.** The recalled pool is thrown and every face is compared against `firstRoll` over the pool the store holds, 13 dice compared face for face, and no record is compared to a record. **The reorder is asserted over three presets in both instruments**, because a move of one of two is not observable, and the browser half moves a row with a real Enter press. **The name is user text and no parser ever sees it.** A name of 54 code points holding markup, both kinds of quote, an ampersand and an emoji draws as 54 code points of text, in a name element holding one node and no element, in a panel holding no element the markup could have made. Constraint 8. **Each of the four refusals reaches the player as a sentence that names its cause**, against a denominator read off the `PresetRefusal` union in the source of the store, so a fifth refusal fails the check until it has words and a route. Nothing is disabled to prevent a refusal, so both caps are reachable by hand: 60 emoji save and 61 are refused, and the twenty-first preset is refused while a replacement is still let through. The fourth refusal has a real route — a player who presses Delete twice before the list is drawn again — and the operations read the record out of a ref rather than out of the render that drew the row. **A stored pool the six tiles cannot hold is refused and says why**, rather than clamped: a count over a tile cap or an artifact list off the ladder is unwritable through the interface and reaches the store only by hand. **Step mode draws one sentence and no control**, because a saved pool holds counts. Every control carries a role, an accessible name that holds the name of the pool it acts on, and a state, and the list is walked with real Tab presses against a list derived from the panel itself. Vitest moves from 272 to 279 tests over 28 files. `node scripts/browser.mjs --sheet` moves from 7 checks to 11 and exits 0 at `checks=11 failures=0 skipped=0`. Initial JavaScript moves from 21,152 to 22,532 gzip bytes; the lazy 3D chunk is unchanged at 151,876. Branding gate `files_scanned=124`, `hits=0`, exit 0. Thirteen injections were proved red and every one was restored by editing the injection back. See the notes under this table. |
| 4.4 | Roll log — the screen half: a roll writes an entry, and the history destination reads it | Done. The record view is a shell for Unit 4.5. | #14 | Every roll and every push now reaches IndexedDB through `LogWriter`, and `sheet-history` opens the history destination. **The log's shape decides the write, and the decision is stated: ONE entry per roll, rewritten by every push.** `createLogEntry` takes a whole `RollResult` whose dice carry one value per generation, it derives `pushCount` from the number of generations, and `src/log/csv.ts` rejects a file where one `roll_id` appears twice, so a second entry per push would export a file the application refuses to read back. `src/shell/roll-log.ts` opens the entry on a roll and rewrites it in place on a push, at the key the store acknowledged the insert with. `replaceRoll` in `src/log/store.ts` does that in ONE transaction and checks the key still exists inside it, so a `put` at a trimmed key cannot put a dropped roll back below the oldest. No second store was built. **`profileHash` no longer needs node.** The store half recorded `node:crypto` as unavailable in a browser and named this unit as the one that would settle it. `src/log/sha256.ts` is one synchronous implementation that names no platform API, so the test runner and the browser produce the same digest, and `src/log/sha256.test.ts` holds it against `node:crypto` over every length to 200 bytes and against the published FIPS 180-4 vectors. The pinned digest in `src/log/entry.test.ts` did not move, and the browser wrote `0b489af6...` for the second preset, which is the digest the pure half recorded. **The write is read back out of the database, never out of the queue.** `node scripts/browser.mjs --history` opens its own connection to `clatter-log` and counts: 4 presses on Roll and 6 on Push put 4 entries under 4 distinct roll ids, whose stored push counts sum to 6 and whose stored generations sum to 6. Three counts, one denominator. **The list is counted twice, so the two can disagree.** The summary length is read off the screen and off a second connection to the store at each of three rounds: 1/1/1, 2/2/2, 3/3/3. **The rules core is the oracle for the entry.** `src/shell/roll-log.test.ts` throws a roll and two pushes, then compares every cell of every die and every generation against `score` and `isLocked` under the profile in force, 48 cells against a count taken a second way off the live result, plus the roll-level values against `successCount`, `baneCount`, `generations` and `pushCost`. **The hash is the profile the roll ran under.** The preset changes between two rolls, Decision 10 takes the table from 3 dice to 0, and the two entries carry two distinct digests and name two rule sets. **The destination is a route and not an overlay.** Decision 12 of `docs/design/0012-settled-decisions.md` records it: the roll flow leaves the document, so section 6 still reads eleven visits before the throw and thirty-five after it, in BOTH instruments, with both lists read out of the design. The summary holds exactly `back-button` and `history-list`, read out of section 3 of the design and never restated, and `history-list` is one composite with a roving tab index, 1 of 3 options carrying it, every option holding a role, an accessible name and a state, and no option under the 24 px floor. A real Enter opens the record and the focus lands on `back-button`. **The seven-day note reaches the player**, at `history-storage-note` with `role="note"`, drawing 752x54 px, and it names the seven days, the home screen and the export the plan asks for. **The storage estimate reaches the settings sheet** at `sheet-storage-estimate`, a live region with no tab stop, reading 0.7 MB against the 0.7 MB `navigator.storage.estimate()` answered that run. **A log note is user text and no parser sees it**, drawn through `textContent` in an element holding one node and no element. Constraint 8. Vitest moves from 279 to 302 tests over 31 files. `node scripts/browser.mjs --history` is the new mode at `checks=8 failures=0 skipped=0`, and `--log-store` moves from 13 checks to 13 with one instrument made stronger. Initial JavaScript moves from 22,532 to 28,155 gzip bytes against the 61,440 in `budgets.json`; the lazy 3D chunk is unchanged at 151,876. Eleven injections were proved red and every one was restored by editing the injection back. The captures are `docs/design/0016-history-360.png`, `0016-history-1440.png`, `0016-history-record-360.png` and `0016-history-record-1440.png`. **Open, and owed by Unit 4.4:** nothing. **Left for Unit 4.5:** the transposed matrix and `export-button` inside `history-record`, with the two acceptances row 2.2d carries. See the notes under this table. |
| 4.5 | CSV export — the record view, the transposed matrix and the export control. **Unit 4.5 is now complete, with one owner decision open.** | Done. `BLOCKED:budget` on the import cap. | #15 | `history-record` now holds the transposed matrix of Decision 3 and `export-button`, which closes the open half of Unit 4.5 and carries the two acceptances row 2.2d holds. **The matrix is one row per die and one column per generation**, a real `<table>` with a caption, `scope="col"` and `scope="row"` headers, and a `headers` attribute on every cell naming one row header and one column header, so a screen reader reaches a cell by its row and its column and not by its text. It holds no tab stop, because section 3 lists it under the read-only parts. **Both 2.2d acceptances are counted twice and neither count reads the matrix.** The cell count is the product taken off the stored entry — 18 cells against 9 dice by 2 generations, read back through the harness's own connection to IndexedDB — and the blank count is a second loop over the same stored cells: a die locked at the generation before carries its value forward, and a die that did not exist yet is absent. Both blank kinds are guaranteed by the fixture and not left to the faces: the run keeps one die by hand before the push, and the third rule set adds a stress die BEFORE the re-roll. Every carry is checked to be a carry, 5 of 5 repeating the value of the cell before it. **The export writes the WHOLE log**, and that is forced rather than chosen: Unit 4.6 settled that an import replaces the log, so a file of one roll would delete a campaign when it was read back. Decision 13 of `docs/design/0012-settled-decisions.md` records it, and the button prints the roll count it will write. **The file is compared byte for byte.** The harness intercepts `URL.createObjectURL`, which is the browser's own call, and compares the blob the button handed over against what `exportCsvInChunks` builds IN NODE from the rolls a separate connection read out of the store: 5,200 bytes against 5,200, 5,200 bytes compared, no difference, and 2 of 2 roll identifiers in the file. A log of one roll could not tell a whole-log export from a one-roll one, so the fixture throws two. **The record capture found a layout defect the green suite did not.** Drawn under the eight readings, the matrix sat below the fold of a 360 px screen, which is the width Decision 3 transposed it for. The matrix now comes first and the readings are compact. Captures `docs/design/0017-history-record-360.png` and `0017-history-record-1440.png`. **A manual keep made after the final generation and never pushed is not in the entry, and the matrix is not wrong for such a roll.** The matrix reads `locked` only at the generation BEFORE a cell, to decide whether that cell is a carry, so the newest generation's `locked` is never drawn. The stored field can still miss such a keep, and the export carries the entry unchanged; that is a limit of the entry and it belongs to Unit 4.4, which reported it. Vitest moves from 302 to 321 tests over 32 files. `--history` moves from 8 checks to 15 at `failures=0 skipped=0`, and `--log-csv` from 10 to 11. Initial JavaScript moves from 28,155 to 31,527 gzip bytes against the 61,440 in `budgets.json`; the lazy 3D chunk is unchanged at 151,876. Nine injections were proved red and every one was restored by editing the injection back. **Open, and it is the owner's:** `BLOCKED:budget` — a full-buffer export leaves 4.026 characters a row under the import cap. The arithmetic and the three priced options are in the notes under this table. |
| 4.6 | CSV import — the file picker, the size guard and the message. **Unit 4.6 is now complete, less the error surface Unit 4.10 owns.** | Done. `BLOCKED:budget` on the import cap. | #15 | `import-button` sits in the footer of the history summary and opens a hidden file picker. Decision 13 records why it is there and not in the record: an import replaces the whole log, so it belongs beside the list of the whole log and not beside one roll, and the record then keeps the two controls section 3 names. The picker carries `tabindex="-1"` and `aria-hidden`, so the summary counts three controls and not four. **The size is judged on the FILE, before one byte of it is read.** `src/log/import-file.ts` refuses a file over `MAX_IMPORT_BYTES` from `File.size` and never calls `text()` on it. The proof is a call counter on the file's own `text`: a real `File` of 33,554,433 bytes went into the real picker, the patch is proved to have landed, and the control read the file 0 times. A guard that read `text.length` would have read it once, which is the injection that turns the check red. **The byte cap is not a second budget.** It is `MAX_IMPORT_CHARS`, and one number serves both because UTF-8 never spends fewer bytes than the string spends UTF-16 code units, so a file inside the byte cap is always inside the character cap. The inequality is asserted over a corpus covering all four UTF-8 lengths, not described. **The round trip runs through the real controls.** The file the export button wrote goes back in as a real `File` in a real `FileList` through `DataTransfer`: 136 leaf fields against 136 counted a second way, 0 differences, and the log back at 2 rolls. One extra roll is thrown between the export and the import, so an import that wrote nothing cannot pass — the marker roll must be gone. `RollLog.replace` writes it in ONE transaction through `appendRolls`, and it forgets the open roll, so a push after an import cannot `put` at a key an imported roll now holds. **The message is the smallest honest one, and Unit 4.10 still owes the rest.** `history-message` is a live region in both views and names the cause of every refusal: too large, empty, not a log this application wrote, a header with no roll, unreadable, and a store that refused the write. It quotes the file, so it is drawn as text and no parser sees it. Constraint 8. **What 4.10 owes:** a designed error surface rather than one sentence, a recovery route from a failed import, and the same treatment for the other three failures the plan names — a 3D chunk that will not load, an IndexedDB that will not open, and storage that is full. **Open, and it is the owner's:** `BLOCKED:budget`, the same one Unit 4.5 carries. See the notes under this table. |
| 4.7 | Statistics view — the charts, in a third view of the history destination. **Unit 4.7 is now complete.** | Done. | #16 | Three charts over the record `summariseLog` returns, in `src/shell/statistics.tsx`, drawn in a third view of the history destination. **Decision 14 of `docs/design/0012-settled-decisions.md` records where they live and why**, and section 3 of the design carries the control table: the summary now counts four controls and the statistics view one. The rejected option is a section of the summary, and the reason is Unit 4.5's own defect: a section pushes either the list or the charts below the fold of a 360 px screen. **The screen computes no statistic.** `statistics.tsx` imports no log entry, no push profile and no rule, so there is nothing in it to re-derive a number from. The claim is measured at the CALL SITE and not at the component: the destination is handed a record that disagrees with its own log on all 24 fields, the disagreement is counted first so no field can pass by coincidence, and every drawn value follows the record. **A chart is a table, not a picture.** Every value is text in a real cell that names its row header and its column header, and every bar is `aria-hidden` decoration beside it, so one document serves a screen reader and an eye and the two readings are compared against each other. **The denominator is the record, counted a second way**: 24 values against a sum over the shape of the record, `1 + 2 pool sizes by 5 + 7 push fields + 4 cost units + 2`, so a missing bar is a red and not an unread cell. The oracle for the browser half is `summariseLog` run IN NODE over the rolls a second connection reads out of IndexedDB. **Every bar is measured against the geometry.** In the browser the bar and its track are measured in real pixels and the bound is one device pixel over the track width, 190, 172 and 722 px this run. In the test runner the drawn width is compared against the record with a bound of 0.0005 of a percentage point, taken from the three decimal places the view writes and not chosen; the smallest real difference between two bars of the fixture is 25 percentage points. **Shape carries every meaning colour carries.** Four series, and no chart holds two of one shape: a circle for a success and for a gain, a square for the outcome that did not move, a triangle for the one that went the wrong way. The engine resolved 3 shapes and 3 colours for the three push outcomes. **No chart draws a bane**, because the record holds no bane statistic. **Contrast holds over two denominators.** 13 chart colours are read out of `src/shell.css` by the rule that spends them, resolved against `:root`, and judged at 4.5 to 1 for text and 3 to 1 for a graphical object; the same 13 run over all 6 interface palettes of Unit 4.8 as a product of 78, tightest 4.40 to 1. In the browser 36 colours are read as the engine resolved them, each against the first ancestor that really paints one, 0 missed. **Three degenerate cases answer for themselves**: no roll draws a sentence and no chart, no push reads "No roll has pushed yet." and never a nought per cent, and one roll draws one row. **Keyboard alone reaches the charts and leaves them.** A real Enter on `statistics-button` opens them with the focus on `back-button`, and a real Enter on `back-button` returns to the SUMMARY and not to the dice. The charts hold 0 tab stops. Section 6 is unchanged and measured in both instruments: eleven visits before the throw and thirty-five after it, with both lists read out of the design. Vitest moves from 321 to 334 tests over 33 files. `--history` moves from 15 checks to 21 at `failures=0 skipped=0`. Initial JavaScript moves from 31,527 to 33,449 gzip bytes against the 61,440 in `budgets.json`; the lazy 3D chunk is unchanged at 151,876. Sixteen injections were proved red and every one was restored by editing the injection back, with the three touched files hashed against a saved copy. The captures are `docs/design/0018-history-stats-360.png` and `0018-history-stats-1440.png`. **Open, and owed by Unit 4.7:** nothing. See the notes under this table. || 3.6 | Sound — the interface half: the toggle, the volume, and the engine wired to the tray. **Unit 3.6 is now complete.** | Done | #19 | `sheet-sound` holds a checkbox and a slider, and `src/shell/table.tsx` hands the tray an `onImpact` hook that reaches the engine the screen holds. A roll in the built application started 82 voices, counted through the browser's own `AudioBufferSourceNode.start` rather than through any counter the engine writes. The level is read off the `GainNode` the engine built, at 0.75 and at 0.25, both set by real arrow presses. Decision 17 of `docs/design/0012-settled-decisions.md` records the choices and section 4 of `docs/design/0002-screen-design.md` lists both controls. Two accessibility defects were found by the checks and fixed: the slider took its name from the label around it, which reads the level twice, and it drew itself 20 px tall against a 24 px floor. See the notes under this table. |
| 3.8 | Performance gates and the phone overlay — the overlay half. **Unit 3.8 is now complete. The owner still owes the phone reading.** | Done | #19 | `sheet-overlay` shows four readings over the screen: p95 and p99 frame duration, the long-task total, and throw-to-first-motion. **It reports and never gates**, which is what the End state of `CLAUDE.md` asks of a timing figure. Every line names its unit and its sample count, a percentile below a floor derived from its own quantile is refused, and a figure this browser cannot measure is named rather than printed as a zero. Frames are sampled inside a throw and nowhere else. Decision 18 records every choice. The desktop reading is in the notes and is NOT the phone reading the plan asks for. See the notes under this table. |
| fix | The pointer probe aimed where no pointer can land | Done | #20 | `--table` lost a die to the pointer route on some throws, with `die-at2 did not answer the click`. **Neither candidate cause was the cause.** The die was not buried: `unreachable=0` on every failing run, and the two dice that were lost held 1,415 and 1,820 whole pixels of their own front surface. The die cells did not eat the press either: the click reached the canvas, and `pointer-events: none` of Decision 9 held at every point measured. **The cause is the probe.** It walked outwards from a die's centre and returned the FIRST point that belonged to the die, which lies on the boundary with whatever covers the centre, by construction. That point is fractional, and the driver rounds every pointer coordinate to a whole pixel — `Math.round` in `node_modules/puppeteer-core/lib/puppeteer/bidi/Input.js`. The press therefore landed across the boundary and the neighbour took it. Measured at seed 108: the aim read `(232.626, 495.087)` where the raycast answers die 22, the rounded point `(233, 495)` answers die 7, and `die-sk3` toggled instead of `die-st8`. **The fix is a construction, not a rule.** `window.__clatterAim` scans the whole pixels the die's projected disc covers, keeps the ones where the die is the frontmost body, and answers the one furthest from any pixel that is not, by a Chebyshev distance transform. The answer is a whole pixel, so rounding changes nothing, and it is the point deepest inside what the player sees. One implementation serves `--table` and `--affordance`. `CLICK_PROBE_RINGS` and `CLICK_PROBE_ANGLES` are gone and nothing replaced them: the scan has no free parameter. **No shipping file changed.** The pointer route was already correct. Over 64 throw seeds at 1440x900 the mode now reads `passed=64 of 64` at `checks=10 failures=0 skipped=0`, against 2 red in 32 before the fix, and seed 2107814439 passes. `table.every-aim-is-a-whole-pixel-the-pointer-can-address` is new. The pointer check now counts `refused` against the dice the screen draws as images and `toggled` against the dice it draws as buttons, and the key route counts the same split through a different instrument, so a die a neighbour hides can no longer be absorbed into a refusal. **`BLOCKED:owner-gate` on the small tray.** At 360x760 the heap buries a die in 7 of 24 throws and the pointer route cannot reach it. The keyboard route reaches every die at every width. See the notes under this table. Three red-proofs passed. Initial JavaScript 43,390 gzip bytes, the lazy chunk 151,876, the render counters 841, 842 and 77, and `npm run perf` 203 steps with the scene digest unchanged — every one of them unchanged, because no shipping file moved. |
| 4.10 | Error surfaces. **Unit 4.10 is now complete.** | Done | #21 | One error surface, four rows, no control. **Decision 19 of `docs/design/0012-settled-decisions.md` settles the shape** and section 3 of `docs/design/0002-screen-design.md` lists it under the read-only parts, so the control budget of section 3 and both keyboard walks of section 6 are unchanged. `src/shell/faults.ts` holds eight faults over four slots, and the denominator is PARSED out of the union declarations of the five modules that refuse: 27 declared outcomes, 9 with a surface and 18 with a written reason for none. `node scripts/browser.mjs --faults` drives six of the eight to their real failure and reads the surface off the screen, `--faults --quota-kb` drives the seventh, and the eighth prints `NOT JUDGED` with its reason. Every recovery route is TAKEN, and two of them had the wrong words until the route was taken. Seven red-proofs. Initial JavaScript 43,390 to 44,486 gzip bytes against the budget in `budgets.json`, with the branch point measured in a throw-away worktree rather than remembered. See the notes under this table. |
| 4.11 | Accessibility gate. **Unit 4.11 is now complete. Phase 4 is closed.** | Done | #22 | A keyboard-only run from an empty pool to a pushed result, in CI, with N read out of the design and never restated. `node scripts/browser.mjs --a11y` presses real Tab, arrow, Enter and Escape keys at both drawn widths and takes no pointer at all, counted by the page itself. `src/app.test.tsx` runs the same journey under jsdom. The audit is **axe-core 4.13.0, MPL-2.0, pinned exactly**, and Decision 20 of `docs/design/0012-settled-decisions.md` settles the licence: MPL obligations attach to distribution, this repository distributes none of the covered files, and `scripts/check-bundle-size.mjs` proves it with a calibrated marker. It ran 90 rules and found **two real defects, both fixed here**: seven buttons nested inside the `role="slider"` difficulty, and the cost row outside every landmark. **The disclosure sheet is a real modal at last** — it carried `aria-modal="true"` with no hold on the Tab key from Unit 2.1 to Unit 4.10. The two stale count sentences in section 6 of the screen design are corrected, and a check now reads every sentence of that document that states a walk count. CI judges the whole gate on the flat dice and prints the 3D half as NOT JUDGED, `skipped=1`. See the notes under this table. |
| 5.1 | Offline — the mount, judged on a graphics card. **Unit 5.1 is now complete.** | Done | #23 | **The check the earlier row called unjudgeable is now judged, and nothing in this repository changed to do it.** `node scripts/browser.mjs --offline --hardware` ran on this host with the sandbox off, on `AMD Radeon RX 6700 XT (radeonsi, navi22, ACO, DRM 3.64, 7.1.7-200.fc44.x86_64)`. The run reads `checks=8 failures=0 skipped=0`, against `checks=8 failures=0 skipped=1` on 2026-08-09. `offline.the-lazy-3d-chunk-mounts` is green rather than `NOT JUDGED`: the status line reads `"a canvas on the table"`, the page holds 1 canvas element, and the renderer choice of Unit 3.7 reads `tray`. **The tray mounted from the precache with the origin stopped.** The harness confirmed `origin_unreachable=true` before the reload, the worker holds 8 entries over 1 cache, and the lazy 3D chunk answered `status=200` over 596,587 bytes with the server down. So the plan's acceptance — the application loads with the network disabled after one visit — is proven with the tray mounting, and not only with the flat renderer. **Two things made it judgeable, and both are outside this unit.** The owner added `node scripts/browser.mjs*` to `sandbox.excludedCommands` on 2026-08-09, and Unit 3.5's screen half put the tray inside the application. The earlier skip was a statement about the sandbox, not about the code, which is why the row said so by name rather than passing by omission. **Nothing was re-scoped.** The open item read "The `--hardware` run stays with the owner", and the `--hardware` run has now been made. See the notes under this table. |
| 5.2 | Release — the README, the version and the tag. **Unit 5.2 is now complete.** | Done | #23 | The README describes the application as it now stands, the version is `0.1.0`, and the tag `v0.1.0` is cut from the merge commit of #23. **The README was rewritten, not patched.** It was written when the application held a pool builder and flat dice, and fourteen units landed after it. It now names the pool builder and both modes, the roll, the push and its cost preview, the 3D table and the flat fallback with the recorded permanent fall, the three marks on the dice, the synthesised sound, the three theme axes and the colour builder, the roll log with its record view, its three statistics and its CSV export and import, the share card, the four overlay readings, the error surface, the keyboard route and offline use. **Every claim was checked against the code or against a ledger row, and the four errors the first README made were checked for by shape.** The fallback claim is read off `src/shell/renderer.ts`, which also corrected a draft sentence: the fall is permanent but the player can ask for the table again, and only a platform below the bar cannot. The `npm test` claim is read off the `test` script in `package.json` and states plainly that it drives no browser. The claim about other tools stays the narrow one about 3D integrations. The file holds no semicolon and no marketing adjective, checked by grep. No budget is retyped: the README points at `budgets.json`, and the log capacity points at `RING_CAPACITY` in `src/log/store.ts` rather than restating 5,000. **The version is `0.1.0` and not `1.0.0`.** The application is feature-complete through Phase 4 and Unit 5.1, and the owner gate at Unit 5.3 has not run, so it has never been judged on real hardware. A major version would claim a stability nobody has reviewed. **The branding gate, over all four surfaces:** `files_scanned=160 binary_skipped=91 unreadable=0 enumerated=251 terms_loaded=24`, `hits=0`, `surfaces=tracked,dist,commits,metadata`, and the wrapper reads `accounted=251 expected=251 tracked=241 dist=10`, exit 0. The metadata surface was fed a real `gh api repos/WilderSelf/clatter` reading of a 105-character description and 6 topics, which the owner set. **The gate reads four surfaces and a release is not one of them.** See the notes under this table. |


## Unit 4.11 — the accessibility gate

The plan asks for two things and says which one matters: "a pinned, named automated audit in CI,
plus a scripted keyboard-only run asserting focus visits *N* named elements in order, from empty
pool to pushed result", and then, "an axe-core run on a canvas app passes even when the app is
unusable by keyboard, so the scripted run is the real check." Both landed. The audit found two real
defects on its first run anyway.

### What the gate is, and which half CI judges

| Instrument | Where it runs | What it judges |
|---|---|---|
| `src/app.test.tsx` | `npm test`, so every pull request | The whole journey under jsdom: both walks, the live region after the roll and after the push, the sheet as a modal, and every sentence of the design that states a walk count. |
| `src/a11y/audit.test.tsx` | `npm test` | axe-core over six states of the screen. |
| `src/a11y/shape.test.tsx` | `npm test` | Shape against hue, over a denominator that grows by itself. |
| `node scripts/browser.mjs --a11y --no-webgl` | CI, a new step | The same journey with REAL key presses, at both drawn widths, plus the sheet driven off both ends and the audit over a laid-out page. |
| `node scripts/browser.mjs --a11y --hardware` | The owner's machine | The same run again with the 3D table mounted. CI cannot: it has no graphics card. |

**CI judges everything but the 3D table.** The walk is one list in both renderers, which section 6
states and Decision 9 settles, so a run on the flat dice walks the same names. The table half prints
`NOT JUDGED` and counts in `skipped=1`. On this host with `--hardware` the same run reads
`window.__clatterTable` and judges it: 33 checks, 0 failures, 0 skipped, with the table mounted at
both widths.

### N is fixed where the design states it

Both lists are read out of section 6 of `docs/design/0002-screen-design.md` by every instrument, and
neither one restates them. The document states each walk three ways — a count in words, a numbered
list, and a sentence splitting the list into Tab stops and arrow visits — and all three are compared
against each other before the screen is asked anything. A visit added, removed or reordered fails
against a number nothing in the screen wrote.

### The journey, and what jsdom cannot do

Everything before this unit walked ONE state: the screen mounted at rest A, or mounted at rest B over
a fixture. Two walks of two mounted states say nothing about the journey between them. The gate now
builds the pool with the arrow keys, throws with Enter on the roll button, walks the table, and
pushes with Enter on the push button, in one run.

jsdom runs no sequential focus navigation and no default activation behaviour, so a Tab press and an
Enter press both do nothing there. The jsdom half therefore enumerates the tab stops the way the
specification defines them, and an activation asserts the focused element is a `<button>` — which is
what makes Enter activate it — before it clicks. The browser half presses the real keys, and it
counts the pointer events the page saw: 0 over the whole journey, at both widths, read off the page's
own listeners rather than claimed by the runner.

### A harness fault that would have made every later keyboard run a lie

**A walk that presses Tab past the last control hands the focus to the browser's own chrome, and
after that no key activates anything.** The page keeps its `document.activeElement` and still takes
key events, so a walk carries on working and a Tab press still moves the focus ring. But
`document.hasFocus()` is then false, and a browser performs no DEFAULT ACTION for a document that
does not hold the focus. Measured on this host on 2026-08-10: 40 Enter presses on a focused, enabled
roll button produced **0 click events**, with no error anywhere, and the same button took 6 clicks
from 6 presses once the focus was back.

Six ways of asking for the focus back were measured. `bringToFront`, `window.focus()` and a real
mouse press in the content area all left it false. A reload, a navigation, and a resize followed by a
navigation each worked sometimes and not others — four navigations in a row failed once. A new tab
always works, because a new tab is the active tab. So every phase of this mode opens a tab of its
own and closes the one before it, and every phase reads `document.hasFocus()` and reports it as a
check of its own. A run that cannot press a key now says so, instead of failing as though the screen
were wrong.

The walks are also BOUNDED now: `walkShell` takes the number of authored visits a caller expects and
stops ON the last one rather than one press past it. The press past the end is what costs the focus,
so it is asked once, in a phase of its own, as the last thing the mode does with the keys —
`a11y.rest-a-ends-where-the-design-ends` and `a11y.rest-b-ends-where-the-design-ends`. Without that
phase the bound would have hidden a control appended after the last stop.

### The four items handed to this unit, and what became of each

**1. The stale count. Fixed, and a check now reads every such sentence.** Section 6 said "The
authored counts stay eleven and thirty" in TWO places, not one: the browser-stop paragraph and the
3D-table paragraph under it. Both said thirty while the same section listed thirty-five. The list was
re-derived at the draw target of 30 dice before Unit 2.2 shipped and these two sentences kept the old
figure. No check read them, so both instruments passed over a false statement for eight units, and
Units 2.3 and 3.7 each reported it. The check that now reads them takes every sentence of the
document that names a walk, keeps every number word of nine or more in it, and holds each one against
the set the two numbered lists derive — the two counts, their sum, and the two zone lengths. Eleven
such numbers are checked today and the check states its own count. A third sentence cannot drift
alone.

**2. The sheet was not a modal. It is one now.** `aria-modal="true"` is a promise made to a screen
reader: it tells the reader to ignore everything outside the dialog. It tells the Tab key nothing.
The sheet carried the attribute from Unit 2.1 and nothing held the keyboard, so a Tab off the last
control landed on the roll button behind a sheet a reader had been told was hidden. Units 4.1, 4.2,
4.3, 4.8, 4.9, 3.6 and 3.8 each added controls behind that promise. `src/shell/focus-trap.ts` now
answers which elements inside a container the Tab key reaches, and the sheet wraps at both ends.
Decision 21 records the option it was taken against, which was `inert`.

Proved by measurement rather than by claim: 80 Tab presses and 80 Shift and Tab presses inside the
open sheet, every one landing inside it, 36 distinct stops reached in each direction. 80 is more than
the sheet holds stops, so the walk wrapped several times rather than running out. The enumeration is
a claim about the browser, so `src/app.test.tsx` also asserts that every `sheet-` control the design
lists is inside it — a control missing from the enumeration would be unreachable, which is the
failure a trap introduces. Closing returns the focus to `disclosure-toggle`, by Escape and by
`sheet-close`, which section 4 already required.

**3. `--history` was run 26 times and did not fail once.** Unit 4.7 recorded one run in nine
reporting `failures=1` with the name lost to an output filter. Every run here kept its whole output,
so a repeat would have named its check. All 26 read `checks=21 failures=0 skipped=0`, exit 0.

**What 26 clean runs rule out, stated honestly.** They do not find the fault and they do not prove it
absent. At a true rate of one in nine, the chance of 26 clean runs is `(8/9)^26`, which is 4.7 per
cent, so a one-in-nine fault is ruled out at about 95 per cent confidence. A rate of one in fifty
would give 59 per cent, and is not ruled out at all. The honest reading: whatever failed once in Unit
4.7 is rarer than one run in nine, and this is as far as 40 minutes of runs can settle it. The item
is closed as bounded, not as fixed.

**4. The viewport, and a run that skips quietly.** Two decisions, 22 and 23. The gate sets its own
viewport and runs the whole journey at 360 by 760 and at 1440 by 900, which are the widths the design
is drawn at; the harness default of 800 by 600 is neither. The default itself is unchanged, because
every other mode carries recorded numbers taken at it — the scroll-stop readings in section 6 among
them — and moving it would silently re-measure all of them. And `--a11y` refuses to run unless the
run DECLARES what the machine can draw: `--hardware` or `--no-webgl`. Unit 4.10 recorded a sandboxed
run that reported `renderer unreadable`, skipped its 3D checks and exited 0. That is now a failure by
name.

### The audit, the licence, and the two defects it found

**axe-core 4.13.0, MPL-2.0, pinned to an exact version.** Decision 20 settles the licence in full and
prices four alternatives from figures read off the npm registry on 2026-08-10. The short form: MPL-2.0
is a file-level licence whose obligations attach to DISTRIBUTING the covered files; this repository
distributes none of them; running a tool is not copying from it; Constraint 2 forbids copying from a
GPL-3.0 source, which is a different act against a different licence. The installed tree already
carries three MPL-2.0 packages and one CC-BY-4.0 package, all from Vite 8, so the rule as practised
covers what ships. The alternatives each trip a different clause: `html_codesniffer` is BSD-3-Clause
and six years without a release, `accessibility-checker` is Apache-2.0 and pulls `chromedriver`,
`puppeteer` and a telemetry package, and `pa11y` is LGPL-3.0-only.

**The claim that it never ships is checked, and the check calibrates itself first.**
`scripts/check-bundle-size.mjs` reads two markers out of the tool's own file, fails loudly if either
one is no longer there, then scans every file of `dist/` for them. The package name alone is not a
marker: the vendored physics writes `axes:`, and a marker that matches by accident is as bad as one
that matches nothing.

**It found two real defects, both fixed here rather than declared.**

1. `nested-interactive`, serious, on `.track`: seven notch buttons inside the `role="slider"`
   difficulty control. A notch is a hit target and never a control — the arrow keys change the value
   and the slider itself takes them — so the notches are spans now.
2. `region`, on `.cost-t`: the cost row sat outside every landmark, because the footer was a plain
   div. It is a `<footer>` now, so the header, the middle and the action bar are the three regions of
   the screen.

After both fixes: 0 violations over six states under jsdom and over two states in a real browser,
with at least 90 rules running in each. The one rule jsdom cannot decide, `color-contrast`, is
declared in the file with the three instruments that judge the same claim for real, and the
comparison is set equality, so a second undecided rule is a red.

### Shape carries every meaning colour carries, over one denominator

Units 3.5, 4.4, 4.5 and 4.7 each proved their own surface. Four proofs cover four surfaces and say
nothing about a fifth. `src/a11y/shape.test.tsx` asserts the rule once, over two denominators that do
not read each other:

- **The stylesheet.** Every rule that spends `--mark-success` or `--mark-bane` is collected. A mark is
  a FILLED glyph, so a rule where the meaning colour is the background must carry a shape
  declaration. Every rule that spends the colour on text or on one edge is named with its reason —
  three of them, all warnings and not marks — and the comparison is exact.
- **The document.** Every element the screen draws carrying one of the classes the stylesheet just
  named must be owned by one of four declared surfaces: the status line, a flat die, the history
  summary list and the history record matrix. Each surface must be found, and each must draw BOTH
  marks.

The chart glyphs spend the chart inks rather than the two mark colours, so they carry their own rule
and their series come from `CHART_SERIES` rather than a list typed here. The 3D table draws no mark
at all: the cell over the table draws no die, because the die under it is the one the player reads,
so the check there is that every cell's accessible name states the face and what it is worth.

### Every roll result reaches a live region, read rather than asserted to exist

The region is READ after the roll and after the push, in both instruments, and every figure in it is
compared against a figure written elsewhere in the same render: the successes and the banes against
the sum over the dice on the table, the dice count against the design's own list, and the stress
against the value the keys put on the stress tile. The two sentences must also differ, so a region
that never updated fails.

**One limitation, stated.** The draw target needs every tile at its cap, so the stress tile is at its
cap before the push, and `pushNow` holds the counter there while the core adds the die. The rise is
therefore read off the table — 30 dice become 31 — and not off the counter. Section 8 of the design
draws that state and says the reading is at its cap and is marked.

### The red proofs

Every check added here was shown to fail on the defect it was written for, by an injection that was
edited back afterwards. No saved bytes were restored by a version-control command.

1. **The stale count.** Injection: the sentence put back to "eleven and thirty". Failure:
   `every count the document states about its walk is one of its own: expected [ Array(1) ] to deeply equal []`
   with `"30 is not one of [9, 11, 21, 35, 46] in \"The authored counts stay eleven and thirty.\""`.
2. **The keyboard walk.** Injection: `tabIndex={0}` on the status line. Failure:
   `the walk of the empty pool: expected [ 'status-line', …(11) ] to deeply equal [ 'collapse-button', 'pool-bar', …(9) ]`.
3. **The live region.** Injection: the spoken sentence printed `successes + 1`. Failure:
   `the roll reached the live region: expected '6 successes. 4 banes...' to be '5 successes. 4 banes...'`.
4. **The focus trap, under jsdom.** Injection: the Tab branch of the sheet's handler returned early.
   Failure: `a Tab at the last stop is refused: expected false to be true`.
5. **The focus trap, in the browser.** The same injection, rebuilt and re-run. Failure:
   `a11y.the-focus-cannot-leave-the-sheet-in-either-direction 80 Tab presses and 80 Shift and Tab presses landed inside the sheet every time: 12 escaped forwards and 12 backwards`,
   against 0 and 0 with the trap in place, and 43 distinct stops instead of 36 because the walk
   reached the screen behind.
6. **Shape against hue.** Injection: `.tally-s` and `.tally-b` added to the stylesheet, each spending
   a meaning colour with no shape. Failure:
   `every mark carries a shape and not a hue alone: expected [ '.tally-s', '.tally-b' ] to deeply equal []`.
7. **The audit.** Injection: the notches put back to buttons. Failure:
   `the audit reports no finding it can decide: expected [ …(2) ] to deeply equal []` naming
   `rest A, the empty pool: nested-interactive (serious) x1 at .track`.
8. **The audit never ships.** Injection: `<!-- axe.version -->` appended to `dist/index.html`.
   Failure: `bundle-size: FAIL dev_only_tool axe-core@4.13.0 markers=2 files_scanned=10 hits=1` and
   `dist/index.html holds "axe.version"`, exit 1.

### Measurements

**Validation.** `npm run lint` 0, `npm run typecheck` 0, `npm test` 0 over 466 vitest tests in 44
files plus the node suites, `npm run build` 0.

**The harness.**

```
node scripts/browser.mjs --a11y --no-webgl   checks=33 failures=0 skipped=1
node scripts/browser.mjs --a11y --hardware   checks=33 failures=0 skipped=0
node scripts/browser.mjs --history           checks=21 failures=0 skipped=0, 26 runs
```

**The bundle.** Initial JavaScript 44,828 gzip bytes and the lazy 3D chunk 151,876 gzip bytes, both
inside the ceilings `budgets.json` holds. The initial figure rose by 342 bytes over Unit 4.10, which
is the focus trap and the footer element. **The audit is 3,113,323 bytes unpacked and adds nothing
to either figure**, which is the whole reason it can be taken.

**The render counters and steps to rest.** `npm run perf` exit 0: steps 203 over five runs with a
spread of 0, against the budget, and the scene digest unchanged.

**The branding gate.** `files_scanned` moved with the new files and `hits=0`.

### Reported, not fixed

- **`--history` reports `renderer unreadable` on this host and skips nothing.** That mode needs no
  graphics card, so the reading costs it nothing. It is noted because item 4 of this unit is about
  exactly that reading meaning less than it looks: in `--a11y` it is now a failure by name, and every
  other mode keeps the behaviour it had.
- **The harness default viewport is still 800 by 600.** Decision 22 says why it was not moved.
- **`.claude/skills/run-clatter/SKILL.md` does not name the `--a11y` mode.** That path is deny-listed
  to the agent, so the owner has to add it. The usage block at the head of `scripts/browser.mjs`
  carries the whole description in the meantime.

## Unit 4.10 — the error surfaces

The plan names four failures: the 3D chunk fails to load, IndexedDB will not open, an import is
malformed, and storage is full. Every one of them was already DETECTED before this unit, and each
answered with a record rather than a throw. What was missing is what the player is TOLD, and what
the player can do next.

### The denominator is parsed, not written

A list of failures written by hand agrees with itself for ever. So `src/shell/faults.test.ts` opens
the source of the five modules that refuse, parses the union declarations with the TypeScript
compiler, and asserts `SOURCE_REFUSALS` against them in both directions.

| Union | Module | Outcomes |
|---|---|---|
| `OpenResult` | `src/log/store.ts` | 4 |
| `AppendResult` | `src/log/store.ts` | 3 |
| `ReplaceResult` | `src/log/store.ts` | 4 |
| `ImportOutcome` | `src/log/import-file.ts` | 2 |
| `RecordOutcome` | `src/shell/roll-log.ts` | 5 |
| `OpenRollLogResult` | `src/shell/roll-log.ts` | 4 |
| `FlatCause` | `src/shell/renderer.ts` | 3 |
| `SettingsStoreResult` | `src/settings/local-store.ts` | 2 |

Twenty-seven outcomes. Nine raise a fault. Eighteen raise none and every one of them carries a
written reason, which the check holds to a length so an empty excuse cannot pass. A success is the
commonest of those, and two are not: `ReplaceResult.gone` is a roll the ring buffer dropped between
two throws, which the caller writes again as a new roll, and `RecordOutcome.skipped` is an automatic
failure that puts no dice on the table. The claim is about the DECLARATION, so the declaration is
what is read; a check over the built bundle would report what a bundler kept.

**A second denominator sits under `ImportOutcome.refused`.** One outcome, twelve codes, twelve
sentences. `CsvRejection` in `src/log/csv.ts` declares nine and `ImportRejection` in
`src/log/import-file.ts` adds three of its own, and `IMPORT_REJECTION_WORDS` is asserted against the
parsed union.

### The fifth case, and the sixth, seventh and eighth

The plan names four. The code answers eight, and the four the plan did not name are:

- **Another tab holds the log** (`blocked`). It is not a full disk and it is not a refusal, and the
  player has a different thing to do about it.
- **The log stopped** (`error`). A connection the browser closed under the application.
- **The browser keeps no settings.** `localSettingsStore` answered a bare null, so the refusal had
  no name to give a surface. It is now `openSettingsStore`, which answers `open` or `refused` with a
  reason, and `localSettingsStore` is built on it, so no caller changed.
- **A platform that cannot draw the table at all**, which is a different sentence from a table that
  did not load, because the toggle back cannot clear it.

### One surface, four slots

Decision 19 records the shape. Eight faults over four rows, because the faults inside one slot cannot
hold at once: a log that refused to open writes nothing, so it cannot then be full. The row count on
the screen is therefore the slot count and never the fault count, which is what bounds the surface at
360 px.

**The banner holds no control, and that is forced rather than chosen.** Both keyboard walks of
section 6 are fixed at eleven visits and thirty-five. A control that appeared with a fault would move
them. Every recovery route is a control that already exists, and the row names it.

**The banner is the live region and the rows inside it are not.** Unit 3.7 gave the flat-dice notice
`role="status"` when it was the only surface there was. That row keeps its name — it is the same
notice — and gives up its role, because a live region inside a live region is announced twice.
`--blocked-chunk` now reads the role off the banner and asserts the row carries none.

### Two recovery routes had the wrong words until the route was taken

Both were found by driving the route, not by reasoning about it, and both are now measured on every
run rather than quoted from one day.

1. **A refused chunk.** The first draft said "Open More to ask for the table again." Measured: the
   toggle alone can never bring the table back. A dynamic import that failed once is remembered by
   the module map, so the same document makes NO second request at all — after the toggle the
   chunk's resource list still held one entry of zero bytes. The screen falls again, correctly, and
   the player is no better off. The words now read: reload this page, then open More and switch the
   table on. The reload has to come first, because the stored fall keeps the dice flat until the
   toggle clears it, and the toggle is what asks the fresh document for the chunk. The whole route
   is then taken with the keyboard alone and the state is read after it: `renderer=tray`,
   `canvases=1`, the row empty.
2. **A full store.** The first draft said "Export the log from the history. Then make room on this
   device." Measured: making room is not enough. A transaction that aborts on the quota leaves the
   connection unusable, so the next throw answers `error` and not `full`, and the log still held one
   roll. The words now read: make room on this device, then reload this page. After the reload the
   log moved from 1 roll to 2 and the banner is clear.

Both orders are one check each, and each check measures the FIRST step alone before it measures the
whole route, so a change that repairs either one turns the check red rather than leaving a stale
instruction on a player's screen.

### No code identifier reaches the player

Unit 4.4 found `1 ratingPoint` and `pool-banes-damage-ratings` printed on a player's screen and only
a capture caught them. This unit had the same defect waiting in it: `importCsv` throws a message
naming a column, a line and a value, and `readImportFile` printed that message straight at the
player. In a file the player did not write, the column name is whatever the file says it is.

So every rejection now carries a CODE. `CsvRejected` is an `Error` with a `rejection` field, every
throw site goes through one `reject` call, and every existing message is unchanged so every existing
check still reads what it read. The screen reads its words off the code and the message stays in
`detail`, which nothing draws.

The check has two halves and both are needed:

- **Shape.** Every string these surfaces can print is enumerated from the tables — the faults, the
  twelve rejections, the four probe readings and the four sheet notes — and held against seven
  shapes an identifier takes and prose does not: a camel-case join, an under-score join, a hyphen
  join of three or more words, a back tick, a brace or an angle, a dotted path, a run of capitals and
  a call. **A single lower-case word is not on that list and cannot be**: `value`, `mode` and `note`
  are all columns of the export schema and all ordinary English, so a rule against them would ban the
  words a player needs. What marks an identifier on a screen is that it is COMPOUND.
- **Membership.** The compound identifiers this code actually uses — the fault kinds, the slots, the
  row names, the export columns, the rule-set identifiers, the probe readings and the rejection codes
  — are compared against every printed string. This is the half that names
  `pool-banes-damage-ratings`, which the shape half can only call a hyphen join.

### Constraint 8, and the case it was written for

A malformed import can carry hostile text. The run feeds a real `File` through the real picker whose
first column is `<img src=x onerror=alert(1)>`, and three things are asserted: the surface quotes no
part of the file, the whole destination holds that string nowhere as text, and the destination holds
no image. The file NAME is still drawn on a successful import, because a player picked it and needs
to know which file answered, and that is user text through `textContent`. Both halves are asserted.

### What was driven, and how

Nothing here hands a fault to a component. A check that renders the surface with a hand-made prop
proves the words and never the wiring.

| Fault | How the run reaches it |
|---|---|
| `settings-refused` | `localStorage` raises the error this browser really raises on an opaque origin, read out of a sandboxed frame first |
| `log-refused` | `indexedDB.open` raises that same measured error, which is the route Unit 4.4 built |
| `table-absent` | every WebGL context is refused before the first line of the page runs, and the probe answers `tray=false` |
| `table-lost` | the 3D chunk is refused at the network layer, with the service worker and every cache removed first, which is the route Unit 3.7 built |
| `log-error` | another connection asks the browser to delete the database. The application's own `versionchange` handler closes its connection, which is its own code and not an injection |
| `import-refused` | a real `File` through the real picker |
| `log-full` | `--quota-kb` launches the browser with its own storage limit and the browser raises `QuotaExceededError` |
| `log-blocked` | **NOT JUDGED**, and counted in `skipped=` |

**The skip, named.** A blocked open needs an UPGRADE for another connection to hold off, and
`DB_VERSION` is 1, so no upgrade exists to block in the shipped application. The store's own
`blocked` answer is driven against the real mechanism by `--log-store`, which opens a second
connection at version 1 with no `versionchange` handler and asks for version 2. The surface for it
is asserted under jsdom. It becomes judgeable the day `DB_VERSION` rises.

**The control.** The first phase of the run loads the application with a store, a database and the
chunk all in place, and asserts the banner holds four rows, none of them with text and every one
`display: none`. Without it every check below would pass against a banner that always said
something.

**Two of the five are real under jsdom as well**, which is why they are measured there too: jsdom
exposes no `indexedDB`, so `openLog` answers `refused` from the real call, and `store` of null is
what `localSettingsStore` answers where the browser refuses `localStorage`.

### The captures, all read after they were written

Six surfaces at 360 px: `docs/design/0024-fault-nothing-kept-360.png`,
`0024-fault-table-absent-360.png`, `0024-fault-table-lost-360.png`, `0024-fault-log-stopped-360.png`,
`0024-fault-import-refused-360.png` and `0024-fault-storage-full-360.png`. Every one reads at a
phone width, the instruction sits on its own line in bold, and two faults at once still leave the
builder usable.

**Seen in the captures, and stated rather than fixed:** a fault and the seven-day storage note look
the same — both are a shaded pad with a marked left edge at full ink. Decision 19 records that as
deliberate: they are the same kind of thing to a player. The differences are the bold instruction and
the announcement.

### The red proofs

Seven injections. Each file was copied outside the repository first and restored by editing the
injection back, and every restored file is byte-identical to its copy. No checkout and no stash
touched any file.

| # | The injection | The gate that went red |
|---|---|---|
| 1 | a fifth outcome `evicted` added to `AppendResult` | `reads every declared outcome out of the source: expected [ …(27) ] to deeply equal [ …(28) ]`, and the difference names `src/log/store.ts AppendResult.evicted` |
| 2 | a rule-set identifier put in the words for a full store | `FAULT_TEXT log-full holds a hyphen join of three or more words`, and `FAULT_TEXT log-full names pool-banes-damage-ratings` |
| 3 | a camel-case identifier put in the words for a stopped log | `FAULT_TEXT log-error holds a camel-case join: The log stopped after 1 ratingPoint.` |
| 4 | a tenth rejection added to `CsvRejection` with no words | `holds words for every import rejection: expected [ …(10) ] to deeply equal [ …(11) ]` |
| 5 | a Dismiss button added to every row of the banner | under jsdom `visits the eleven named items of section 6: expected [ 'fault-dismiss', …(11) ] to deeply equal [ 'collapse-button', …(9) ]`, and `the banner holds no tab stop: expected to have a length of +0 but got 2` |
| 6 | the log open raises no fault | in the browser `filled=[settings-refused]` and `faults.a-browser-that-keeps-nothing-says-so-and-says-what-is-lost` went red |
| 7 | the parser's own message printed at the player | in the browser the row read `csv import: column 1 is named "<img src=x onerror=alert(1)>". The export schema holds no such column.` and `faults.a-malformed-file-is-refused-in-the-player-s-own-words` went red |
| 8 | the route back never clears the recorded fall | in the browser `checked_after=false renderer=flat` and `faults.the-route-back-from-a-refused-chunk-works-when-it-is-taken` went red |
| 9 | a row renamed in the design document | `one name per slot: expected 3 to be 4` |

### Measurements

| Command | Exit |
|---|---|
| `npm run lint` | 0 |
| `npm run typecheck` | 0 |
| `npm test` | 0, over 455 vitest tests in 42 files plus 23 node tests |
| `npm run build` | 0 |
| `npm run perf` | 0, 203 steps against the 224 in `budgets.json`, scene digest unchanged |

Harness modes, all outside the sandbox on the graphics card, every one exit 0:

    --faults            checks=15 failures=0 skipped=2
    --faults --quota-kb checks=11 failures=0 skipped=7
    --blocked-chunk     checks=11 failures=0 skipped=0
    --history           checks=21 failures=0 skipped=0
    --shell             checks=8  failures=0 skipped=0
    --sheet             checks=11 failures=0 skipped=0
    --table             checks=10 failures=0 skipped=0
    --offline           checks=8  failures=0 skipped=0
    --tray              checks=7  failures=0 skipped=0
    --log-store         checks=13 failures=0 skipped=0
    --log-csv           checks=11 failures=0 skipped=0
    --settings-store    checks=6  failures=0 skipped=0

The two `--faults` runs cover seven of the eight declared faults between them and each one names
what it left to the other. The eighth is the named skip above.

Section 6 reads eleven visits before the throw and thirty-five after it, in both instruments and in
both renderers: `--shell` with the 3D table running, `--blocked-chunk` with the chunk refused, and
`src/app.test.tsx` under jsdom. The jsdom walk now runs with TWO faults on the screen, counted before
it walks, so it is a walk of a screen that has something on the banner and not of a clean one. Both
lists are read out of the design.

The two bundle figures are read from `dist/` by `scripts/check-bundle-size.mjs` against
`budgets.json`: initial JavaScript 44,486 gzip bytes and the lazy 3D chunk 151,876, both inside
their budgets. The initial figure rose by 1,096 bytes over the branch point, which was measured
rather than remembered: `main` was built in a throw-away worktree on the same day and read 43,390.
The rise is the fault table, the banner, the twelve rejection sentences and the rejection class.
Nothing was widened. The
three render counters are unchanged at 841 draw calls, 842 triangles and 77 textures against ceilings
of 968, 969 and 89. Branding gate `files_scanned=154`, `binary_skipped=85`, `hits=0`, exit 0,
`enumerated=239`.

### Reported, not fixed

- **`RollLog.rolls()` can reject and nothing catches it.** A history opened on a connection the
  browser closed leaves an unhandled rejection and an empty list, with no fault raised. It has no
  declared refusal type, so the denominator above does not see it, and giving it one is a change to
  `src/shell/roll-log.ts` that no unit has asked for.
- **An export refused by the browser is still a message and not a fault.** `downloadBlob` answers a
  boolean rather than a named refusal, so it is outside the parsed denominator. The words are
  already the player's and they are already in the destination.
- **A fault and the seven-day note read alike.** Stated above and recorded in Decision 19.
- **The import fault is cleared by the next import and by nothing else.** A player who leaves the
  history and comes back still reads it. That is the correct behaviour for a log that did not
  change, and it is stated here because no check asserts a lifetime for it.


## Fix — the pointer probe aimed where no pointer can land

### What was reported

`node scripts/browser.mjs --table` lost a die to the pointer route on some throws, with
`die-at2 did not answer the click`. The keyboard route answered on the same throws. The report named
two candidate causes and asked which one was happening.

**Neither of them was.** The measurement below found a third.

### The measurement that found the cause

The failing runs were reproduced by sweeping seeds, because **the seed does not repeat a `--table`
run.** `--throw-seed` replaces `Math.random`, which the vendored library draws its throw vectors
from. Constraint 7 makes the rules core draw from `crypto.getRandomValues`, and the seed does not
reach that. Two runs at seed 2107814439 read 20 and 24 dice the player may release. The harness
header and `.claude/skills/run-clatter/SKILL.md` both said a red run repeats exactly. Both now say
which half repeats.

Over seeds 200 to 231 at 1440x900, 2 runs of 32 lost a die. Each fault was recorded with the
element under the click point, the raycast answer at the aim, the raycast answer at the rounded
aim, and the die that toggled instead.

**Candidate 1, the buried die of Decision 9: ruled out.** Every failing run read `unreachable=0`,
so the raycast found a point on every die. A scan of the whole pixels under each die measured how
much of its own front surface it shows: over 960 dice at 1440x900 the smallest was 195 whole
pixels, and no die was ever buried. The two dice that were lost held 1,415 and 1,820 whole pixels.
Neither was hidden and neither was hard to reach.

**Candidate 2, two overlapping die cells: ruled out.** `document.elementsFromPoint` at the aim
returned `CANVAS` first at every fault, and a capture-phase listener recorded `CANVAS` as the target
of every click. `pointer-events: none` of Decision 9 held. No cell took a press.

**The cause is the probe, and it is a resolution fault.** The probe walked outwards from the die's
projected centre and returned the FIRST point that belonged to the die. Where a neighbour covers the
centre, that first point lies on the boundary between the two, by construction. The point is
fractional. The driver rounds every pointer coordinate to a whole pixel — `Math.round` in
`node_modules/puppeteer-core/lib/puppeteer/bidi/Input.js`, read from the installed source — and the
WebDriver BiDi wire format carries whole numbers. The press therefore landed on the far side of the
boundary.

At seed 108 the aim read `(232.626, 495.087)`, where the raycast answers die 22. The rounded point
`(233, 495)` answers die 7. The 3 by 3 neighbourhood of the rounded point splits between the two
dice along the line between x=232 and x=233. `die-sk3` toggled and `die-st8` did not. The press
reached a die. It reached the wrong one.

**A probe finer than the actuator it drives proves nothing.** The old probe proved a point the
pointer could never send an event to.

### The fix, and why it is a construction

`window.__clatterAim` scans the whole pixels the die's projected disc covers, keeps the ones where
the die is the frontmost body, and answers the one furthest from any pixel that is not. The
distance is Chebyshev, over two passes of a distance transform.

- The answer is a whole pixel, so the driver's rounding is the identity and the press lands exactly
  where the raycast proved.
- The answer is the point deepest inside what the player can see, which is where a finger aims.
- The scan area comes from the die's own bounding sphere and the camera, so nothing is calibrated.
  `CLICK_PROBE_RINGS` and `CLICK_PROBE_ANGLES` are gone and nothing replaced them.

One implementation answers both modes. `--affordance` drove the same driver through the same
fractional aim and carried the same latent fault. It now calls the same function and reads the same
numbers Unit 3.5 recorded: `refused=4`, `toggled=8`, `unreachable=0`, `reported=12 of 12`.

**No shipping file changed.** The pointer route of `src/tray/affordance.ts` was already correct at
every whole pixel of a die's own surface. The fault was in the instrument.

### The counted denominators, and the two refusals

The report asked that a rule lock and a hidden die stay apart. They now are.

| Count | Denominator |
|---|---|
| `refused` | The dice the screen draws as an image, counted off the DOM before any click. A rule lock is not a button and carries no `aria-pressed`. |
| `toggled` | The dice the screen draws as a button, which is the pool less the rule locks. |
| `refused` and `toggled` again | The key route's own two counts, taken through a different instrument over the same pool. |
| `unreachable` | Zero. Each die with no whole pixel of its own is named, with the number of pixels scanned. |
| `whole` | The dice the run aimed at, against the pool. An aim between two pixels fails by name. |

A hidden die can no longer be absorbed into a refusal, and the counted denominator enforces it
without the explicit gate: a die the screen draws as a button that was never pressed makes `toggled`
fall short of the button count, whatever the reason.

### Three red-proofs

Each injection landed, each failure names the gate it broke, and each was restored by editing the
injection back. No version-control command touched a byte.

1. **A fractional aim.** `x: index === 0 ? bestX + 0.5 : bestX`:
   `FAIL table.every-aim-is-a-whole-pixel-the-pointer-can-address whole=29 of the 30 dice this run
   aimed at ... fractional=1 [die-at1 at (912.5, 202)]`. This is the property the defect broke.
2. **One die with no whole pixel of its own.** `if (bestX === null || index === 0)`:
   `FAIL table.every-die-is-accounted-for-by-the-pointer-route reached=29 and unreachable=1 sum to
   the pool of 30 ... toggled=21 against the 22 dice the screen draws as buttons and refused=8
   against the 8 it draws as images ... faults=1 [die-at1 has no whole pixel of its own: no whole
   pixel of its own surface is frontmost, over 6536 scanned]`. **The refusal count stayed at 8**, so
   the hidden die was not absorbed into it.
3. **One refusal counted twice.** `let refused = 1`:
   `FAIL ... refused=7 against the 6 it draws as images because the rules hold them. The key route
   read the same split as 24 and 6, through a different instrument`.

The defect itself is red on the unfixed code: 2 runs of 32 at 1440x900, with the fault text quoted
above.

### The seed sweep

`--table --viewport 1440x900`, one run per seed, seeds 200 to 263, on
`AMD Radeon RX 6700 XT (radeonsi, navi22, ACO, DRM 3.64, 7.1.7-200.fc44.x86_64)` with the sandbox
off.

| Run | Seeds | Passed | Checks per run |
|---|---|---|---|
| Before the fix | 200 to 231 | 30 of 32 | `checks=9 failures=1` on 2 of them |
| After the fix | 200 to 263 | **64 of 64** | `checks=10 failures=0 skipped=0` on every one |

**64 seeds is enough because the rate is 1 in 16.** The unfixed code lost a die on 2 of 32 runs.
Over 64 runs at that rate the chance of no failure by luck is under 2 per cent. Every run also read
`aimed=30 of 30 whole=30`, so the property the fix rests on held 1,920 times.

Seed 2107814439, which the report named, passes: `checks=10 failures=0 skipped=0`, `reached=30
unreachable=0 toggled=22 refused=8 rule_held=8 pressable=22`, and the key route read the same 22 and
8. The keyboard check was green on all 64 sweep runs.

### `BLOCKED:owner-gate` — the small tray buries a die, and no pointer can reach it

The report asked for a capture at 360 px, and the capture found a second defect. It is not the one
this fix closes and it is not a regression.

**A die is a fixed size on the screen at every canvas size.** The library builds it at `baseScale`
world units and the camera frames twice the element in world units, so a die is about 91 CSS pixels
across at 360 px and at 1440 px alike. The tray shrinks and the dice do not, so 30 dice pile up.

Measured with the same instrument, one run per seed, sandbox off:

| Viewport | Runs | Runs with a buried die | Buried dice | Smallest own surface |
|---|---|---|---|---|
| 360x760 | 24 | 7 | 8 | 1 whole pixel |
| 800x600 | 24 | 1 | 1 | 3 whole pixels |
| 768x1024 | 8 | 0 | 0 | 387 whole pixels |
| 1440x900 | 72 | 0 | 0 | 193 whole pixels |

`docs/design/0015-pointer-route-1440.png` and `docs/design/0015-pointer-route-360.png` are the same
seed at the two widths. At 1440 the dice lie apart and every one shows a face a finger can land on.
At 360 they stand in a heap several deep, some dice show a sliver of one edge, and the cages of the
kept dice cross each other.

Section 3 of `docs/design/0002-screen-design.md` counts twenty-three dice in state B as hit targets
a player may keep or release. **At 360 px that promise does not hold for every die.**

**The options, priced. None is inside the delegated authority.**

| Option | What it costs |
|---|---|
| Spread the throw so the dice land apart | Moves `steps_to_rest_fixed_seed_scene` and the pinned scene digest in `budgets.json`. Constraint 5 forbids changing one gate to make another pass. `BLOCKED:budget`. |
| Scale the die down with the tray | Changes the drawn screen the owner approved at Unit 2.0, and shrinks the numeral a player reads on a phone. Re-derives the 200 px floor under `.table`, which is expressed in `baseScale`. `BLOCKED:owner-gate`. |
| Give the die cells the pointer, stacked by camera depth | Reverses Decision 9 and reopens the hazard it names: a disc is wider than a die's silhouette, so a press at the edge of one cell would toggle a die the player did not aim at. **It does not close the case either** — a small die wholly behind a larger one has a cell wholly inside the larger die's cell. |
| Leave it, and let the keyboard carry the buried die | Costs nothing and closes nothing. The keyboard route reaches every die at every width, which `table.every-die-answers-a-key-press` reads as 30 of 30 at 360 px as well. A player with a finger still cannot reach a buried die. |

**What this fix does about it: it makes the run say so.** The pointer check gates
`unreachable === 0` and names every die with no whole pixel of its own, so the heap is a red run and
not a silent tolerance. The mode is therefore red at 360x760 on about 3 throws in 10, and at 800x600
on about 1 in 24. **That red is true.** The check it replaced read `unreachable=0 ... by design` and
could not fail on this at all.

The owner decides which option to take. Nothing here is chosen for them.

### Reported, not fixed

- **`--table` at 360x760 also failed the push check** on the unfixed code from `main`:
  `table.the-push-put-the-die-it-added-on-the-table ... wrong=1 [die-st11 reads 3, the screen says
  2]`. That is a separate pre-existing finding at the phone width, measured while baselining, and it
  belongs to Unit 3.4. It is not touched here.
- **The default viewport of the harness is 800x600.** A plain `--table` run therefore samples the
  crowded tray, not the drawn one. Unit 3.5 measured the mode at 1440x900 and the ledger records it
  there.
- **`--table` does not repeat from its seed.** The sweep is the instrument for a `--table` red, not
  one seed. `.claude/skills/run-clatter/SKILL.md` now carries a table of which modes repeat.

### The probe constants, and which ones moved

**Two were removed and nothing was re-calibrated.** `CLICK_PROBE_RINGS` at 6 and
`CLICK_PROBE_ANGLES` at 12 are gone. The scan that replaced them derives its area from the die's own
bounding sphere and the camera, and its answer from a distance transform, so it holds no number to
tune.

No die's drawn size, no die's spot and no camera moved, so every other screen-space constant still
measures what it measured: Unit 3.5's 48-direction shape probe, Unit 3.4's 1 px kept-die bound and
Unit 3.5's 1 px cell bound all read the numbers they recorded.

### Measurements

| Number | Value |
|---|---|
| Files changed | 4, `scripts/browser.mjs`, `.claude/skills/run-clatter/SKILL.md`, `LEDGER.md` and two captures |
| Shipping files changed | **None.** The pointer route was already correct. |
| Test total | 438 Vitest tests over 41 files, plus 22 node tests. Unchanged. |
| Initial JavaScript | 43,390 gzip bytes, unchanged. Budget in `budgets.json`. |
| Lazy 3D chunk | 151,876 gzip bytes, unchanged |
| Render counters | 841 draw calls, 842 triangles, 77 textures. Unchanged, all three under their ceilings. |
| `npm run perf` | 203 steps over 5 runs, spread 0, scene digest unchanged, exit 0 |
| Harness | `--table` at 1440x900 10/0/0 over 64 seeds, `--affordance` 9/0/0, `--tray` 7/0/0. `--table` at 360x760 10/2/0, which is the finding above. |
| Branding gate | `files_scanned=154`, `hits=0`, exit 0 |
| Validate | `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, all exit 0 |

## Unit 4.7 — the charts, in a third view of the history destination

Unit 4.7 shipped its computation and left the charts open. They land here. `summariseLog` is
unchanged: this unit added no statistic, moved no definition and re-opened nothing the engine half
settled.

### The decision, and the option it was taken against

Decision 14 of `docs/design/0012-settled-decisions.md` records it in full. **The charts are a third
view of the history destination, opened by `statistics-button` in the summary footer.** Section 3 of
the design gives the summary four controls and the statistics view one, and both counts are read out
of that table by every check rather than restated.

The rejected option was a section of the summary. The summary is the list of every roll, and a
player opens it to find one roll. Charts above the list push the list off a 360 px screen. Charts
below the list are unreachable until the player has scrolled past a campaign. Unit 4.5 met that
failure once already, on the record view, and only its capture found it.

The control sits beside `import-button` because both act on the whole log. Decision 13 put the
import there for the same reason, and the record therefore keeps the two controls section 3 names.

### The screen computes no statistic, and the claim is measured at the call site

`src/shell/statistics.tsx` imports no log entry, no push profile and no rule. There is nothing in it
to re-derive a number from, which makes the component safe by construction — and a check against a
component that cannot fail proves nothing.

So the claim is measured where it can fail: at the call site in `src/shell/history.tsx`. The test
mocks `summariseLog` and hands the destination a record that disagrees with its own log on **all 24
fields**. The disagreement is counted first, so no field can pass by coincidence, and the two records
are asserted to carry the same field names, so every disagreement is a disagreement of value rather
than a missing path. The screen then has to follow the record.

The red-proof is the defect itself: `<Statistics stats={{ ...summariseLog(entries), entriesRead:
entries.length }} />`. The failure read `entriesRead follows the record and not the log: expected '6'
to be '41'`, and nothing else in the file moved.

### A chart is a table, and the two readings are compared

Every value is text in a real cell. A table cell names its row header and its column header through
`headers`, and a description value names the term beside it. Every bar and every glyph sits under
`aria-hidden`, so a screen reader meets the value and never the decoration.

That gives two readings of one number, and the checks compare them against each other and against
the record:

- **The text**, read out of the document and compared field by field against the record.
- **The drawn length**, read out of the geometry and compared against the record.
- **The reader's name**, resolved through the headers or the term, never assumed. A name that
  resolves to nothing answers null and the count falls.

All three carry the same denominator, and it is counted a second way as a sum over the shape of the
record: `1 + rows by 5 + 7 push fields + 4 cost units + 2`. Twenty-four values for the fixture, and
fourteen for an empty log.

### The bound on a bar comes from the geometry

Two instruments, two bounds, and neither is picked:

- In the browser, the bar and its track are measured in real pixels and the bound is **one device
  pixel over the track width** — 190, 172 and 722 px this run, so 0.0053, 0.0058 and 0.0014 of a
  track.
- In the test runner, the drawn width is a percentage the view writes to three decimal places, so
  the bound is **0.0005 of a percentage point**. The smallest real difference between two bars of
  the fixture is 25 percentage points, which is fifty thousand times that.

The red-proof drew every bar at nine tenths of its value. The browser named three bars and their
bounds; the test runner named `byPoolSize.0.successRate is drawn at 60 per cent against the 66.6667
the record fixes`.

### Shape, and what the charts do not draw

Four series carry a glyph: a circle for a success and for a gain, a square for the outcome that did
not move, and a triangle for the one that went the wrong way. The circle keeps the sense it has
everywhere else in this application. `success` and `better` share it on purpose and never appear in
one chart, so no chart holds two series of one shape — which is the claim, counted per chart against
the series inside it.

The glyph shapes are read out of the stylesheet in the test runner and off `getComputedStyle` in the
browser. Both name three shapes and three colours for the three push outcomes.

**No chart draws a bane.** `summariseLog` returns no bane statistic, so a bane bar would be a number
the log never answered. The plan's shape rule is met by the marks the record does carry.

### Contrast, over two denominators

Thirteen chart colours are named by the RULE that spends them — `.chart td`, `.chart-bar.s-worse`,
`.cmark.c-same` and so on — read out of `src/shell.css`, resolved against `:root`, and judged at the
WCAG 2.2 floors: 4.5 to 1 for text under SC 1.4.3 and 3 to 1 for a graphical object under SC 1.4.11.
No colour is written in the check.

The same thirteen run over **all six interface palettes of Unit 4.8**, as a product of 78. Unit 4.8
built the palettes and left the stylesheet that spends one open, so a table in the test file maps
each shipped role variable to the palette token it will become. A variable with no entry in that
table fails the check rather than going unmeasured, and a second check binds the `ink` each series
declares in `CHART_SERIES` to the variable the stylesheet really spends, so the claim and the paint
cannot drift apart.

The browser adds a third reading: 36 colours as the engine resolved them, each against the first
ancestor that really paints one.

One injection turned all four red at once. `.cmark.c-same` painted in `var(--sunken)` read 1.30 to 1
against the card in the shipped palette, 1.17 to 1 in the ember palette, and broke the binding with
`expected 'background' to be 'textMuted'`.

### The three degenerate cases

The engine half answered these for the record. The view answers them for the screen:

- **No roll.** `stats-empty` says so and no pool-size chart is drawn, because no roll made a row. No
  bar is drawn, because no share exists. The record still reaches the screen in full, so the
  denominator is fourteen and not zero.
- **No push.** The paid-off reading is the sentence "No roll has pushed yet." It carries no per cent
  and no digit, because a nought would read as "pushing never paid off", which is a different claim.
  The three outcome rows read nought and draw no bar, because a count against a total of nought is
  not a share of anything.
- **One roll.** One row, and the denominator is nineteen.

### A check that could not fail, found and repaired before it shipped

The phone check first counted every element whose right edge passed the viewport, exempting anything
with an ancestor whose computed `overflow-x` is auto or scroll. **That check can never rise.**
`.shell-m` sets `overflow-y: auto`, and CSS then computes its `overflow-x` to `auto` as well, so
every element of the destination has such an ancestor. Measured with a 900 px meter injected: the
walk reported 0 off the side.

The repair names the one container a chart may scroll inside — `.hist-mx-scroll`, which is where
Decision 6 puts a table too wide for a phone — and adds the load-bearing condition: **the page's own
middle region must not scroll sideways at all.** The same injection then read 4 elements off the side
and 916 px of content in 348 px.

### The red proofs

Sixteen injections, each restored by editing the injection back. The three touched files were hashed
against a copy saved first, and all three match.

| # | The defect | What went red, and what it said |
|---|---|---|
| 1 | The call site passes `entriesRead: entries.length` | `entriesRead follows the record and not the log: expected '6' to be '41'` |
| 2 | Every bar drawn at nine tenths of its value | `byPoolSize.0.successRate is drawn at 60 per cent against the 66.6667 the record fixes` |
| 3 | The same, in the browser | `3 were outside it. [byPoolSize.0.successRate: drew 0.4500 of its track against 0.5000, bound 0.0053]` |
| 4 | One cost reading dropped | four tests: `the chart draws one value per field of the record: expected 23 to be 24`, `a reader reaches every field of the record: expected 23 to be 24`, `expected 13 to be 14` for the empty log and `expected 18 to be 19` for the one-roll log |
| 5 | The square glyph becomes a circle | `the three outcomes carry three shapes: expected 2 to be 3` |
| 6 | The same, in the browser | `the engine resolved 2 shapes and 3 colours for them` |
| 7 | A glyph painted in the track colour | four tests: `the same bar: expected '--ink-dim' to be '--sunken'`, `the same glyph reads 1.30 to 1 against the card`, `.cmark.c-same spends a variable this table maps: expected 'background' to be 'textMuted'`, and `ember: the same glyph reads 1.17 to 1 against the card` |
| 8 | The same, in the browser | `1 missed. The tightest reads 1.30 to 1 at the same glyph` |
| 9 | A null rate drawn as nought per cent | `expected '0.0%' to be 'No roll has pushed yet.'`, in both degenerate tests |
| 10 | Back from the charts leaves the destination | `back closes the charts: expected false to be true` |
| 11 | The same, in the browser | `A real Enter on back returned to the SUMMARY and not to the dice (list=false charts=false dice=true)` |
| 12 | A tab stop on the charts section | `the charts hold the design's controls, and no other: expected [ 'back-button', 'history-stats' ] to deeply equal [ 'back-button' ]` |
| 13 | The pool-size header names no column | `byPoolSize.0.poolSize is reachable by name: expected null not to be null` |
| 14 | The same, in the browser | `2 are drawn where a screen reader reaches no name for them. [unnamed: byPoolSize.0.poolSize, byPoolSize.1.poolSize]` |
| 15 | A 900 px paid-off meter | `4 elements of the charts sit off the side of the viewport. 916 px of content in 348 px (sideways=true)` |
| 16 | The same defect against the FIRST form of check 15 | reported 0 off the side and stayed green. The check was repaired, not the defect. |

### What the captures show

`docs/design/0018-history-stats-360.png` and `0018-history-stats-1440.png`, over a log of four rolls
at two pool sizes with four pushes.

At 1440 px the three charts and the readings all sit above the fold. At 360 px the seven-day note and
the log count take the first 210 px, the pool-size chart is whole, the outcome chart is most of the
way there, and the paid-off meter and the definition are one scroll down. Three stacked charts do not
fit a 760 px phone, and the middle scrolls as Decision 6 requires: 1,101 px of content in 648 px, and
nothing at all off the side.

The 360 px frame is what moved the log count from a tile that wrapped its own label to one that takes
two cells of the reading grid. That gained about 30 px and put the first chart higher.

### Measurements

- `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`: exit 0, exit 0, exit 0, exit 0.
- Vitest 334 tests over 33 files, from 321 over 32.
- `node scripts/browser.mjs --history`: `checks=21 failures=0 skipped=0`, from 15 checks.
- `node scripts/browser.mjs --shell`: `checks=8 failures=0 skipped=0`. Eleven authored visits before
  the throw and thirty-five after it, both read out of section 6 of the design.
- `npm run perf`: `failures=0`. 203 steps over five runs, spread 0, against the 224 in `budgets.json`.
- Bundle: `initial_js_gzip_bytes` 33,449 and `lazy_3d_chunk_gzip_bytes` 151,876, both under the
  ceilings in `budgets.json`, `failures=0`.
- Branding gate: `files_scanned=133`, `hits=0`, exit 0.

### Reported, not fixed

- **One run in nine of `--history` reported `failures=1`, and the failing check was not captured.**
  The output was filtered to the statistics lines at the time, so the name of the check was lost, and
  eight later runs were clean. Every check of that mode drives real presses over faces the throw
  seed decides, and the seed is fresh on every run. The run before it and the six after it all read
  `checks=21 failures=0 skipped=0`. It is recorded here rather than dismissed.
- **`src/shell/words.ts` is new**, and it holds `plural`, `COST_NOUN` and `costReading`. They were in
  `history.tsx`. `statistics.tsx` needs the cost words, and a cycle between two view modules works
  until the order of the two imports changes. `history.tsx` re-exports `costReading`, so every
  existing importer is unchanged.
- **The seven-day note and the message region are drawn in all three views**, because they belong to
  the destination and not to one view of it. On a 360 px screen the note takes about 100 px above the
  first chart. That is Unit 4.4's element and this unit did not move it.

## Units 4.5 and 4.6 — the record, the matrix, the export and the import

Unit 4.4 left `history-record` as a shell and named what it owed: the transposed matrix and
`export-button`. Unit 4.6 was open at the import control. Both open halves land here, and row 2.2d
travels with the matrix unchanged.

### BLOCKED:budget — a full export nearly fills the import cap, and the owner decides

Measured on 2026-08-10 through `node scripts/browser.mjs --log-csv`, on the graphics card with the
sandbox off. **The plan's own figures are corrected by this run and the correction is small but it
changes the answer.**

| Reading | Value | Where it comes from |
|---|---|---|
| A full 5,000-roll buffer of twelve dice over three generations | 160,000 rows | the run counts the rows a second way, over the rolls |
| The file it writes | 32,910,207 bytes, and the same number of characters | the notes are ASCII, so bytes equal characters |
| The cap an import reads | 33,554,432 | `MAX_IMPORT_CHARS` and `MAX_IMPORT_BYTES`, one constant |
| The room | 644,225 characters | the run subtracts, it is not retyped |
| The room per row | 4.026 characters | 644,225 over 160,000 |
| The note of the fixture roll | 21 characters | `a representative note` |
| The note length that fills the cap | 26 characters | 21 plus 4.026, rounded up |

**The plan says twenty-two characters and four more. The note is twenty-one and it takes five more,
not four.** Four more characters is 640,000 and still fits with 4,225 to spare. Five more is 800,000
and overflows by 155,775. `--note-chars 26` proves it: the file measures 33,710,207 bytes and both
cap checks go red naming the deficit.

Every row of the export repeats the roll's note, so the room is a note length and nothing else. Two
further facts sharpen it:

- **A note outside ASCII costs more than one byte a character.** The byte guard is the gate a real
  import meets first, and an accented note reaches it sooner than the character cap.
- **Nothing bounds the note.** `LogEntry.note` has no length limit anywhere, and no unit of the plan
  has asked for one. The export size is therefore unbounded in a field the player writes, while the
  cap is fixed.

**The three options, priced. This is the owner's call and no agent may take it.**

1. **Raise the cap.** One constant in `src/log/csv.ts`. It costs nothing to write. The cap exists so
   an import refuses a file that would hold the parser for minutes, and `importCsv` is one pass over
   the text, so the real cost is memory: the text, the parsed rows and the entries all live at once.
   A cap of 64 MB would carry a note of about 220 characters at a full buffer. Nobody has measured
   the parse of a 64 MB file on a phone, and this unit did not measure it either.
2. **Cap the note.** A limit on `LogEntry.note` makes the export size a function of the row count
   alone. At 160,000 rows the whole note budget is 4 characters a row, so any useful note needs the
   cap raised as well. A note cap alone does not close the defect. It also needs an interface: no
   note editor exists yet, which Unit 4.4 reported.
3. **Split the export.** One file per N rolls, and an import that reads a set of files. It is the
   only option that scales with the buffer rather than against it, and it is the most work: the
   picker takes several files, the importer joins them, and the duplicate-`roll_id` rule has to hold
   across the set.

**Nothing was widened.** `budgets.json` is untouched, `MAX_IMPORT_CHARS` is untouched, and the gate
that finds this is measured on every run rather than left to rot: two checks now read the real file,
one against the character cap and one against the byte guard the import control applies.

### The two acceptances of row 2.2d, and how each one can fail

Row 2.2d carries them from Unit 2.2 unchanged. Decision 3 transposed the matrix, so they land here.

**The cell count.** The product is computed off the stored entry, which the harness reads back
through its own connection to IndexedDB, and compared against the cells the document drew: 18 cells
against 9 dice by 2 generations. The fixture is a PUSHED roll, so a matrix of one column cannot
pass. The two cell kinds are also summed against the whole, so a cell counted twice fails as well.

**The blank count.** A cell is blank when the die did not exist yet, or when the die was locked at
the generation before and this value is the carry of that one. The expectation is a second loop, in
the harness and in `src/shell/history.test.tsx`, walking the stored cells. Neither loop reads the
matrix. **Both blank kinds are guaranteed by the fixture rather than left to the dice:**

- The run keeps one loose die by hand before it pushes, so a carry exists whatever the faces did.
  Waiting for a six is 1 in 6 a die, and a run of eight dice would have found none about one time in
  four.
- The third rule set raises stress BEFORE the re-roll, so a stress die joins at the second
  generation and its first cell is absent.

**A carry is checked to BE a carry.** The rules model says a locked die repeats its previous value,
so every cell the matrix draws as a dot is compared against the value of the cell before it: 5 of 5.
A matrix that drew dots by some other rule would pass the count and fail this.

### Where the import control went, and why the record still holds two controls

Section 3 gives the record exactly `back-button` and `export-button`. It gave the summary two. An
import had no home in either list, and Decision 13 records the two rejected options and the taken
one. The summary now names three controls in its own table, and both instruments read that table
rather than a copy of it, so the count moved in one place.

The picker itself is not a control. It is an `input type="file"` with `tabindex="-1"` and
`aria-hidden`, clipped off the screen rather than `display: none`, because a browser may refuse a
scripted click on a control it does not render.

### The export writes the log, and that is forced

Decision 3 says where the control lives. It does not say what the file holds. Two things settle it
and neither is a preference: Unit 4.6 settled that an import REPLACES the log, so a file of one roll
would delete a campaign when it was read back; and the plan's verification step 6 asks for an
export, a spreadsheet pivot, a re-import and an unchanged log, which only a whole-log file gives.

The check can fail on it: the fixture holds two rolls and the file must carry both identifiers. With
one roll in the log the claim is unobservable, and the first draft of the check had exactly that
hole — `entries.slice(0, 1)` passed until the fixture threw a second roll.

### The oracle for the export runs in node, and why

`--history` drives the BUILT bundle, which exports nothing, so the page cannot build the file a
second way. The harness intercepts `URL.createObjectURL` — the browser's own call, not ours — keeps
the blob, reads the rolls out of IndexedDB through its own connection, and runs `exportCsvInChunks`
in node over them. The comparison is then a file one engine produced against a file another engine
produced from the store, byte for byte, with the compared byte count as its own denominator. Node
imports the `.ts` module directly, which it has done since type stripping was unflagged.

`src/log/import-file.ts` cannot be imported in node, because it names a value from `./csv` and node
does not resolve an extensionless specifier. So `MAX_IMPORT_BYTES` moved to `src/log/csv.ts`, beside
the character cap it is derived from, and `import-file.ts` re-exports it. One home for the cap.

### The size guard is an ORDER, and an order is only provable by counting

"The size is judged before the file is read" is a claim about two calls, not about a value. Both
instruments count the second call. `src/log/import-file.test.ts` hands over a file whose `text()`
increments a counter and whose stated size is one over the cap while its text is a short, legal log:
a guard that read first would parse it happily and pass. The browser half patches `text` on a real
33 MB `File` and reports `patched=true` before it presses, so a run where the counter never attached
fails rather than reporting a zero it could not have moved.

### An instrument this unit repaired, and the reason it had been passing

`--history` walked the summary after `document.activeElement?.blur()`. That does not move the
sequential focus navigation starting point, and Firefox hands the focus to its own chrome after the
last control rather than wrapping. The walk had been correct only because `back-button` happened to
be the last control in the document. With `import-button` after it, the same walk reported one stop
of three. It now uses the idiom `--shell` already had: focus the header with a temporary
`tabindex="-1"`. **The failure was read before it was blamed** — the walk reported
`tab_stops=[import-button]`, which is the stop AFTER the old focus, not a missing control.

### A layout defect only the capture found

The record drew the eight readings first and the matrix under them. At 360 px that put the matrix
below the fold, on the width Decision 3 transposed it for, and one row of it was visible above the
footer. Nothing in the suite could see it: every count was right and every role was right.

The matrix now comes first, and the reading grid is compact — three columns at phone width instead
of two, at 14 px instead of 17. The summary row the player pressed already carries the time, the
successes, the banes, the dice count and the push count, so the dice are the only thing the record
adds that the list cannot show. Captures `docs/design/0017-history-record-360.png` and
`0017-history-record-1440.png`, both read after they were written.

### The item Unit 4.4 handed on, judged

**"A manual keep made after the final generation and never pushed is not in the entry."** It does
not make the matrix wrong, and the reason is structural rather than lucky: the matrix reads `locked`
only at the generation BEFORE a cell, to decide whether that cell is the carry of a locked die. The
newest generation's `locked` is never drawn, so nothing on the screen can be wrong about it.

The stored field can still miss such a keep, and the CSV `locked` column carries the entry unchanged,
so the export inherits the same gap. That is a limit of the ENTRY and it belongs to Unit 4.4, which
reported it. Closing it needs a write on a keep, which is a fourth trigger for the log and a decision
about what a log entry means. No unit of the plan asks for it yet.

### The red proofs

Nine injections. Each file was copied outside the repository first and restored by editing the
injection back, and `sha256sum -c` matched every file afterwards. No checkout and no stash touched
any file. The last two are flags rather than edits, so nothing needed restoring.

| # | The injection | The gate that went red |
|---|---|---|
| 1 | the matrix drops its last generation column | `one cell per die per generation: expected 8 to be 12`, and in the browser `drew 9 cells ... 9 dice by 2 generations is 18 cells` |
| 2 | a locked die never draws its carry | `a cell that repeats a locked die: expected +0 to be 3`, and in the browser `1 cells were drawn blank against 3 counted a second way` |
| 3 | a cell names its row header alone | `a cell names two headers: expected 1 to be 2`, and in the browser `0 of its 18 cells name one row header and one column header` |
| 4 | a third control in the record footer | `the record holds the design’s two controls, and no third`, and in the browser `reached [back-button print-button export-button] against the [back-button export-button]` |
| 5 | the export writes the roll on the screen | `expected 576 to be 2974`, and in the browser `1807 bytes against the 5201 ... 1 of 2 roll identifiers are in it` |
| 6 | the application takes the rolls and never writes them | `the log holds 3 against the 2 that went out` |
| 7 | the guard reads the file, then judges the text length | `a refused file is never read: expected 1 to be +0`, and in the browser `The control read the file 1 times` |
| 8 | the controls lose `aria-disabled` | `a state a reader can announce: expected null to be 'false'`, and in the browser `2 without an aria-disabled` |
| 9 | `import-button` renamed, and separately hidden | `expected [ 'back-button', …(1) ] to deeply equal [ 'back-button', 'import-button' ]`, and with `hidden` the browser `reached [history-list back-button] against the [back-button history-list import-button]` |
| 10 | `--note-chars 26` | both cap checks: `33710207 characters against the 33554432 an import reads, so -155775 characters of room` |

**Injection 9 found a real limit of the jsdom instrument and it is left standing.** A `hidden`
button keeps `tabIndex` 0 under jsdom, so the pure test cannot see it while the browser half, which
presses a real Tab, can. That is the split working: the pure half asserts the markup and the browser
half asserts the keyboard. The pure check was proved red by renaming the control instead.

### Measurements

| Command | Exit |
|---|---|
| `npm run lint` | 0 |
| `npm run typecheck` | 0 |
| `npm test` | 0, over 321 vitest tests in 32 files plus 20 node tests |
| `npm run build` | 0 |
| `npm run perf` | 0, 203 steps against the 224 in `budgets.json`, scene digest unchanged |

Harness modes, all outside the sandbox on the graphics card, every one exit 0:

    --history        checks=15 failures=0 skipped=0
    --log-csv        checks=11 failures=0 skipped=0
    --shell          checks=8  failures=0 skipped=0
    --sheet          checks=11 failures=0 skipped=0
    --table          checks=9  failures=0 skipped=0
    --blocked-chunk  checks=11 failures=0 skipped=0
    --offline        checks=8  failures=0 skipped=0
    --log-store      checks=13 failures=0 skipped=0
    --settings-store checks=6  failures=0 skipped=0
    --tray           checks=7  failures=0 skipped=0
    --pool           checks=7  failures=0 skipped=0
    --push           checks=7  failures=0 skipped=0
    --affordance     checks=9  failures=0 skipped=0
    --probe          checks=5  failures=0 skipped=0
    --context-loss   checks=5  failures=0 skipped=0
    --reduced-motion checks=5  failures=0 skipped=0
    --sound          checks=10 failures=0 skipped=0

Section 6 reads eleven visits before the throw and thirty-five after it, in both instruments and in
both renderers: `--shell` with the 3D table running, `--blocked-chunk` with the chunk refused, and
`src/app.test.tsx` under jsdom. Both lists are read out of the design.

The two bundle figures are read from `dist/` by `scripts/check-bundle-size.mjs` against
`budgets.json`: initial JavaScript 31,527 gzip bytes and the lazy 3D chunk 151,876, both inside
their budgets. The initial figure rose because the history destination now imports `src/log/csv.ts`,
which the roll flow did not. It was not made a lazy chunk: `--blocked-chunk` proves the application
whole with the one lazy chunk refused, and a second one would need the same treatment.

### Reported, not fixed

- **The export control sits in the record and writes the whole log.** Decision 3 puts it there. A
  player who opens one roll and presses Export gets every roll. The button says so, and the design
  document says so, but the placement is the design's and this unit did not move it.
- **The seven-day note is drawn in the record as well as in the summary.** It is Unit 4.4's
  placement and it costs the record about a fifth of a phone screen. Moving it is an interface
  change that no unit has asked for.
- **The matrix stretches its columns at 1440 px.** A roll of two generations gives two very wide
  columns. It is cosmetic and no check reads it.
- **`--history` now takes about two minutes.** It throws, pushes, exports, imports and refuses a
  33 MB file. Nothing in it waits on a fixed clock.

## Unit 4.4 — the screen half: the roll log reaches the screen

The store half built the ring buffer and left four things open: the settings screen that shows the
estimate, the log view, the export button, and the interface note about the seven-day rule. Three of
the four land here. The export button belongs to Unit 4.5, which Decision 3 puts in the record view.

### The decision the log's shape forced: one entry per roll

**A roll opens one entry. Every push of that roll rewrites it. A push never writes a second entry.**
Three separate parts of the shape say so, and each one would break on its own:

1. `createLogEntry` takes a whole `RollResult`, whose dice each carry one value per generation, and
   it writes `LoggedDie.cells` as one cell per generation. A pushed roll is already a complete entry.
2. The same call derives `pushCount` from the number of generations. Two entries per pushed roll
   would hold `pushCount` 0 and 1, and the log would report two rolls where the player threw one.
3. The export schema carries `roll_id` AND `generation` as separate columns, and `src/log/csv.ts`
   rejects a file where one `roll_id` appears in two blocks. A push that wrote a second entry would
   make the application write a file it then refuses to read.

`replaceRoll` is the one new call in the store. It rewrites the entry at the key the insert was
acknowledged with, in one readwrite transaction, and it counts that key inside the same transaction
before it writes. **The ring buffer does not move:** a `put` at a key the store already holds
replaces the value and changes neither the count nor the key order, so no trim is due. The existence
check is not decoration. Without it a `put` at a key a trim had already dropped would put that roll
back below the buffer's own oldest key, and the ring would hold a roll it had thrown away.

`LogWriter.queue` obeys the same rule one step earlier: a roll already waiting under the same
`roll_id` is replaced where it stands, so a push that lands before the first flush cannot make the
flush write the roll twice.

### `profileHash` runs in a browser now

The store half reported this and named this unit: `node:crypto` has no browser. Two ways to settle
it were priced. `crypto.subtle.digest` is asynchronous, so `createLogEntry` and every caller would
have become asynchronous. `src/log/sha256.ts` is the other: one synchronous implementation that
names no platform API at all, so the test runner and the browser produce the same digest from the
same code. Two implementations could disagree, and a disagreement here rewrites campaign history,
because the export and re-import equality check compares the stored hash.

Three oracles hold it, and none of them is a value this unit wrote:

- `node:crypto`, over the empty string, `abc`, text outside ASCII, sorted-key JSON, and every length
  from 0 to 200 bytes. The corpus is built rather than listed, so its denominator is counted: 4
  named strings plus one per length, 205 in all, and the test asserts that number.
- The published FIPS 180-4 vectors, including the million-character one.
- The pinned digest in `src/log/entry.test.ts`, which `node:crypto` produced before this file
  existed. It did not move. The browser then wrote `0b489af6...` for the second preset, which is the
  digest the store half's ledger row already carries.

### The traps this unit was warned about, and what was done

**A write that is queued is not a write that landed.** `node scripts/browser.mjs --history` opens
its own connection to `clatter-log` and reads the object store. Nothing in that mode asks the
application what it thinks it wrote. The mode also waits on the count in the database rather than on
the click, so a check that ran before the write would fail on a timeout instead of passing early.

**A list rendered from a store the check also wrote can agree with itself.** The summary length is
read three ways at each of three rounds: the presses the run made, the options the list drew, and
the rolls a second connection read out of IndexedDB. The three agreed at 1/1/1, 2/2/2 and 3/3/3, and
the red proof that cut the row builder to two rows separated them at `3 pressed / 2 drawn / 3
stored`.

### The counted denominators

| Claim | Measured | Counted a second way |
|---|---|---|
| One entry per roll | 4 entries, 4 distinct roll ids | 4 presses on Roll, counted by the run |
| A push rewrites its own entry | stored `pushCount` sums to 6 | 6 presses on Push, and the stored generations sum to 6 |
| Every cell of the entry is the core's answer | every cell of every die over three generations | the cells the live `RollResult` holds, over dice by generations |
| The summary follows the log | 3 rounds, 3 agreements | presses, options drawn, rolls in the store |
| The arrow walk reaches every roll | 3 arrow visits | 3 rolls read out of IndexedDB |
| The summary holds two controls | 2 tab stops | the control names in section 3 of the design |
| The digest corpus | 205 comparisons | 4 named strings plus one per length from 0 to 200 |
| Every cost unit has words | one per unit | the units the shipped profiles use |

### The instrument this unit broke, and made stronger

`log-store.persistence-is-asked-for-once-and-the-estimate-is-readable` went red at `calls=0`. The
application now asks for persistent storage at startup, through `openRollLog`, and the check
installed its counting proxy after the page had loaded, so the memo was already spent and the proxy
saw nothing. **The failure was baselined before it was blamed:** with the application's own call
taken out the check read `calls=1` and passed again, which located the cause in the new call and not
in the store.

The instrument now installs the proxy before the first line of script the page runs, so the count
covers the application as well as the harness. The claim is stronger than it was: the application
AND the harness together ask the browser exactly once. Removing the `??=` from `persistOnce` takes
the reading to `calls=3` and the check goes red.

### Red proofs

Eleven injections. Each one was saved to a copy outside the repository first and restored by editing
the injection back, and `sha256sum -c` matched every file afterwards. No checkout and no stash
touched any file.

| # | The injection | The gate that went red |
|---|---|---|
| 1 | `s1` dropped from the message schedule in `sha256.ts` | `the digest of a 0-character string: expected 'fe1ab5bf...' to be 'e3b0c442...'`, the FIPS vector at 3 characters, and the pinned digest in `entry.test.ts` |
| 2 | `entryForThrow` passes `'artifactFlat'` whatever the screen holds | `the successes of die 8 at generation 0: expected 1 to be 2` |
| 3 | `entryForThrow` passes a fixed profile | `the hash of the profile in force at the second throw: expected '0b489af6...' to be '36f6bccb...'` |
| 4 | every throw opens a new sequence, so a push writes a second entry | `4 presses on Roll and 4 on Push put 8 entries in IndexedDB, under 8 distinct roll ids` |
| 5 | `historyRows` cut to two rows | `a log of 7 rolls draws 7 visits: expected 2 to be 7`, and in the browser `3 pressed / 2 drawn / 3 stored` |
| 6 | every option carries `tabIndex=0` | `the summary holds the design's two controls, and no third`, and in the browser `roving=3` with the walk reaching `[history-list]` alone |
| 7 | the seven-day note loses its role and its export prompt | `the note carries a role: expected null to be 'note'`, and in the browser `role=null on_plan=false` |
| 8 | a `back-button` added to the roll flow footer | `real Tab and arrow presses reached 12 authored visits against the 11 section 6 names`, and 36 against 35 after the throw |
| 9 | the history drawn beside the roll flow instead of replacing it | `roll-button left the document: expected <button ...> to be null` |
| 10 | the sheet prints a fixed estimate | `It reads 0 MB against the 0.7 MB navigator.storage.estimate() answers this run` |
| 11 | `persistOnce` loses its memo | `the browser's own storage manager saw 3 call in all` |

### What the captures show

`docs/design/0016-history-360.png` and `0016-history-1440.png` are the summary. The header carries
the title and the count and no tab stop. The note sits above the list, marked by a rule down its
left edge, and it wraps to four lines on the phone and one on the desk. Each row prints the time,
the successes beside a circle, the banes beside a triangle, the dice count and the push count, so
shape carries what colour carries. The footer holds one control.

`0016-history-record-360.png` and `0016-history-record-1440.png` are the record shell: eight
readings in a grid that reflows from two columns to eight, and one sentence naming what Unit 4.5
adds. **Two defects the render found and the green suite did not.** The cost read `1 ratingPoint`
and the rule set read `pool-banes-damage-ratings`: two code identifiers on a player's screen. The
cost now reads in words from a record keyed by the cost union, so a fifth unit is a type error until
it has words, and the rule set reads the profile's own label with the stored identifier as the
fallback. A label is a name and never a derived value, so nothing is re-priced by reading it.

### Reported, not fixed

- **A keep chosen after the last throw, and never pushed, is not in the entry.** The log is written
  on a roll and on a push, and `manualLock` is a field of the die, so a choice made after the final
  generation reaches the entry only if a push follows it. A push does rewrite the entry, so every
  keep that decided what a push threw is recorded. The gap is a keep that decided nothing.
- **The serialisation of two overlapping writes is not red proved.** `openRollLog` puts every
  `record` call in one chain, because a push that started while its roll's key was still unknown
  would write a second entry under one `roll_id`. The harness cannot reach that state: the push
  control does not exist until the roll has rendered, so a roll and its push are always two tasks
  apart. The guard is reasoned and its reason is written where it stands. No check would go red if
  it were removed.
- **The seven-day note prompts an export before the export control exists.** The plan asks this unit
  to say so and to prompt an export. `export-button` lands with Unit 4.5, in the record view, which
  is one press from the note. The note and the control are one unit apart.
- **The log holds no note editor.** `LogEntry.note` is written as an empty string by every roll the
  screen makes. The field is carried, exported and rendered as text, and no unit of the plan asks
  for the editor yet.

### A finding the branding gate reported about itself

`src/log/sha256.test.ts` carried two NUL bytes inside a string literal, from an input the test used
to prove the digest answers 64 hexadecimal characters whatever it is given. The gate reads content
and not the extension, and NUL is its rule for binary, so it skipped the file: `binary_skipped=60`
against 55 before this unit, and `.ts` appeared in the list of skipped extensions beside `.jpg` and
`.png`. **The skip is what caught it.** Unit 0.3 built the gate to report every skip rather than
pass over it in silence, and that report is the only thing that named a source file the scan never
read. The literal is now ordinary text, the reading is `files_scanned=130 binary_skipped=59
hits=0`, and the 59 are the 55 images this repository already held plus the four captures this unit
adds.

### What Unit 4.5 inherits

`history-record` is a shell. It draws the stored readings of one roll, it holds `back-button` alone
in its footer, and it prints one sentence saying what is missing. Unit 4.5 adds two things inside
it: the transposed matrix of Decision 3, one row per die and one column per generation, and
`export-button` in the footer. Row 2.2d of the table above carries the two matrix acceptances to
that unit unchanged. `History` already takes the whole `LogEntry` list, so the matrix reads
`entry.dice[].cells[]` with no new plumbing.

### Validation

| Command | Exit |
|---|---|
| `npm run lint` | 0 |
| `npm run typecheck` | 0 |
| `npm test` | 0, over 302 vitest tests in 31 files plus the node tests |
| `npm run build` | 0 |
| `npm run perf` | 0, 203 steps against the 224 in `budgets.json`, scene digest unchanged |

Harness modes, all outside the sandbox on the graphics card:

    --history        checks=8  failures=0 skipped=0
    --shell          checks=8  failures=0 skipped=0
    --sheet          checks=11 failures=0 skipped=0
    --table          checks=9  failures=0 skipped=0
    --blocked-chunk  checks=11 failures=0 skipped=0
    --offline        checks=8  failures=0 skipped=0
    --log-store      checks=13 failures=0 skipped=0
    --log-csv        checks=10 failures=0 skipped=0

The two bundle figures are read from `dist/` by `scripts/check-bundle-size.mjs` against
`budgets.json`: initial JavaScript 28,155 gzip bytes and the lazy 3D chunk 151,876, both inside
their budgets.


## Unit 0.5 — CI, public repository, protection

The checklist in `docs/release-checklist.md` notes that the sandbox and permission rules are separate restriction layers, and step 3 offers two paths for resolving the policy conflict that blocks the initial push to main. **2026-08-09:** a rails-bypass instruction was written into step 3 and removed, replacing Option B's permission-denial workaround with owner-only execution.

## Unit 1.7 — stress and complications

### What landed

`RollRequest` in `src/rules/roll.ts` carries `dice` and `stressBefore`. `roll(request, random)`
returns a `RollResult` with `dice` and the derived `stressAfter`. A first roll adds no stress of its
own, so `stressAfter` equals `stressBefore` there. `firstRoll(builder, random, stressBefore)` in
`src/rules/pool.ts` passes the counter through, and its rolled outcome is a `RollResult`.

`planPush` in `src/rules/push.ts` reads the incoming counter off `result.stressAfter` and derives
the new value as the counter plus what the profile adds. The value reaches the player twice: on
`PushPreview.stressAfter` before the commitment, and on the pushed roll after it. The pushed roll is
itself a `RollResult`, so a second push reads the value the first push produced.

`src/rules/stress.ts` is new. It holds `complicationTriggers`, the complication table and
`drawComplication`.

### The counter is an input, not an inference

Unit 1.6 read the current stress as the number of stress dice the roll carried. `nextStressId` now
takes the counter and names the new die from it. The two agree while every stress point carries a
die, and the counter is the authority when they do not. The test proves the difference: it pushes a
roll that holds no stress die at all with a counter of 4, and the added die is `stress-5`. A count
of the dice on the table would have named `stress-1`.

The core stores no counter. A counter held in a module would make every result depend on the calls
before it, and the Unit 1.4 property test would then depend on the order of the run. The application
owns the counter and persists it. Unit 2.1 builds that store, because no application state exists
yet.

### The complication check reads the whole matrix

`complicationTriggers(result)` returns one entry per stress die that has shown a 1, with the
generation the 1 first showed at. It reads every generation, not the newest one, so the first roll
calls for a check as surely as a push does. A locked stress die repeats its 1 into later
generations, and the check reports that die once, at the earlier generation.

The check reads no push profile. The spec's dice table makes a stress 1 a cost of the dice type, not
of the profile, and profile 3 remains the only preset that charges `complicationCheck`.

### The complication table

Twelve entries, written for this repository. Every entry is a thing that goes wrong in any setting:
a tool fails, a sound carries, footing gives way, somebody notices, time is lost. No entry names a
product, a publisher, an engine or a setting. No existing table was read or adapted.

The table is an argument to `drawComplication`, so a user may replace it or extend it. The selector
maps die faces to an index by rejection sampling, and it combines as many twelve-faced draws as the
table needs. A table longer than one die therefore stays reachable. The test drives 600 draws
through a seeded source over the shipped table and over a thirteen-entry table, and asserts that the
number of distinct entries drawn equals the length of the table each time.

### No module-level mutable state

Two checks cover the claim, and they catch different faults.

1. `vite.config.ts` now sets `sequence.shuffle` for files and tests, at **seed 42**. The seed is
   recorded, so the order is reproducible. Vitest gives each test file its own module registry, so
   the order that matters is the order of the tests inside a file.
2. `src/rules/core-purity.test.ts` asks the core the same question three times and compares the
   answers. It holds one test, so its first call is the first call its module registry sees. State
   that changes an answer after the first call cannot hide behind an earlier test there.

The second check exists because the first is not enough on its own. See the red-proof below.

### Red-proof, a check that misses the first roll

`complicationTriggers` was changed to start its search at generation 1, which is the defect the
acceptance names. Two tests went red, and the two tests that push stayed green. A suite that only
pushed would have passed on this code.

```
FAIL  src/rules/stress.test.ts > the complication check > fires on a stress 1 on the first roll, at generation 0
AssertionError: the first roll calls for a check: expected [] to deeply equal [ { dieId: 'stress-1', …(1) } ]
FAIL  src/rules/stress.test.ts > the complication check > reports a locked stress 1 once, at the generation it first showed
AssertionError: one die, one check: expected [ Array(1) ] to deeply equal [ { dieId: 'stress-1', …(1) } ]
Tests  2 failed | 7 passed (9)
exit=1
```

### Red-proof, module-level mutable state

A counter was added to `roll`. The first call of the module returned face 1 for every die and every
later call ran correctly. The draws still happened, so no draw-counting test could see it.

At seed 42 the shuffled run went red on two behaviours, and the purity check went red as well.

```
FAIL  src/rules/stress.test.ts > the complication check > stays silent when no stress die shows a 1
AssertionError: an attribute 1 is a bane, not a complication check: expected [ { dieId: 'stress-1', …(1) } ] to deeply equal []
FAIL  src/rules/roll.test.ts > roll > counts successes and banes from a fixture roll
AssertionError: the forced values landed in order: expected [ 1, 1, 1, 1, 1 ] to deeply equal [ 6, 1, 1, 4, 1 ]
FAIL  src/rules/core-purity.test.ts > the core answers from its inputs alone > gives one answer to the same question, however many calls came before
AssertionError: a later call answered differently from the first
Tests  3 failed | 79 passed (82)
exit=1
```

**Stated plainly: the shuffle alone is not a reliable detector of this fault.** The injection was
measured over ten seeds with the purity check removed. Six seeds went red and four stayed green,
because a test that tolerates the anomaly may draw the first place in the order. With the shuffle
switched off the whole suite passed. That is why `core-purity.test.ts` exists. With that file in
place the injection went red at seed 42, at the four seeds that had stayed green, and with the
shuffle off. Seed 42 is recorded because it catches this injection, not because the order is
otherwise special.

Both files were restored from copies saved outside the repository. Neither `git stash` nor
`git checkout` was used.

### The counted denominators

- 4 presets by 3 counter values is 12 comparisons of `stressAfter`, asserted against that product.
  One preset of the four raises stress, so the total raise over the run is 3, which is asserted too.
  A resolver that added stress under every profile, or under none, fails that count.
- Every die of every compared push is read for its field names, and no die carries a stress field.
- 600 draws over 12 entries and over 13 entries. The distinct entries drawn are asserted against the
  length of the table, and the sum of the counts is asserted against the number of draws.
- Every entry is drawn more than half its fair share, so a selector that folded two entries onto one
  index fails.

### Reported, not blocking

- `firstRoll` takes `stressBefore` with a default of 0. Every caller that has no counter yet reads
  as it did before.
- The application store for the counter is not built. No application state exists before Unit 2.1,
  and the plan gives that unit the store.
- The branding gate reads `git ls-files`, so a new file is scanned only after it is staged. The
  three new files were staged before the gate ran, and `files_scanned` rose from 40 to 43.

## Phase 1 is closed — what the rules core now guarantees

- **No browser, no module state, no `Math.random`.** The core runs under a plain test runner. ESLint
  bans `Math.random` and bans the seeded source from shipping code. The shuffled run and
  `core-purity.test.ts` hold the module-state rule.
- **Randomness.** `crypto.getRandomValues` through a rejection-sampling mapper with no modulo bias.
  The seeded source is injected in tests only.
- **The tables are data.** `SUCCESS_TABLE` is generated from the threshold rule, and a row longer
  than the die is unwritable. 19 tables and 162 entries, both counted.
- **The pool.** The eight-state step ladder as an index offset clamped to `[0,7]`, 56 cases plus a
  round trip. Difficulty from +3 to -3, the removal order, the help limit, and a mode switch that
  discards the pool.
- **The roll.** One function throws dice for the whole core. `successCount` and `baneCount` are
  derived. The property test holds 20 seeds by 10,000 rolls over 14 combinations inside a binomial
  bound computed in the test.
- **The push.** Four profiles as frozen data plus an override merge. One derivation answers the
  legality, the re-thrown set and the cost, and the preview reads that same answer. Profile 3 raises
  stress before the throw. A push at the limit and a push under a blocker are refused.
- **Stress and complications.** The counter is an input and an output. A stress 1 calls for a check
  at any generation, the first roll included. One original table of 12 entries.
- **The gate.** Every tracked file, `dist/`, the commit messages and the repository metadata are
  scanned against hashed terms. The last run reported `files_scanned=43` and `hits=0`.

What Phase 1 does not do: no interface, no stored counter, no log, no opposed rolls. Units 2.1, 2.2
and 4.4 own those.

## Unit 1.6 — the push resolver and the cost preview

### What landed

`src/rules/push.ts` holds `push(result, profile, random)`, `previewPush(result, profile)` and
`pushCost(result, profile)`.

`push` appends one generation. A loose die takes a new value from the random source. A locked die
repeats its previous value, so the matrix stays rectangular. A die that first appears at this
generation carries `null` for every earlier generation, which `createDie` writes.

`previewPush` answers what the push would cost and how many dice it would throw. It takes no random
source and rolls nothing. Key task 5 asks for that readout before the player commits, and the plan
puts it here so Unit 4.x renders this answer instead of computing a second one.

A refusal is a record, not an exception. `{ kind: 'refused', reason, blocker }` names the push limit
or the blocker that refused. Both functions return the same refusal for the same roll.

### One derivation, used twice

`planPush` is private and answers three questions at once: is the push legal, which dice go back in
the cup, and what does it cost. `push` and `previewPush` both read that one answer. Two derivations
would drift, and the number the player reads before the throw would stop matching the number the
rules then apply.

The test holds that by construction rather than by inspection. It asserts the preview's re-throw
count against the number of draws the injected source recorded, not against the field the resolver
reports.

### Profile 3, stress before the throw

`stressBehaviour: 'addBeforeReroll'` creates the new stress die inside `planPush`, before the
pushable set is derived. The die is therefore loose, and it is thrown in that same push. The defect
this avoids is a stress die added after the throw: it sits blank until the next push, and the player
throws one die too few. The test names it in its title and asserts the new die holds `null` at
generation 0 and a thrown value at the pushed generation.

The stress counter itself stays outside this module. The current stress is the number of stress dice
the roll carries, which is an input. Unit 1.7 owns the counter, the complication table and
`stressAfter`.

### The cost model is a data row

`COST_BEARING_TYPES` maps `cost.unit` to the dice types that pay it, from the "A 1 costs" column of
the spec's dice table. `ratingPoint` is paid by attribute and gear dice, `healthPoint` by attribute
dice, `complicationCheck` by stress dice, and `refereePoint` by none, because it is charged per push.
Nothing branches on a profile id, so a fifth cost model is a new row here plus a new row in the
profile table.

The readout carries a per-type breakdown as well as a total, so the interface reads one attribute
point and one gear step out of the same `ratingPoint` total. The resource point of profile 1 is the
attribute entry of that readout, so it needs no field of its own.

### The counted denominators

The test restates the spec inside the file. It reads no profile lock field through `isLocked` or
`lockState`, and it calls nothing in `push.ts` to build an expectation.

- 5 fixture rolls by 4 presets is 20 pairs. The matrix test counts pushes plus refusals and asserts
  20, and asserts the product is 20.
- One pair refuses, so 19 pairs push. Over those, the injected source recorded **68 draws** against
  **68** independently computed pushable dice. The test asserts that total is above zero, so no pair
  can pass on two empty sets.
- The preview test compares the same 20 pairs and asserts the compared count against the same
  product. The summed cost over those pairs is above zero, so a cost of zero everywhere cannot pass.

The re-thrown set is read out of the history matrix, not out of the value the resolver reports. The
injected source returns face 4, which no fixture die shows, so a die carrying 4 at the pushed
generation was thrown and a die that does not was kept. A separate test asserts that no fixture die
wears the marker, that 4 scores nothing, and that 4 is not a 1.

### Red-proof, a die the push should have kept

The pushable derivation was changed to `!isLocked(die, profile) || score(die) > 0`, so it re-throws
every success. Two tests went red, and the first named the dice:

```
AssertionError: pool-banes-damage-ratings / a mixed pool: the push threw the wrong dice:
  expected { Object (extra, missing) } to deeply equal { extra: [], missing: [] }
  {
-   "extra": [],
+   "extra": [ "attribute-1", "gear-2", "artifact-1" ],
    "missing": [],
  }
AssertionError: the draw count covers the loose dice and the new stress die: expected 4 to be 3
```

### Red-proof, the stress die added after the throw

The added stress die was removed from the pushable set, which is the defect by name. Two tests went
red:

```
AssertionError: pool-stress-and-complications / a mixed pool: the push threw the wrong dice:
  expected { extra: [], missing: [ 'stress-2' ] } to deeply equal { extra: [], missing: [] }
AssertionError: the new stress die was thrown in this same push: expected null to be 4
```

`src/rules/push.ts` was restored from a copy saved outside the repository after each proof, not from
git. The MD5 sum matched the saved copy both times.

### Validation

```
npm run lint       exit 0
npm run typecheck  exit 0
npm test           exit 0   vitest 8 files, 69 tests; branding node --test 11; gate hits=0
npm run build      exit 0   4.87 KB gzip against the 60 KB budget in budgets.json
```

### Reported, not blocking

- The push limit is checked before the blocker, so a roll that breaks both reports `atPushLimit`.
  The interface disables one button either way.
- The artifact curve toggle needs no plumbing here. Both artifact curves pay their first success at
  face 6, so `score(die) > 0` is the same statement under either one, and the curve cannot change a
  lock state.
- `push` returns the price read before the throw, which is the number the player committed to. The
  cost still standing after the throw is `pushCost` of the new result. Profile 4 charges for every 1
  still showing after the push, so those two numbers differ when a re-thrown die lands on a 1. That
  is the readout Unit 2.2 shows after the dice settle.
- The current stress is read as the number of stress dice in the roll. Unit 1.7 owns the counter and
  may pass it in instead.

## Unit 1.5 — push profiles

### What landed

`src/rules/push-profile.ts` now holds the four presets of the spec's "Push profiles" section as
`PUSH_PROFILES`, a frozen array of frozen records. `freezeProfile` freezes the record, `lockOnesBy`,
`cost` and `blockers`, so a caller cannot edit a shared preset. A write to a preset throws, and the
test asserts that.

`mergeProfile(base, override)` returns a new frozen record. It is total over the nine fields, it
merges `lockOnesBy` and `cost` per key, and it changes neither input. A key set to `undefined` is
read as an untouched control, not as an instruction to clear the field.

`pushBlockedBy(dice, profile)` returns the blocker that refuses the push, or `null`. It reads one
predicate per member of the `PushBlocker` union, so a new blocker cannot be added without its
reader. The push-count limit stays with the resolver at Unit 1.6.

### Three decisions, stated

1. **Which 1s lock.** Profiles 1 and 4 say "lock successes and 1s" without naming types, so they
   take the "Locks on push" column of the spec's dice table: attribute, gear and stress. Profile 1
   confirms that reading, because it states that skill 1s are inert and that artifact dice never
   degrade. Profiles 2 and 3 say "successes only", so no type locks a 1.
2. **Profile 3 has no push count.** The spec gives "One push" to profiles 1, 2 and 4 and gives
   profile 3 none, because its stress blocker ends the sequence. `maxPushes` is therefore
   `Number.MAX_SAFE_INTEGER`, not `Infinity`, because a profile is stored and `JSON.stringify`
   turns `Infinity` into `null`. The test asserts the value is above 1000 and is finite.
3. **The cost record holds one headline cost.** The spec's record carries one `cost` field, and
   profile 1 charges an attribute point and a gear step. `ratingPoint` covers both, because each is
   one point off the rating that rolled the bane. The resource point of profile 1, and the split of
   profile 4 between physical and mental health, are described in the profile text and are derived
   from the per-type bane counts at Unit 1.6.

### The fixture roll and the counted denominator

The test builds one roll by hand: six dice types, four dice each, 24 dice. Each type carries a
success, a 1, a middling face and a second middling face the player keeps by choice, so every
profile meets all three lock states on every type. The artifact die is a d8, because an artifact die
is always a step die. A separate test asserts that every success die scores above zero and every
other die scores zero, so the fixture cannot fail to separate two profiles.

The matrix test walks every preset against every dice type. It asserts 24 executed pairs against
`PUSH_PROFILES.length * ALL_TYPES.length`, and asserts that product equals 24. `ALL_TYPES` is
checked against `DICE_TYPES` as a second enumeration. The expected lock state comes from `SPEC`, a
hand-written restatement of the spec inside the test, so nothing reads `PUSH_PROFILES` to build an
expectation.

Two further tests hold the distinctions the later units need. The set of states over the whole
matrix equals `rule`, `choice` and `loose`, which Unit 3.5 renders. Profile 1 locks an attribute 1
and profile 2 leaves it loose, which is the whole difference between them.

### The red-proof

`lockSuccesses` on preset `pool-referee-gains-a-point` was flipped to `false` in the source. Two
tests went red and both named the preset:

```
AssertionError: pool-referee-gains-a-point lockSuccesses: expected false to be true
AssertionError: pool-referee-gains-a-point / attribute: expected
  [ 'loose', 'loose', 'loose', 'choice' ] to deeply equal [ 'rule', 'loose', 'loose', 'choice' ]
```

The file was restored from a copy saved outside the repository, not from git. The suite is green
again at 23 tests.

### Reported, not blocking

- The matrix test stops at the first failing pair, so a red names one dice type rather than all
  six. The preset and the dice type are both in the message, which is what the acceptance asks for.
- `pushBlockedBy` has no caller yet. Unit 1.6 is its caller, and the acceptance for this unit
  requires the blocker to be asserted rather than restated from the data.

## Unit 1.4 — roll and score

### The scope reading, stated first

The plan's acceptance says "20 seeds x 10,000 rolls per profile". The four push profiles are Unit
1.5's deliverable and do not exist yet, and the plan orders 1.4 before 1.5. A first roll needs no
push profile, because a profile governs locking and cost on a push. The property test therefore
runs per dice type and face count, which is what a first roll's distribution depends on. Unit 1.6
extends it to pushes.

### What landed

`src/rules/roll.ts` holds `roll(pool, random)`, which throws every die once and appends the result
as a new generation. A pool straight from `buildPool` holds no values, so the call gives the
generation-0 values. The input pool is not changed and no die object in it is changed.

`successCount(result)` and `baneCount(result)` are derived. They read the dice and compute, and
nothing writes them into the live model, because the spec's "Derived values" section forbids that.
`baneCount` returns one count per dice type, and a bane is a 1. A stress die therefore reports a
bane at generation 0, which is what the spec's dice table asks for.

`firstRoll` in `pool.ts` now calls `roll`, so one function throws dice for the whole core.

### Input immutability, asserted

The test freezes the pool array, every die and every `values` array, then calls `roll`. A module is
always strict, so a write to a frozen object throws. The call does not throw, the serialised pool is
unchanged, every input die still holds an empty `values`, and the result holds new die objects.

### The property test

`SPEC_ROWS` restates the spec's dice table and the four success curves as rising thresholds. The
file never reads `SUCCESS_TABLE`, `DICE_TYPES` or `CURVES`, so a skewed table moves the module and
the test apart. The k-th threshold pays k successes, so the expected `P(score >= k)` is
`(faces - threshold + 1) / faces`, and the expected bane rate is `1 / faces`.

The enumeration gives 14 combinations of dice type and face count, computed in the test from the
restated rows. One pool holds one die per combination, so a single roll covers the whole
enumeration. Each of 20 seeds rolls that pool 10,000 times.

The tolerance is `z * sqrt(p * (1 - p) / n)`, computed from the n and the p of each indicator.
There is no epsilon in the file. The z multiplier is 4.5, which is a confidence level and not a
tolerance on the rate. The two-sided per-indicator false-failure probability is about 6.8e-6. A
seed checks 38 indicators, which the test counts rather than states, so a seed fails by chance
about 2.6e-4 of the time, and two or more of 20 seeds fail about 1.3e-5 of the time. The 19-of-20
rule is therefore not itself flaky.

The bound stays far narrower than the defect it must catch. A changed table entry moves some
`P(score >= k)` by one face, which is at least 1/12, or 0.0833. The widest bound the file computes
is 0.0225. The smallest single-entry defect is therefore at least 3.7 times the widest tolerance.

**20 of 20 seeds held.**

### The counted denominators

- 14 combinations x 20 seeds = 280 combination checks, asserted against the product.
- 38 indicators x 20 seeds = 760 indicator checks, asserted against the product.
- Every combination was observed exactly 10,000 times per seed, asserted per key.
- One more indicator per combination counts scores above the top threshold the spec names. The spec
  allows none, so that count is asserted as zero rather than through a bound.
- `successCount` over the whole run is asserted equal to the sum of the per-die scores, and
  `baneCount` per type is asserted equal to the per-die bane counts. The aggregate the unit ships
  and the distribution the test measures are therefore the same numbers.

### Red-proof, a skewed success table

`generateTable` was made to pay one success on face 5 of a pool die. The failure names the dice
type, the measured rate and the bound.

```
FAIL  src/rules/roll.test.ts > the roll distribution, over 20 seeds x 10,000 rolls > holds every success rate and every bane rate inside a binomial bound
AssertionError: 0 of 20 seeds held. 100 bounds broke. seed 1 attribute d6 successes>=1: measured 0.33410, expected 0.16667 +- 0.01677 | seed 1 skill d6 successes>=1: measured 0.34040, expected 0.16667 +- 0.01677 | seed 1 gear d6 successes>=1: measured 0.33360, expected 0.16667 +- 0.01677 | seed 1 bonus d6 successes>=1: measured 0.33500, expected 0.16667 +- 0.01677 | seed 1 stress d6 successes>=1: measured 0.33640, expected 0.16667 +- 0.01677 | seed 2 attribute d6 successes>=1: measured 0.32880, expected 0.16667 +- 0.01677 | ...
exit=1
```

Five dice types take the pool curve at six faces, and 5 x 20 seeds is the 100 broken bounds.

### Red-proof, a defect the rates alone cannot see

Raising face 12 of the escalating artifact curve from 4 successes to 5 leaves every tracked
`P(score >= k)` unchanged, because 5 is at or above every threshold the spec names. The
above-the-top counter catches it and names the dice type.

```
FAIL  src/rules/roll.test.ts > the roll distribution, over 20 seeds x 10,000 rolls > holds every success rate and every bane rate inside a binomial bound
AssertionError: artifact d12: no face may score above the top threshold the spec names: expected 867 to be +0
exit=1
```

Both injections were restored from a copy held outside the repository, never by a git command. The
SHA-256 digest of `src/rules/success.ts` before and after each injection is
`88050e129440276cd7a6183013f1d15d08bd0af6eb4e27f9d06d6924c49e056c`.

### Red-proof, the seeded-source import ban

Unit 1.1 reported that nothing stopped the seeded source reaching the shipping path. ESLint now
bans it under `src/`, and allows it from `*.test.ts` only, through `no-restricted-imports` with a
per-glob override. No dependency was added. A fixture imported the seeded source from a non-test
file. The fixture is deleted.

```
/mnt/ssd/Projects/clatter/src/rules/seeded-fixture.ts
  2:1  error  './seeded-random' import is restricted from being used by a pattern. seeded-random is for tests only. Shipping code takes cryptoRandom from src/rules/random.ts  no-restricted-imports
exit=1
```

The same run reported one problem only, and three test files import the seeded source, so the
test-file exception is proven by the run that proves the ban.

### Speed

The whole test file takes 1.63 s, and the property test alone takes 1.62 s. The inner loop is not
hurt, so no sample was reduced.

### Validation

`npm run lint`, `npm run typecheck`, `npm test` and `npm run build` all exit 0. The branding gate
over the tree plus `dist/`: `files_scanned=38`, `hits=0`. Local only, no remote yet.

### Reported, not blocking

- **The success count takes no curve override.** `score` accepts one, and the artifact toggle needs
  one, but no caller can set it until the settings unit lands. `roll.ts` uses the default curve of
  each die. A curve selector is one parameter when a caller exists.
- **The property test measures the escalating artifact curve only**, because that curve is the
  artifact default. Unit 1.2 tests both artifact tables over the full enumeration, so the flat curve
  is covered where the tables are.
- **A d8 attribute or skill die reaches one threshold only**, because the step curve's second
  threshold is face 10. The test drops unreachable thresholds rather than expecting a rate of zero
  from them, and the above-the-top counter holds that end.

## Unit 1.3 — pool construction, modifiers, and the step ladder

### The spec correction, done first and on its own

The rules spec stated about 1.42 expected successes for the escalating artifact curve on a d12,
and about 1.08 for the flat one. The thresholds two lines above give 4/3 and 5/6. Unit 1.2
reported the drift and left the file alone. Commit `a17485b` states both figures as exact
fractions, points at the thresholds they follow from, and points at the success-table test that
computes them. No decimal is retyped. Nothing else in that file changed.

### What landed

`src/rules/pool.ts` holds `STEP_LADDER`, the eight states in order, and `stepIndex(index, offset)`,
which clamps `index + offset` to `[0,7]`. A modifier is an index offset and nothing else. No
procedural stepping rule exists, so `+2` then `-1` equals `+1` by construction.

`Builder` is a union of `PoolBuilder` and `StepBuilder`. `poolBuilder(counts)` builds a pool from
counts per dice type, over all six types. An artifact die carries its own size, so the count field
for that type is a list of face counts, and `ArtifactFaces` excludes 6. `stepBuilder(index, extras)`
takes the attribute and skill dice from the ladder, and `addDice` refuses a loose attribute or skill
die in step mode. Gear, artifact, bonus and stress dice go in unchanged.

`applyDifficulty(builder, modifier)` clamps the modifier to the +3 to -3 range, then steps the
ladder index in step mode, or adds and removes dice in pool mode. `addHelp` adds one die per helper
and stops at three. `switchMode` returns the empty builder for the new mode and discards the built
pool. `buildPool` gives the dice at generation 0. `firstRoll` throws them once, and returns
`{ kind: 'automaticFailure' }` for a pool of zero dice.

### The counted denominators

`pool.test.ts` writes its own eight-state ladder as pairs of face counts and its own clamp. It never
reads `STEP_LADDER` for an expectation. The full table is 8 states x 7 offsets, a product computed
in the test, and the test asserts 56 executed cases against it. It also asserts the module holds
eight states, so a ninth state fails as well as a missing one.

The round trip is split. 44 cases return the start state. The other 12 are the stated exception:
the offset leaves the list and the end of the list absorbs it, so `+n` then `-n` cannot return the
start. Counted per start state, that is 3 + 2 + 1 + 0 + 0 + 1 + 2 + 3 = 12. The test asserts both
counts and asserts that the two sum to 56. Each clamped case is asserted against its own
independently computed landing state, and asserted not to return the start.

### Red-proof, one changed ladder entry

State 6 became `d12 + d8`. Two tests went red. The failure names the state index and the expected
pair, not a count.

```
FAIL  src/rules/pool.test.ts > the step ladder, over the full 56-case table > lands on the enumerated state for every start and every offset
AssertionError: state 3 offset 3: state 6 is d12 + d10: expected [ 12, 8 ] to deeply equal [ 12, 10 ]
FAIL  ... > holds every enumerated state in order, and no state the spec does not name
AssertionError: state 6 is d12 + d10: expected [ 12, 8 ] to deeply equal [ 12, 10 ]
exit=1
```

The file came back from a copy held outside the repository, never by a git command. The SHA-256
digest of `src/rules/pool.ts` before and after the injection is
`7ace69768af9aa957aa60f6511d11ed91012d3fd62d26313970b8aa55f08c191`.

### The other three acceptance checks

- **Removal order.** The fixture holds two attribute dice, two skill dice, two gear dice and one
  bonus die, so every removable type is present and the order is observable. A -1 modifier takes a
  skill die. A -3 modifier takes both skill dice, then one gear die. A second fixture with one of
  each shows attribute go last and the bonus die stay.
- **Zero dice.** A pool of one skill die under a -3 modifier holds no dice. `firstRoll` returns
  `automaticFailure`, and the counting random source reports 0 draws. A second test rolls a pool of
  three dice through the same source and reports 3 draws, so the zero is not vacuous.
- **Mode switch.** An eight-die pool switches to step mode and gives state 0 with no dice.

### Validation

`npm run lint`, `npm run typecheck`, `npm test` and `npm run build` all exit 0. The branding gate
over the tree plus `dist/`: `files_scanned=36`, `hits=0`, and `branding-count: OK scanned=36
expected=36 tracked=34 dist=2`. Local only, no remote yet.

### Reported, not blocking

- **The spec does not say which dice a positive difficulty modifier adds.** Pool mode adds bonus
  dice, because a bonus die scores and carries no cost, so the choice adds no rule the spec does
  not hold. Help adds bonus dice for the same reason. Change the choice by changing one line.
- **Removal reaches skill, gear and attribute dice only.** That is the literal removal order. A
  bonus, stress or artifact die is not removable, so a large negative modifier can leave a pool
  that still rolls. The spec names no order for those three types.
- **The ladder labels the first die attribute and the second skill.** The spec gives the pairs and
  no labels. Push profile 4 costs a point "physical or mental according to the attribute rolled",
  so the pair needs the two names. State 0 is a lone attribute die.
- **`firstRoll` is the smallest roller that can hold the zero-draw check.** Acceptance needs a
  counting source and a zero-draw assertion, which needs a function that draws. Unit 1.4 owns
  `roll(pool, random)` and the scoring. `buildPool` stays pure, so 1.4 can take the built pool.

## Unit 1.2 — success and lock tables

### What landed

`src/rules/success.ts` holds `CURVES`, the threshold rule of the four success curves, and
`DICE_TYPES`, one row per dice type and curve with the face counts that row allows. Nine rows
cover the six types. `SUCCESS_TABLE` is generated from those two tables, keyed by
`type:curve:faces`, and every value is a per-face array sized to `faces`. `score(die, curve?)`
reads the newest face from the table. `defaultCurve` picks the curve when no toggle overrides it.
Both artifact curves ship. A new variant is a new row.

`src/rules/push-profile.ts` holds the `PushProfile` record type with every field the spec names,
plus `lockState(die, profile, curve?)` and `isLocked`. `lockState` returns `rule`, `choice` or
`loose`, so Unit 3.5 can render the three states without a rewrite. A rule lock outranks a player
choice, because the player cannot release it. The four presets are Unit 1.5's work and are not
here.

### The counted denominators

`success.test.ts` writes its own enumeration of the spec's dice-type table and restates the four
curves as branching code. It never reads `DICE_TYPES` or `CURVES` for the expectation. The
enumeration gives two products, both computed in the test: 19 tables and 162 face entries. The
test counts what ran and asserts both counts against those products. It also asserts
`SUCCESS_TABLE.size` against the table product, so an extra row fails as well as a missing one.
A second test asserts `table.length === faces` once per enumerated case and asserts its own case
count against the same product.

### Red-proof, a skewed table entry

`generateTable` was made to pay one success on face 5 of a pool d6. Three tests went red. The
first failure names the type, the face and the expected score.

```
FAIL  src/rules/success.test.ts > the success table, over the full enumeration > covers the enumerated product of type, curve and face count, and nothing else
AssertionError: attribute pool d6 face 5 scores 0: expected 1 to be +0 // Object.is equality
FAIL  ... > gives gear, bonus and stress dice one d6 row with a 6 to 1 table
AssertionError: gear: only a 6 scores: expected [ +0, +0, +0, +0, 1, 1 ] to deeply equal [ +0, +0, +0, +0, +0, 1 ]
exit=1
```

### Red-proof, a dropped enumerated case

The 12-face entry was removed from the artifact escalating row, so that table was never generated.
Six tests went red. The failure names the missing case, not a count.

```
FAIL  src/rules/success.test.ts > the success table, over the full enumeration > covers the enumerated product of type, curve and face count, and nothing else
AssertionError: the enumeration needs a table for the missing case artifact:artifactEscalating:12: expected undefined to be defined
FAIL  ... > sizes every table to its face count
AssertionError: the enumeration needs a table for the missing case artifact:artifactEscalating:12: expected undefined to be defined
exit=1
```

Both injections were restored from a copy held outside the repository, never by a git command. The
SHA-256 digest of `src/rules/success.ts` before and after each injection is
`88050e129440276cd7a6183013f1d15d08bd0af6eb4e27f9d06d6924c49e056c`.

### Reported, not blocking

- **The spec's two average figures do not match its own thresholds.** The spec states about 1.42
  expected successes for the escalating artifact curve on a d12 and about 1.08 for the flat one.
  The thresholds two lines above give 16/12, which is 1.3333, and 10/12, which is 0.8333. The
  thresholds are normative and the tests follow them. The ordering the plan asks for holds either
  way. The prose figures need an owner decision, so they are left as they are.
- **The `cost` record's `source` and `unit` fields are typed as strings.** The spec fixes no domain
  for them. Unit 1.5 narrows them when the four presets land.
- **A d6 pool table and a d6 step table hold the same entries**, because the step curve pays two
  successes at face 10 and a d6 has no face 10. Both rows ship, because the mode is a real
  distinction that Unit 1.3 needs.

## Unit 1.1 — types and random source

### The order deviation, and why it is safe

Units 0.5 to 0.7 wait for an owner decision, so Phase 0 stopped at 0.5. Unit 1.1 ran next.

Phase 0 runs first for one stated reason: nothing reaches public history before the branding gate
exists. That gate landed at Unit 0.3, and this repository is still local only. Phase 1 holds no
browser code, no network call and no name, so it cannot reach a public surface. The branding gate
ran over the new files and reported no hit.

### What landed

`src/rules/die.ts` holds `DieType` over the six types the spec names, `Faces` over 6, 8, 10 and 12,
and `Die` as `{ id, type, faces, values, manualLock }`. `values` is append-only and holds one entry
per generation. `createDie` fills `null` for every generation before the die appears. `keepValue`
repeats the previous value for a locked die. Both keep the history matrix rectangular.

`src/rules/random.ts` holds the `RandomSource` interface, the rejection-sampling mapper `fromWords`,
and `cryptoRandom`, which reads `globalThis.crypto.getRandomValues`. `src/rules/seeded-random.ts`
holds `seededRandom`, an xorshift32 source for tests only. The shipping path never imports it. The
state of each source is a closure variable, so the core holds no module-level mutable state.

ESLint now bans `Math.random` under `src/`.

### Red-proof, the mapper

The mapper became a plain `word % faces`. The suite went red and named the rejection property.

```
FAIL  src/rules/random.test.ts > the rejection-sampling mapper > rejects every word above the last whole bucket, for 6, 10 and 12 faces
AssertionError: d6: the mapper must skip the rejection zone and map 4294967291: expected 1 to be 6
Test Files  1 failed (1)
      Tests  1 failed | 5 passed (6)
exit=1
```

The file came back from a copy outside the repository. The SHA-256 digest before and after the
injection is `f802789752bdda831f5d93c227ebbbe3689016ce187d2198972fb129bf590c1d`.

### Red-proof, the `Math.random` rule

A fixture file held `Math.floor(Math.random() * 6) + 1`. ESLint went red. The fixture is deleted.

```
src/rules/mathrandom-fixture.ts
  1:38  error  'Math.random' is restricted from being used. Math.random is banned. Use a RandomSource from src/rules/random.ts  no-restricted-properties
exit=1
```

### The counted denominator

The mapper test scripts every word of the rejection zone for 6, 10 and 12 faces, then one accepted
word. The zone sizes are 4, 6 and 4, which the test derives by floor division rather than by the
remainder the mapper uses. The test asserts 14 rejections against 3 faces returned, and asserts that
the words served outnumber the faces returned.

### Reported, not blocking

- **8 faces has no rejection zone.** 8 divides 2³², so the remainder is 0 and no word can be
  rejected. That branch cannot be made to fire for a d8. A separate test asserts the empty zone and
  asserts that the top word 4294967295 maps to face 8 in one draw.
- **No test asserts that the shipping path avoids `seeded-random.ts`.** Such a test must read the
  source tree, which needs `@types/node` under TypeScript strict. That is a new dependency over the
  10 KB limit, and no shipping module exists yet that could import the seeded source. Unit 1.4 gets
  the check when a real caller exists.

## Unit 0.3 — the branding gate

`scripts/gen-forbidden-hashes.mjs` builds `scripts/forbidden-hashes.json` from a plaintext term
list that is never committed. 23 digests, `maxNgram=4`, 32-hex salt, empty allow-list.

A committed test asserts the shipped hash file can hold nothing but digests: exactly the five keys
`salt`, `algorithm`, `maxNgram`, `hashes` and `allowlist`, a 32-hex salt, every entry in `hashes`
matching `/^[0-9a-f]{64}$/`, and every allow-list entry limited to `term` and `reason`. That
property needs no secret and holds for every later list. Checked by command as well: 23 of 23 terms
are absent from the hash file, and absent from every tracked file.

`scripts/check-branding.mjs` scans four surfaces. `scripts/check-branding-count.sh` adds the file
count denominator. `scripts/check-branding.test.mjs` holds 11 tests under `node --test`. Usage and
the owner hook are in `docs/branding-gate.md`.

### The tests run against a synthetic term list

The real term list is never committed, so a suite that needed it could never go green in CI, and
`validate` runs `npm test`. The tests therefore write their own list of invented marks, generate a
throwaway hash file from it, and prove every red against that. The gate is generic. A red on a
synthetic mark proves the mechanism, needs no secret and leaks nothing.

One extra test reads the real list and scans the tracked tree for a plaintext term. It runs when
`CLATTER_FORBIDDEN_TERMS` is set, and skips with a printed reason when it is not.

```
node --test, no variable set:     11 tests, 10 pass, 0 fail, 1 skipped, exit 0
node --test, variable set:        11 tests, 11 pass, 0 fail, 0 skipped, exit 0
skip line: ok 10 ... # SKIP set CLATTER_FORBIDDEN_TERMS to run this optional check
```

The optional test can fail. Fed a list holding one ordinary word that the tree really contains, it
goes red and names the counted denominator.

```
not ok 10 - the tracked tree holds no term from the real list
    1 terms checked over 12 files
```

### Red-proofs, one per surface

Each run injected the synthetic mark `zqxvorp` into a throwaway repository under the temporary
directory. Every run exited 1.

```
=== 1 tracked ===
branding-gate: HIT surface=tracked ref=notes.txt token=1 words=1 hash=7df889a2b93d
exit=1
=== 2 dist ===
branding-gate: HIT surface=dist ref=dist/bundle.js token=2 words=1 hash=7df889a2b93d
exit=1
=== 3 commits ===
branding-gate: HIT surface=commits ref=c2b7a61f23a898f68b1c6c32f98d1e00705f40c0 token=4 words=1 hash=7df889a2b93d
exit=1
=== 4 metadata ===
branding-gate: HIT surface=metadata ref=meta.json#description token=3 words=1 hash=7df889a2b93d
exit=1
```

### Red-proof, the file count denominator

`CLATTER_BRANDING_SKIP_EXT` is a test-only variable that makes the gate skip one extension.

```
=== gate honest ===
branding-gate: files_scanned=2
branding-count: OK scanned=2 expected=2 tracked=2 dist=0
exit=0
=== gate skips .json ===
branding-gate: files_scanned=1
branding-count: FAIL gate scanned 1 files, expected at least 2
branding-count: shortfall=1 tracked=2 dist=0
exit=1
```

### The gate over this repository

```
branding-gate: files_scanned=11
branding-gate: hits=0 surfaces=tracked,dist,commits,metadata
branding-count: OK scanned=11 expected=11 tracked=11 dist=0
```

### Owner action — install the `PostToolUse` hook

Project settings are deny-listed to the agent. Paste this into `.claude/settings.json`.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "f=$(jq -r '.tool_input.file_path // empty'); if [ -n \"$f\" ]; then node \"$CLAUDE_PROJECT_DIR/scripts/check-branding.mjs\" --file \"$f\" >&2 || exit 2; fi"
          }
        ]
      }
    ]
  }
}
```

### Reported, not blocking

- The salt ships beside the digests, because the gate needs it. It stops a rainbow-table lookup, not
  a dictionary attack against a short term. The plan specifies this design.
- The tokeniser keeps ASCII letters and digits only, so a term written with a diacritic does not
  match. Every term on the current list is ASCII.
- The gate does not print the matching text, because a public CI log would then carry the term. A
  hit names the surface, the ref, the token offset and a hash prefix.

## Unit 2.0 — screen design

### What landed

Two files and no code. `docs/design/mock.html` is one static page with inline styles and no network
request. It draws the same screen three times, at 360 px, at 768 px and at 1440 px, and it draws a
filled result rather than placeholder text: a pool of seven dice under the third push profile,
rolled once and pushed once. `docs/design/0002-screen-design.md` carries the control inventory, the
budget with its counts, the contents of the one disclosure, and the keyboard order.

The screen holds six named controls. The pool bar and the dice tray are each one composite widget
with a roving tab index, so each is one tab stop. The six per-type steppers are six tiles inside the
pool bar, and each tile has a minus end and a plus end rather than two buttons. The artifact tile
steps along an enumerated ladder that carries a size and a count in one value. The stress tile is
the stress counter, because the two are the same number.

### Counts

| Figure | Before a throw | After a throw | Budget |
|---|---|---|---|
| Controls at rest, counted as tab stops | 4 | 6 | 8 |
| Hit targets, reported only | 16 | 21 | none |

The keyboard order is fixed here rather than left to emerge. Unit 4.11 fixes a pool of seven dice
and asserts 23 named visits, from the empty pool to the pushed result.

### Verification

All four validate commands passed. The mock was rendered from `file://` by a headless browser at
each of the three widths and read back as an image, so the layout is measured and not asserted.
Branding gate `files_scanned=45`, `hits=0`, exit 0, run after the two files were staged.

### Reported, not blocking

- The mock draws the third push profile, where the price of a push is a stress rise rather than a
  point of a rating. That profile is the only shipped preset that allows more than one push, so it
  is the only one that can show a live cost preview beside an already pushed roll. The same line
  prints rating points under the first profile.
- At 360 px the screen runs a little past 800 px, so a short phone scrolls a little. The action bar
  is sticky, which keeps the push one tap away at every scroll position.
- The three widths are drawn by cloning the first one with six lines of script, so the three panes
  cannot drift apart. With scripts turned off the page still shows the 360 px screen and says so.

## Units 0.5 and 0.6 — the local half

Both units mix local work with commands that need the network. The sandbox blocks the network, and
the owner has not yet added `gh *` and `git push*` to `sandbox.excludedCommands`. This entry covers
everything that does not need the network. Neither unit is complete.

### What landed

- `.github/workflows/ci.yml` — Node 22, `npm ci`, lint, typecheck, test, build, the branding gate,
  the bundle-size gate.
- `.github/workflows/deploy.yml` — `pages: write` and `id-token: write`, `environment:
  github-pages`, build, `upload-pages-artifact` with `./dist`, `deploy-pages`, on a push to `main`.
- `scripts/check-bundle-size.mjs` — the bundle-size gate.
- `base: '/clatter/'` in `vite.config.ts`.
- `docs/release-checklist.md` — the ordered network commands that finish both units.

### The branding gate in CI

The gate runs **after** the build, so it scans `dist/` as well as the tracked tree. It runs through
`scripts/check-branding-count.sh`, so the file-count denominator runs with it. The workflow does not
set `CLATTER_BRANDING_SKIP_EXT`, and a comment in the workflow says why: that variable makes the gate
under-report and would blind the denominator.

The metadata surface reads `gh api repos/{owner}/{repo}` into a file under `RUNNER_TEMP`, and passes
it with `--metadata-file`. `gh` is on the runner and `GITHUB_TOKEN` authenticates it.

The commits surface takes `github.event.pull_request.base.sha` as its base on a pull request, so the
gate reads the commits of the branch and not the whole history. A push carries no such base. The
first push also holds one commit with no parent, and the gate's range form excludes the base commit
itself, so a range would read nothing there. The workflow therefore writes the message of `HEAD` to
a file and scans it with `--file`. The denominator still holds, because it fails on a count that is
lower than expected and an extra file raises the count.

### The bundle-size gate

Every number comes out of `budgets.json`. No budget is retyped in the script. `readBudget` throws on
a null budget, so a check that reads one fails loudly instead of skipping.

The initial JavaScript is the set of scripts `dist/index.html` loads before it paints: the entry
script plus any `modulepreload` link. Each file is gzipped at the zlib default level, which is the
level a static host serves at.

**Decision — the lazy 3D chunk does not exist yet.** There is no code-split chunk before Phase 3. The
gate reports the budget as **not applicable** rather than as a pass, and it earns that report instead
of assuming it: if the initial bundle holds a dynamic `import(`, then a split chunk **must** exist,
and the gate fails when none is found. A chunk that goes missing or gets renamed in Phase 3 therefore
goes red, and cannot read as "not applicable". The alternative, failing on the absent chunk today,
would hold CI red from Unit 0.5 to Unit 3.2, and a permanently red gate gets turned off.

Every split chunk counts against the 3D budget. That over-counts if a later unit splits something
else for another reason. Over-counting fails loudly. Under-counting would pass quietly, so the
conservative direction is the correct one here.

### Measured

```
bundle-size: OK initial_js_gzip_bytes measured=4843 budget=61440 files=1
bundle-size: lazy_3d_chunk_gzip_bytes not applicable. dist holds no split chunk and the initial bundle holds no dynamic import.
bundle-size: failures=0
exit=0
```

`dist/index.html` loads `/clatter/assets/index-Bpwk-FIa.js`, read out of the built file. The base and
the repository name agree.

### Red-proofs

The real `budgets.json` was never edited. Each proof passed a copy through `--budgets`.

```
=== 1 budget lowered below the real size ===
bundle-size: FAIL initial_js_gzip_bytes measured=4843 budget=4000 files=1
bundle-size: failures=1
exit=1

=== 2 null budget ===
bundle-size: budget initial_js_gzip_bytes is null in budgets.json. It is not measured yet. Record it in the unit that owns it. Do not invent a number and do not skip the check.
exit=2

=== 3 the initial bundle splits, and no chunk is in dist ===
bundle-size: FAIL lazy_3d_chunk_gzip_bytes measured=absent. The initial bundle holds a dynamic import, so a split chunk must exist in dist.
bundle-size: failures=1
exit=1
```

Proof 3 is the one that keeps the "not applicable" report honest. The same directory with the chunk
present returns `OK lazy_3d_chunk_gzip_bytes measured=38 budget=204800 files=1` and exit 0.

### Open, and why it is open

Six commands need the network. They are listed in order, with the reason for each position, in
`docs/release-checklist.md`. Two ordering facts carry over from the plan:

- The first push is **one squashed commit**, so nothing written before Unit 0.3 reaches public
  history unscanned.
- Branch protection comes **only after one green run**. A required check that has never run green
  blocks the branch forever.

The gate proof runs on a branch named `test/gate-proof`, not `feat/*`, because `/advance` treats an
open `feat/*` pull request as a reason to do no new work.

`gh repo edit` is denied to agents, so the repository description and the topics are the owner's to
set. `gh api -X PUT` is allowed, so branch protection is not owner-only.

### Reported, not blocking

- The workflows name `actions/checkout@v4`, `actions/setup-node@v4`, `actions/upload-pages-artifact@v3`
  and `actions/deploy-pages@v4`. These are the versions already running green in this workspace. No
  newer version was checked, because the network is blocked.
- `actions/configure-pages` is not used. `base` is set in `vite.config.ts`, so nothing needs the
  value that action computes.
- The required status check in the protection body names the job `CI`. Confirm the string against the
  first green run before the protection call, because a wrong name blocks the branch forever.

## Unit 0.7 — browser harness and project skill

### What landed

`scripts/browser.mjs` is the one entrypoint. It is the single command the owner allow-lists, so
every later unit calls this file. It exports the three shared helpers, reads the renderer, samples
the frame count against a floor, and runs a self-test of each helper against a synthetic scene.

`scripts/browser-driver.mjs` is the only file that names a browser automation library. Swapping the
driver is a change to that one file.

`scripts/browser.test.mjs` holds the renderer matcher table. It runs under `npm test`. The browser
run itself stays out of `validate`.

`.claude/skills/run-clatter/SKILL.md` covers the dev server, the entrypoint, the canvas capture,
the three helpers and the sandbox realities.

`package.json` gains `browser`, `dev` and `preview`. `eslint.config.js` gains one block that gives
`scripts/browser.mjs` the browser globals, because that file holds page-side code beside node code.

### The substitution, and the price of reversing it

The plan named Playwright with `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` against a system chromium.

Measured on this host on 2026-08-09:

- **Chromium is absent.** Installing it needs `sudo`, which belongs to the owner.
- **Playwright cannot drive the firefox that is here.** It needs its own patched build and must
  download it. The sandbox blocks the download.
- **`/usr/bin/firefox` 153.0 is present** and drives over WebDriver BiDi with no download.

So the driver is `puppeteer-core` 25.5.0, a development dependency that ships nothing. Its licence
is **Apache-2.0**, not MIT. Both are inside the licence list in the decision authority, so this
raised no `BLOCKED:dependency`.

To go back to the plan's wording: run `sudo dnf install chromium`, replace the three exports of
`scripts/browser-driver.mjs` with the Playwright equivalents, and swap the development dependency.
No caller changes. Every caller uses `page.setContent`, `page.goto`, `page.evaluate` and `page.$`,
which Playwright spells the same way.

The plan's own text at "Owner actions" already priced this choice and named Unit 0.7 as the place
to decide it. The plan wording is unchanged.

### The renderer check

The check reads `UNMASKED_RENDERER_WEBGL` and matches it against llvmpipe, softpipe, swrast,
lavapipe, Mesa OffScreen, SwiftShader, the Microsoft Basic Render Driver, and the generic software
renderer names. `mesa` alone is not on the list, because a hardware Mesa driver names the card. An
empty or unreadable name fails a hardware run. Unknown is not the same as good.

A hardware run judges the renderer. An ordinary run reports it and does not judge it.

Firefox sanitises the renderer name by default and reports a coarse bucket. The driver sets
`webgl.sanitize-unmasked-renderer` to false, so the check reads the real driver. The driver also
allows a software context on purpose. A browser that refuses one reports no name at all, and the
check needs the name to fail on it.

### Measured

```
=== A. hardware run, sandbox off ===
browser: renderer hardware: AMD Radeon RX 6700 XT (radeonsi, navi22, ACO, DRM 3.64, 7.1.5-201.fc44.x86_64)
browser: OK renderer a hardware run needs a hardware renderer.
browser: mode=hardware failures=0
exit=0

=== B. ordinary run, sandbox on ===
browser: renderer unreadable: unreadable (no WebGL context)
browser: OK renderer mode=ordinary, the renderer is reported and not judged: unreadable
browser: OK frame-count-floor sampled 61 frames over 1000 ms against a floor of 30.
browser: OK helper.readDieCentroid compared=4 of 4
browser: OK helper.readUpFace compared=5 of 5
browser: OK helper.captureCanvas png=true painted_bytes=11192 blank_bytes=3158 differs=true
browser: mode=ordinary failures=0
exit=0
```

Run A and run B together prove the two modes distinguish something. A check that fails everywhere
distinguishes nothing.

### Red-proofs

Five, and none of them injected a failure into a helper the run then read back.

```
=== 1 hardware run, software rasteriser forced, sandbox off ===
browser: renderer software: llvmpipe (LLVM 22.1.8, 256 bits)
browser: FAIL renderer a hardware run needs a hardware renderer. Got software: llvmpipe (LLVM 22.1.8, 256 bits)
exit=1

=== 2 hardware run, sandbox on. The sandbox hides /dev/dri, so firefox reports
      FEATURE_FAILURE_WEBGL_EXHAUSTED_DRIVERS and there is no renderer to read ===
browser: FAIL renderer a hardware run needs a hardware renderer. Got unreadable: unreadable (no WebGL context)
exit=1

=== 3 frame-count floor, forced by a 30 ms sample ===
browser: FAIL frame-count-floor sampled 3 frames over 30 ms against a floor of 30. A statistic over
fewer frames than the floor is not reportable.
exit=1

=== 4 the three helper self-tests, one mutation each, run from a scratch copy ===
readDieCentroid, y mapping flipped:
  FAIL helper.readDieCentroid compared=4 of 4 failures: below expected (400, 450) got (400, 150);
  upper-left expected (200, 225) got (200, 375)
readUpFace, the least aligned face taken instead of the most:
  FAIL helper.readUpFace compared=5 of 5 failures: identity expected 5 got 2; x+90 expected 1 got 6;
  x-90 expected 6 got 1; z+90 expected 3 got 4; z+180 expected 2 got 5
captureCanvas, the canvas left blank:
  FAIL helper.captureCanvas png=true painted_bytes=3158 blank_bytes=3158 differs=false
Each mutation named one site. The other two self-tests stayed green in every run, so each mutation
landed where it was meant to.

=== 5 the renderer matcher table caught a real gap before this unit closed ===
renderer "Apple Software Renderer"
  + actual - expected
  + 'hardware'
  - 'software'
The pattern read `software rasteriser` only. It now reads `software (rasteriser|render)`.
```

Red-proof 1 is the plan's stated acceptance. The plan named SwiftShader. This host has no
SwiftShader, because SwiftShader arrives with chromium. `llvmpipe` is the Mesa software path, it is
on the same match list, and the run above forced it through the real code path with a real driver.
Every other name on the list, SwiftShader included, is checked in `scripts/browser.test.mjs` over a
table of 22 named renderers with the denominator asserted.

### The three helpers, and why they have a synthetic scene

There is no 3D tray yet, so the helpers have nothing real to read. Faking them would leave Unit 3.3
trusting code that never ran. So an ordinary run proves each one against a scene built in the page.

- **`readDieCentroid`** projects a body position through a camera matrix to a screen-space centroid,
  in CSS pixels with y running down. Four known positions run against a 90-degree perspective. The
  expected pixel of each one is derived by hand from the pinhole relation, so the expectation and
  the helper reach the answer by two routes. The helper does a full 4 by 4 multiply.
- **`readUpFace`** rotates each face normal by the body quaternion and takes the face nearest to +y.
  Five known quaternions run against a six-sided die. The expected face of each one is derived by
  hand from the rotation the quaternion names, and the values are written in the table.
- **`captureCanvas`** captures one element to PNG bytes. The self-test captures a blank canvas and a
  painted one and asserts that the two differ, so a capture of an empty buffer cannot pass.

`installHelpers(page)` copies the two page-side helpers into the page as `window.__clatter`. They
run where the physics bodies live, which is where Units 3.3 and 3.4 need them.

### The frame-count floor

The run counts animation frames over the sample window and asserts the count against the floor,
which defaults to 30 over 1000 ms. A run that captured four frames cannot report a statistic. The
failure names both the floor and the count it got.

### Bundle size

`puppeteer-core` is a development dependency and enters nothing. The built bundle is **4868 gzip
bytes before this unit and 4868 gzip bytes after it**, and the built file keeps the same content
hash, `index-Bpwk-FIa.js`.

### Reported, not blocking

- **The browser run is not in `validate`.** A driven browser is slow, and `/ship` caps validation at
  five attempts. Only the matcher table runs under `npm test`, and it launches nothing.
- **A hardware run inside the sandbox cannot pass.** The sandbox hides `/dev/dri`. Until the owner
  adds `node scripts/browser.mjs*` to `sandbox.excludedCommands`, every hardware run must be run
  with the sandbox off, and the report must say so.
- **`--force-software` needs the sandbox off as well.** Inside the sandbox there is no GL driver of
  any kind, so forcing the software one changes nothing.
- The three runs recorded above under "sandbox off" were run with the sandbox disabled for that
  command only.

## Unit 3.0 — vendor proof

### The order deviation, and why it is safe

The plan runs Phase 2 before Phase 3. This unit ran first. Two reasons.

1. **It needs nothing the owner owes.** Unit 2.0 waits at `BLOCKED:owner-gate` and Units 0.5 and
   0.6 wait for `sandbox.excludedCommands`. Unit 3.0 needs neither. `registry.npmjs.org` is an
   allowed domain, so the library installs and reads today.
2. **Its answer feeds back into Phase 2.** One of the three outcomes is "keep the flat renderer and
   defer 3D". Phase 2 builds that flat renderer. Knowing the answer before Phase 2 is worth more
   than knowing it after.

No Phase 2 unit is skipped and no phase is reordered. Phase 2 still runs before Units 3.1 to 3.8.

### The outcome

**GO.** The patch list is `docs/design/0003-vendor-patch-list.md`. It carries every function to
change with a line reference, the five machine measurements, the priced re-throw, and the three
runs of the conjunction check.

### The conjunction ran, it did not get reasoned

The acceptance criterion is a conjunction: a predetermined value is honoured on a re-throw of a
named subset. The plan warns that testing the two halves apart passes while the combination fails.
Measured, that warning is exact.

| Library | Cases passed | Which assertion broke |
|---|---|---|
| As published | 0 of 4 | The pushed dice show what the physics produced. The kept dice are correct and do not move. |
| The re-throw patch alone | 0 of 4 | The pushed dice carry the named value and sit 328,000 units off the table. |
| All three patches | 4 of 4, four times, 16 of 16 | none |

The runs used `/usr/bin/firefox` through `scripts/browser-driver.mjs`, **with the sandbox off**, on
`AMD Radeon RX 6700 XT`. The sandbox hides `/dev/dri` and gives no WebGL context at all.

### The red-proof that changed the check

The middle row above is the useful one. Before the check asserted that every body reports the cannon
sleeping state, that row passed every assertion the check then held. The dice carried the right
numbers and were nowhere near the tray. A rule of "the pushed die moved more than 20 units" is
wider than a defect that moves a die 328,000 units, so the instrument was blind by construction.
The repair was a property with no free parameter, not a smaller number.

A second assertion, "every die projects inside the canvas", did **not** catch it either. A die
328,000 units away still projects inside the viewport.

### One part of fact 2 is refuted

The plan says the trademark "would fail Unit 0.3's gate the moment the tray landed". It would not
have. The gate matches salted hashes, and this term was not on the list, because the list covers the
publisher of the reference document and not this one. The gate read the library and printed
`hits=0`.

This unit adds the salted hash to `scripts/forbidden-hashes.json`. The same command now prints
`hits=58` and exits 1. The plaintext term is written nowhere in this repository, in the patch list,
in a test, in a filename or in a commit message.

### Nothing from the library entered this repository

The library was installed into a scratch project under `$TMPDIR`, outside the repository. This
repository's `package.json` and `package-lock.json` are unchanged. The probe, the patched copies and
the captured render all live under `/tmp/claude-1000/probe` and are not committed.

### Reported, not blocking

- **The conjunction check is not in `validate`.** It needs a browser and a GPU. Units 3.3 and 3.4
  own the permanent versions, driven through `scripts/browser.mjs`.
- **"The kept dice did not move" cannot fail as written.** A settled body is kinematic and has
  infinite mass, so it cannot move. Unit 3.4 must red-proof it with the test-only offset hook the
  plan names, or the check reads the constant it bounds.
- **The plan's 672 KB of sounds is disk usage, not bytes.** The byte count is 540,987 over 75 files.
  `du -sh` rounds 75 small files up to the 4 KB block.
- **Two defects the plan did not name.** The face swap drops the collision shape, and
  `getScreenPosition` takes a three.js vector and not a cannon vector. Both are in the patch list.

## Unit 3.1 — vendor and strip

### The order deviation, and why it is safe

The plan runs Phase 2 before Phase 3. This unit ran ahead of Units 2.1 to 2.3, for the same two
reasons Unit 3.0 recorded, plus one more.

1. **It needs nothing the owner owes.** Unit 2.0 waits at `BLOCKED:owner-gate`. Units 0.5 and 0.6
   wait for `sandbox.excludedCommands`. This unit waits for neither.
2. **Unit 3.0 answered the fork Phase 2 depended on.** The answer is GO, so Phase 2 builds the flat
   renderer as a fallback and not as a substitute.
3. **The patch list is fresh.** It carries line references into one exact tarball. Every line moves
   the moment a later unit re-vendors, so the cheapest time to apply it is now.

No Phase 2 unit is skipped. Units 2.1 to 2.3 still run before Units 3.2 to 3.8.

### What entered the repository

`src/tray/vendor/` holds `dice-tray.js` at 18,786 lines and 766,036 bytes, the typings at
`dice-tray.d.ts`, the MIT notice at `LICENSE`, and `README.md`. The README names the source
package, its version, its tarball integrity hash, every deletion and every edit. `package.json` and
`package-lock.json` are unchanged, because this is a copy and not a dependency.

The library was installed into a scratch project outside the repository. The stripped file was
built there, and the branding gate read it there and printed `hits=0` **before** anything was
staged. Nothing carrying the term ever reached the index.

### What was removed

| Removed | Count | Effect |
|---|---|---|
| The published colour-set table | 51 entries, 41 occurrences of the term | Six sets this repository owns replace it. |
| Dice-type definitions carrying the term | 17 of 41 | 24 remain, and every one the rules core needs is among them. |
| The sound files | 75 files, 540,987 bytes | Never copied. Unit 3.6 supplies its own. |
| The texture files | 38 files | Never copied. All six colour sets use the `none` texture. |
| The peer dependencies | 2 | three.js and cannon-es are inlined. The typings now name no external module. |

The six sets are `ember`, `ash`, `verdigris`, `bone`, `void` and `cobalt`. They are abstract names
with values chosen here. **No published value was carried across under a new name.** Constraint 1
treats a reproduced dice colour convention as closer to trade dress than to rules, so porting the
old numbers would defeat the deletion.

The 17 dice definitions were selected by the hashes in `scripts/forbidden-hashes.json`, not by a
search for text. The term is therefore written nowhere, not even in the tool that removed it.

### What was kept, against the patch list

The patch list also lists the theme table for deletion. It stays. It carries no occurrence of the
term, the lazy chunk is already inside its ceiling, and Unit 3.2 picks the surface a scene uses.
Deleting all but one theme is a byte saving that unit can take with the scene in front of it.

### The six edits

| Edit | Effect |
|---|---|
| `swapDiceFace` carries `cannon_shape` across the geometry clone | A re-spawned die keeps its collision shape. |
| `swapDiceFace_D4` does the same | The same defect on the four-sided path. |
| `reroll(ids, forced)` | Simulates, forces each named face, then replays the same fixed steps. The published method applied a vertical velocity and let the physics decide. |
| `initialize` passes `preserveDrawingBuffer` | A share card can read the canvas back. |
| The default configuration carries the flag, and the typings expose `renderer` | A caller can draw a fresh frame. |
| `getScreenPosition` projects any `{x, y, z}` | The published method called `clone()` on its argument, so a physics body threw. |

The first two edits are latent until the third exists. Nothing in the published library re-spawns a
body from a swapped geometry, so the re-throw patch is what makes the dropped collision shape
reachable.

Each edit asserts it matched exactly once against the untouched file. A silent no-op cannot pass.

### The conjunction ran again, against the stripped copy

Unit 3.0 measured the patches on a full library. This unit removed a third of the colour data and
17 dice definitions, and it moved the default colour set. That is exactly the change no acceptance
criterion of this unit can see, because both criteria read byte counts.

So the Unit 3.0 probe ran again on the GPU with the sandbox off, against this repository's copy,
with `theme_colorset` set to `bone`. Four of four cases pass on d6, d8, d10 and d12. Every
assertion holds: the forced roll, the forced push of the named subset, the kept values, the kept
positions at 0.0 units, the on-screen test and the cannon sleeping state.

### The tooling split

Vendored code is not ours to style, so lint and strict typechecking skip it. It is exactly the code
that can fail a gate, so both gates still read it.

| Tool | Setting | Reason |
|---|---|---|
| ESLint | `ignores` gains `src/tray/vendor/**` | Not ours to style. |
| TypeScript | `exclude` gains `src/tray/vendor` | Not ours to type. `skipLibCheck` already leaves the declarations unchecked. |
| Prettier | `.prettierignore` gains `src/tray/vendor/` | A reformat would rewrite 766 KB and break the line references in the patch list. |
| Branding gate | unchanged | The gate reads `git ls-files` and `dist/`. The copy is tracked and it builds. |
| Bundle-size gate | unchanged | The copy is the lazy chunk. |

The gate reads the copy, and the file count proves it. Before this unit the tracked surface scanned
52 files. After it, 57. The five new files are the four in `src/tray/vendor/` and the loader.

### The red-proof

One occurrence went back into `src/tray/vendor/dice-tray.js`, lifted from the untouched library by
the same hash selection that removed it. The tool asserted the file carried exactly one occurrence
before it wrote, so the injection is known to have landed. The build then ran and the gate read
`dist/`.

    branding-gate: HIT surface=dist ref=dist/assets/dice-tray-<hash>.js token=99251 words=2 hash=473a1cec6c31
    branding-gate: files_scanned=3
    branding-gate: hits=1 surfaces=dist
    exit=1

The gate names the surface and the built file. It prints no plaintext, only a hash prefix. The file
was then restored from the clean copy in the scratch directory and compared byte for byte. Neither
`git stash` nor a git restore of the file ran, because either one deletes uncommitted work.

### The measurements

| Measure | Before | After |
|---|---|---|
| Initial JavaScript, gzip bytes | 4,843 | 6,392 |
| Lazy 3D chunk, gzip bytes | absent | 152,583 |
| Tracked files the branding gate scans | 52 | 57 |

Both figures sit under the ceilings in `budgets.json`. The rise in the initial chunk is the Preact
hook and the loader button, not library code. The library is behind `import()` in
`src/tray/index.ts`, and the build splits it into `dist/assets/dice-tray-*.js`.

The bundle-size gate reports the lazy chunk for the first time. Before this unit it printed "not
applicable", because `dist/` held no split chunk and the initial bundle held no dynamic import.
That branch is now closed, and a chunk that goes missing later fails the gate instead of reading as
absent by design.

### Reported, not blocking

- **The conjunction check is still not in `validate`.** It needs a browser and a GPU. Units 3.3 and
  3.4 own the permanent versions.
- **The loader button in `src/app.tsx` is provisional.** It exists so the tray is fetched by a
  deliberate act and so the split is real. Unit 2.0 replaces the screen and Unit 3.2 mounts the
  scene.
- **The vendored typings hold `any` for the three.js and cannon-es handles.** Both libraries are
  inlined and neither is a dependency, so no real type is available. A unit that needs one narrows
  it at the point of use.
- **No texture file was copied.** A unit that wants a surface texture adds the files it needs.
- **The theme table is a saving Unit 3.2 can still take**, worth part of the 3,737 gzip bytes Unit
  3.0 measured for the two tables together.

## Unit 3.2 — tray scene

### The order deviation

Phase 2 is not built. Unit 2.0 waits at `BLOCKED:owner-gate` and Units 2.1 to 2.3 have no owner
approval to work from. Phase 3 needs none, so it runs ahead. The provisional button in
`src/app.tsx` still exists, and it now mounts the scene rather than fetching the chunk and dropping
it. Phase 2 replaces the whole screen.

### What landed

`src/tray/scene.ts` holds `mountTray`, the surface colour, the colour set and the pixel-ratio cap.
It is 80 lines. The camera, the lights, the tray walls and the physics world all come from the
vendored library, which builds them in `setDimensions` and calls that method again from its own
resize listener. The module adds the three things the library leaves out.

- **A container the library can measure.** The library reads `clientWidth` and `clientHeight` in
  its constructor. A container with no size gives a tray with no walls, so `mountTray` refuses one
  and names the measurement it read.
- **The surface.** The renderer clears to transparent and the desk is a shadow catcher, so the
  colour a player sees is the element behind the canvas. One surface, `#23262b`, and the six colour
  sets sit on it. `bone` is the set in these captures.
- **The pixel ratio.** `chooseTrayPixelRatio` caps the device ratio at `MAX_PIXEL_RATIO`, which is
  2. Three cases are unit tested, including the fall back to 1 on a ratio that is not a positive
  number.

The application mounts the scene through the dynamic import Unit 3.1 left in `src/tray/index.ts`,
so the library stays in its own chunk.

### The render counters

Measured with the sandbox off, on `/usr/bin/firefox` against
`AMD Radeon RX 6700 XT (radeonsi, navi22, ACO, DRM 3.64, 7.1.5-201.fc44.x86_64)`. There is no WebGL
context at all inside the sandbox, so every number in this row comes from an unsandboxed run.

The scene is fixed and the harness owns it: `3d6+3d8+3d10+3d12` with one predetermined value each.
Three dice of every face count the rules core uses. A later unit that adds an object to the scene
moves these counters, which is the point of the budget.

| Counter | Measured | Ceiling |
|---|---|---|
| Draw calls | 841 | 968 |
| Triangles | 842 | 969 |
| Textures | 77 | 89 |

The three counters read identically at 360 by 640 and at 1440 by 900, over six runs. They are
deterministic integers for a fixed scene.

**The headroom is 15 per cent, rounded up.** A ceiling equal to the measurement goes red on the
first legitimate addition, and one with open slack never fires at all. 15 per cent of the draw-call
count is 126, which is a little more than the 116 draw calls one more d12 costs, so the gate admits
the per-die affordance Unit 3.5 adds and fires on anything that grows the scene by a second pass.
15 per cent of the texture count is 11, which admits a surface texture and fires on a second label
set. Do not widen these numbers to make a check pass. Constraint 5 says price the options and hand
the choice back.

**Why 841 draw calls.** Each die carries one geometry group per triangle, so three.js issues one
draw call per triangle: 44 for a d6, 44 for a d8, 76 for a d10 and 116 for a d12. Twelve dice give
840, and the desk gives one more. The four die types use 14 to 26 materials each, so merging the
groups that share a material would cut the count by roughly three quarters. That is a real
optimisation and it belongs to Unit 3.8, which owns the performance gates. It is reported here, not
taken.

The counters are the main-pass counters. three.js resets `info.render` once the shadow pass is
drawn, so the shadow pass is not in these numbers.

### The red proof of the counter gate

The ceiling was lowered in a **scratch copy** of `budgets.json`, read through the new `--budgets`
option. No git command ran, and the tracked file was never edited.

    $ node scripts/browser.mjs --tray --url http://127.0.0.1:5178/clatter/ \
        --viewport 360x640 --budgets "$SCRATCH/budgets-red.json"
    browser: FAIL render-counter.draw_calls draw_calls measured=841 budget=800
    browser: OK render-counter.triangles triangles measured=842 budget=969
    browser: OK render-counter.textures textures measured=77 budget=89
    browser: mode=ordinary failures=1
    exit=1

The failure names the counter, the measurement and the ceiling. The other two counters stay green,
so the injection landed on the one counter it was aimed at.

An unrecorded counter fails the same check rather than skipping it. The first run of this unit
printed `budget=unrecorded` and exited 1 for all three, which is how the measurement was taken.

### The pixel ratio

The library never calls `setPixelRatio`, so it draws one device pixel per CSS pixel. Each ratio was
priced on the settled twelve-die scene, with `gl.finish()` after every frame. Without that call the
clock measures how fast the driver accepts commands, and the number does not move when the pixel
count does. Firefox clamps `performance.now` to 1 ms on this host, so the mean over 90 frames is
the reportable figure and the median is not.

| Canvas | Ratio 1 | Ratio 2 | Ratio 3 |
|---|---|---|---|
| 360 by 640 | 2.900 ms | 3.122 ms | 3.522 ms |
| 1440 by 900 | 3.222 ms | 4.256 ms | 6.144 ms |

**`MAX_PIXEL_RATIO` is 2.** On the largest canvas measured, the step from 1 to 2 costs 1.03 ms per
frame for four times the pixels. The step from 2 to 3 costs a further 1.89 ms for a difference no
eye reads at phone viewing distance. A phone pays a much larger multiple of that cost than this
card does, so the second step is the one to refuse. These are desktop numbers. The only honest
measurement of a phone is the overlay Unit 3.8 builds.

### The tray walls, and the defect the render found

The library already sizes the walls from the canvas and re-sizes them on a window resize. It places
them at 93 per cent of the frame. That fraction is wrong at a phone width, and the render showed it
before any check did.

The camera frames exactly `containerWidth` by `containerHeight` world units, and a die is a fixed
world size. The wall margin is therefore 3.5 per cent of the canvas width in CSS pixels: 50 pixels
at 1440, and 12.6 pixels at 360. A die is 45 CSS pixels across at every canvas size. So a die at
rest against a wall hangs over the edge of a 360 pixel screen, and the same tray is fine on a
desktop. This is the failure the unit brief names, and it needed the 360 pixel capture to see.

The wall now stands one `baseScale` inside the frame. The die bounding sphere measures one
`baseScale` in radius, so a die at the wall reaches the frame edge and no further. The bound has no
free parameter to tune. A die also enters the tray inside its own walls, because the published
spawn point sits at 90 per cent of the frame and would now be outside them.

`tray.every-die-whole-on-screen` asserts the property the eye reads: every body is asleep, and
every body centre plus its own radius clears the frame. A bound on the centre alone passes on a die
the player sees cut in half. Its red proof restored the published 93 per cent inset:

    browser: FAIL tray.every-die-whole-on-screen checked=12 of 12 against a frame of 360 by 640
    half-units, walls at 335 by 595, widest die radius 100, for a canvas of 360x640 css pixels.
    awake=0 overhanging=1 [4 at (-274, 496) radius 100 overhangs by 14]

The failure names the die, its position and the overhang. **It went red on the second run and green
on the first**, because the defect depends on where a die comes to rest. The published inset
therefore clips a die some of the time, and the current inset clips none by construction.

`tray.walls-follow-the-canvas` resizes the viewport and asserts the tray matches the new canvas. It
ran both ways, 1440 to 360 and 360 to 1440.

### Two more vendor edits the render forced

Neither was in the unit brief. Both were found by looking at the capture.

- **The dice rendered olive.** The published ambient light is a pale yellow sky over an olive-green
  ground, tuned for the green table of a theme this repository deleted at Unit 3.1. The ground
  colour is now the surface colour, which is what a hemisphere light means.
- **The dice then rendered grey, not bone.** A die face texture is a canvas painted with the colour
  set, and the published build leaves its colour space unset. The renderer then reads a colour
  authored in sRGB as if it were linear, and every colour set comes out pale and washed. One
  property fixes it. `bone` now reads as a warm cream under the key light.

Both are recorded in `src/tray/vendor/README.md`. The theme table is also down to one entry, which
is the saving Unit 3.1 left for this unit. Nothing read the other fields of an entry.

### The captures

`docs/design/0004-tray-scene-360.png` and `docs/design/0004-tray-scene-1440.png`. Both hold the
same twelve-die scene. Twelve dice lie flat on the surface, lit from the upper left, each with a
shadow under it, all inside the frame and none clipped. The faces are readable at 360 pixels.

**One thing for the owner to judge.** A die is 45 CSS pixels across at every canvas size, so the
1440 capture shows twelve small dice on a wide empty table. That is correct for a tray that fills a
desktop window, and it will look different once Phase 2 gives the tray an element of its own rather
than the whole viewport. It is a layout decision, not a scene defect.

### The measurements

| Measure | Before | After |
|---|---|---|
| Initial JavaScript, gzip bytes | 6,392 | 6,805 |
| Lazy 3D chunk, gzip bytes | 152,583 | 152,290 |

The initial chunk grows by the scene module and one Preact hook. No library code is in it. The lazy
chunk falls, because the theme table went and the four vendor edits are smaller than it was.

### Reported, not blocking

- **The browser run stays out of `validate`.** It needs a dev server, a browser and a GPU. The four
  validate commands do not.
- **The tray run needs a Vite dev server**, because it imports the scene module from source. Start
  one, then run `node scripts/browser.mjs --tray --url <dev server>`.
- **841 draw calls is a high number for a phone.** The cause is one draw call per triangle, and the
  fix belongs to Unit 3.8. See above.
- **The vendored library still calls `Math.random`** for its throw vectors. The outcome of a roll
  never depends on it, because the rules core decides every value before the throw. Constraint 7
  covers shipping code that decides a result. This is recorded, not changed.

## Unit 3.3 — throw a pool

### The order deviation

Phase 2 is not built. Unit 2.0 waits at `BLOCKED:owner-gate`, and Units 2.1 to 2.3 have no owner
approval to work from. Phase 3 needs none, so it runs ahead. Nothing here waits on the screen
design: the tray takes a `RollResult` and the application layer that builds one comes later.

### What landed

`src/tray/throw.ts` holds three functions and 80 lines.

- `trayOrder(dice)` gives the order the tray holds a pool in. The library spawns grouped by face
  count, so the pool is sorted by face count, ascending, with pool order kept inside a group.
- `poolNotation(dice)` builds one notation string with the decided values after `@`. A die with no
  value throws rather than letting the library pick a face.
- `throwPool(box, result)` throws the newest generation and returns the pool in tray order, so a
  caller maps a tray index back to a die. It reads no random source and it decides nothing.

`src/tray/dice-colors.ts` holds the neutral base colour set and one colour per dice type.

### The tray decides nothing

The rules core decides every value first. `throwPool` takes a `RollResult`, reads the newest value
of each die, and hands the whole list to the library after `@`. The module imports `latestValue`
and nothing else from the core. It never imports a random source.

The order matters and it is the one thing that could silently go wrong. The library applies the
values after `@` to the dice it spawns, in spawn order, and it spawns grouped by face count. A pool
handed over in any other order lands its values on the wrong dice, and every value would still be
one the core decided, so a check on the multiset of values could not see it. `trayOrder` is that
order, and the browser check compares die by die, by identity.

### Colour by type, and what carries it besides colour

Every die face is drawn on one neutral base — a white body, black ink, a grey outline — and the
renderer multiplies the colour of the type into it. The colour is therefore the body colour a
player sees, and the ink stays black on every die.

**The six colours cost no texture.** The library builds one material per face per die and shares
only the face textures between them. Measured: the 24-die pool with all six colours draws **77
textures**, the same number the one-colour twelve-die scene of Unit 3.2 draws. A colour baked into
a face texture would have cost one texture set per type and per face count instead.

| Type | Colour | CIE L* |
|---|---|---|
| stress | red | 49 |
| artifact | violet | 58 |
| gear | steel blue | 67 |
| skill | green | 76 |
| bonus | amber | 85 |
| attribute | ivory | 94 |

**Constraint 6, colour is not the only carrier.** The six colours form a lightness ladder. Sorted
by CIE L*, no two are closer than 8 L*, which is about five times the step an eye reads on a large
area. A player who cannot separate two of the hues still reads six shades, and a greyscale copy of
the tray still separates them. `src/tray/dice-colors.test.ts` measures all 15 pairs against a
denominator computed from the type list, and it computes every number from the hex values rather
than reading a recorded one. It also holds the numeral at 4 to 1 or better against its own die, and
the die at 3 to 1 or better against the tray surface.

**What that does not cover.** The ladder is measured on the table, not on the render. The scene
light darkens every colour by roughly the same amount, so the render compresses the ladder while
keeping its order. The tray also carries no shape mark for type. A die shape is its face count, and
two types share a face count, so shape cannot carry type here. The text carrier is the pool list
and the history matrix, and both belong to Phase 2.

**No theme system was built.** Themes are three axes and they arrive at Unit 4.8. A theme re-tints
by replacing one table of six colours, because nothing is baked.

### The machine check

`node scripts/browser.mjs --pool` needs `--url`, a dev server and a graphics card, so it stays out
of `validate`. It ran with the sandbox off against
`AMD Radeon RX 6700 XT (radeonsi, navi22, ACO, DRM 3.64, 7.1.5-201.fc44.x86_64)`. There is no WebGL
context at all inside the sandbox.

The check asks the rules core for one die of every type and every face count, at seed 20260809.
That is 24 dice. It then reads each die's up-face from its body quaternion, through the library's
own `getFaceValue`, which projects the geometry face normals through `body.quaternion` and takes
the one nearest to up. It reads no stored value.

| Check | Result |
|---|---|
| `pool.up-face-equals-core-value` | `compared=24 of a pool of 24, read from each body quaternion. wrong=0` |
| `pool.type-face-combinations` | `covered=24 against 6 types times 4 face counts, a product of 24` |
| `pool.every-die-at-rest-and-whole-on-screen` | `checked=24 of 24 ... awake=0 overhanging=0` |
| `pool.colour-separates-the-types` | `classified=24 of 24 dice against 6 type means read off the frame` |

The compared count is asserted equal to the pool size, and the pool size is asserted above zero. A
run that compared three dice of twelve would fail on the denominator alone. The combination count
is asserted against a product computed in the check, not against a written 24.

The colour check reads the drawn frame, not the material. It takes the upper quartile of a patch at
each die centre, which is body rather than numeral, then gives every type the mean of its own dice
and sends each die to the nearest mean. It never reads the colour table, so it cannot pass by
reading the constant it bounds, and it carries no tolerance to widen. The two means that sit
closest are gear and artifact, at 0.122 linear units.

The first version of that check took the median of the patch and failed two dice of 24. The median
at the die centre is the black numeral, not the body.

### The red proof

`poolNotation` was made to act out a value one higher than the core decided, for exactly one die of
the 24. The run went red and named the die, the value the core decided and the value read off the
quaternion:

    browser: FAIL pool.up-face-equals-core-value compared=24 of a pool of 24, read from each
    body quaternion. wrong=1 [artifact-d8 expected 6, the quaternion reads 7]

The other 23 dice still compared, so the denominator held while the check failed. The file was
restored from a copy saved before the edit, and the hash of the restored file matches the hash of
the saved one. No git command ran.

The unit tests can fail too, and one did while it was being written: the colour assertion in
`throw.test.ts` went red with `expected [ '' ] to deeply equal [ '#68AAE2' ]` when the fake material
recorded the colour on the wrong object.

### The capture

`docs/design/0005-typed-pool-1440.png`, the 24-die pool at 1440 by 900. **For the owner, not for
the gate.** An agent cannot read a digit off a WebGL render.

What the capture shows. All six colours are present and every one is separable from the other five:
brick red, violet, steel blue, green, tan and pale grey. All four die shapes are there. The
numerals are black and legible on every colour, the darkest included. The dice read darker and less
saturated than the table above, because the scene light is below full brightness, and the order of
the ladder survives that. The pair a reader must look twice at is violet against steel blue, which
is the pair the machine check also reports as the closest.

### Reported, not fixed

- **A ten on a ten-sided die shows a `0`.** The library labels the faces `1` to `9` and `0`, and it
  maps that `0` to the value 10. Every check reads 10 and the render shows `0`. Physical
  ten-sided dice are labelled the same way. A unit that wants a `10` on the face must supply its
  own label set, which costs one texture set.
- **The first frame of a throw draws the dice uncoloured.** The library spawns and draws before it
  returns, so `throwPool` colours the dice one frame later. It is one frame at the start of a
  tumble.
- **The pool scene is not the budget scene.** `budgets.json` records the twelve-die scene of Unit
  3.2 and that scene still measures 841 draw calls, 842 triangles and 77 textures with the new base
  colour set. The 24-die pool measures 1681, 1682 and 77, and it is reported rather than judged.

### Measurements

| Number | Value |
|---|---|
| Lazy 3D chunk | 152,290 gzip bytes, unchanged. The ceiling is in `budgets.json`. |
| Initial JavaScript | 6,858 gzip bytes, up from 6,805. |
| Branding gate | `files_scanned=69`, `hits=0`, exit 0. |
| Validate | `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, all exit 0. |

The colour work added no bytes to the 3D chunk, because it added no texture and no library code.

## Unit 3.4 — the push, on the table

**This unit closes the main effort.** `CLAUDE.md` names Units 3.0 to 3.4 the project's bid for
success. The claim they carry is that the kept dice stay on the table while the rest go back in the
cup, and this is the unit that delivers it and measures it.

### The order deviation

Phase 2 is not built. Unit 2.0 waits at `BLOCKED:owner-gate`, and Units 2.1 to 2.3 have no owner
approval to work from. Phase 3 needs none, so it runs ahead. The tray takes a `RollResult` and a
`PushedRoll` from the rules core, and the application layer that builds them comes later.

### What landed

`pushPool(box, ordered, pushed)` in `src/tray/throw.ts`, 46 lines.

- `ordered` is the list `throwPool` returned, so index `i` of it is `box.diceList[i]`.
- `pushed.rerolled` names the dice that go back in the cup. The tray names no other die, so every
  kept die stays where it lies.
- The values come from `pushed.dice`. The tray reads them and adds nothing.
- It returns the same order carrying the new generation.

`scripts/browser.mjs --push` is the machine check. `--capture-before` writes the frame before the
push. `--offset-kept <n>` is the test-only hook that breaks the kept-die assertion on purpose.

### The tray decides nothing, again

`src/rules/push.ts` decides which dice are pushable and what the new values are. `pushPool` maps
each pushed id to a tray index, reads the newest value of each pushed die, and hands both arrays to
the library. It imports `latestValue` and one type. It reads no random source.

The library still picks the throw vector. That is a trajectory, not a value, and the value is
forced onto the die after the simulation settles.

### Two criteria the plan wrote, repaired

Unit 3.0 measured both of them failing to catch a real defect. The repaired versions are what this
unit built.

**"The pushed subset moved more than 20 px" is a tolerance wider than the defect.** With the
re-throw patch alone, the dice carry the right values and land 328,000 units off the table. A die
that far away still projects inside the viewport, so an on-screen check does not see it either. The
distance is therefore reported and never gated. The gate is that every body is asleep and inside the
tray walls at rest. The section "The red proof of the settle assertion" measures that the old bound
would still have passed.

**"Kept dice do not move" cannot fail as written.** A settled body is kinematic with infinite mass,
so the assertion reads a constant the model writes. `--offset-kept` moves one kept body sideways by
3 screen pixels, and the check then goes red and names that die. Without the hook this unit would
ship its central claim untested.

### The fixture, and the denominator

Generation 0 is a fixture, not a draw, so **locking is guaranteed**. Eight dice: one kept and one
pushed at each of d6, d8, d10 and d12. The kept dice are attribute dice showing a success, and the
profile `pool-banes-damage-ratings` locks successes, so they lock whatever a seed does. The pushed
dice are skill dice below the success threshold, and that profile charges no lock on a skill die.

The core still decides. `push.the-core-locked-the-fixture-it-was-given` compares the set the core
locked against the set the fixture means to lock, both ways, with a floor of 1. A push where nothing
locked fails there before the kept-die check reads a single centroid.

The kept-die check compares against the count the core reports as locked, not against a count of the
fixture. `compared=4 of the 4 dice the rules core reports as locked, out of a pool of 8`.

### The machine check

`node scripts/browser.mjs --push` needs `--url`, a dev server and a graphics card, so it stays out
of `validate`. It ran with the sandbox off against
`AMD Radeon RX 6700 XT (radeonsi, navi22, ACO, DRM 3.64, 7.1.5-201.fc44.x86_64)`, at 1440 by 900,
seed 20260810.

Each kept die's body position goes through `camera.projectionMatrix * camera.matrixWorldInverse` to
a screen-space centroid in CSS pixels, before the push and after it.

| Check | Result |
|---|---|
| `push.kept-dice-do-not-move` | `compared=4 of the 4 dice the rules core reports as locked ... deltas_px=[kept-d6 0.000, kept-d8 0.000, kept-d10 0.000, kept-d12 0.000] failures=0` |
| `push.every-die-asleep-and-inside-the-tray` | `checked=8 of 8 ... awake=0 outside=0` |
| `push.up-face-equals-core-value` | `compared=8 of 8, read from each body quaternion after the push. wrong=0` |
| `push.face-count-and-role-combinations` | `covered=8 of the 8 dice on the tray, against 4 face counts times 2 roles, a product of 8` |
| `push.the-core-locked-the-fixture-it-was-given` | `the core locked 4 dice against the 4 the fixture means to lock, and the floor is 1. disagreements=0` |

Reported, not gated. How far the pushed dice travelled on the screen:

    browser: push pushed dice moved pushed-d6 1075.7 px, pushed-d8 668.8 px,
    pushed-d10 333.3 px, pushed-d12 597.5 px

### The red proof of the kept-die assertion

`--offset-kept 1` moved the second locked die by three screen pixels, after the push and before the
second read. The hook prints both centroids, so the run shows the offset landed before it believes
the red:

    browser: push OFFSET HOOK moved kept-d8 at tray index 2 from (1188.824, 81.660) to
    (1191.824, 81.660), 5.932 world units, 3.000 px
    browser: FAIL push.kept-dice-do-not-move compared=4 of the 4 dice the rules core reports as
    locked, out of a pool of 8 ... deltas_px=[kept-d6 0.000, kept-d8 3.000, kept-d10 0.000,
    kept-d12 0.000] failures=1 [kept-d8 moved 3.000 px]

The failure names the die. The other three still compared, so the denominator held while the check
failed. Exit 1.

### The red proof of the settle assertion

The off-table landing was forced the way Unit 3.0 measured it: patch A was removed from the vendored
bundle, which leaves the re-throw patch without its companion. The mutated line read
`e.geometry = a, e.result = [];`. Three of the four pushed dice then spawned with no collision shape
and fell through the tray:

    browser: FAIL push.every-die-asleep-and-inside-the-tray checked=8 of 8 ... awake=3 outside=3
    [1 at (15603, 1341) radius 90 overhangs by 14253; 3 at (15578, -1674) radius 100 overhangs by
    14238; 7 at (15514, -2125) radius 90 overhangs by 14164]

The failure names each body that is awake or outside the walls. It is not a distance.

**The old bound would have passed that run.** In it the pushed dice measured 397.7, 460.3, 570.0 and
709.5 screen pixels of movement, and the healthy run measures 167.3 to 1075.7. A gate of "more than
20 px" cannot separate the two. `push.up-face-equals-core-value` also stayed green through the
failure, because the dice carried the values the core decided the whole way down. Exit 1.

The vendored file was restored from a copy saved before the edit. Its SHA-256 after the restore is
`39546a34d812e72093b58c35778e07bb90bc8eea8695cba66da3cfa6b489b902`, which equals the hash of the
saved copy and the hash taken before the edit. No git command touched the file.

### The captures

`docs/design/0006-push-before-1440.png` and `docs/design/0006-push-after-1440.png`. **For the owner,
not for the gate.** A whole-canvas image diff is the wrong instrument here, because the unit
requires the new generation to look different, so the tolerance of such a diff would be widened
until it was blind.

What the two frames show. Before the push, eight dice lie on the table: four grey attribute dice
reading 6, 8, 0 and 12, and four green skill dice reading 5, 4, 5 and 3. The `0` is the library's
label for a ten on a ten-sided die, which Unit 3.3 already recorded. After the push, all four grey
dice sit in the same places at the same angles, down to the shadow under each one. The four green
dice are somewhere else on the table, in new orientations, and two of them show new numbers. A
player reads that as: the successes stayed, the rest went back in the cup. The claim is visible, not
only measurable.

The green dice land more to the left in the after frame than in the before frame, because the
library throws every re-thrown die from one edge position. That is a look, not a fault. Unit 3.5
owns the affordance that tells a player which dice are about to go.

### Reported, not fixed

- **A profile that adds a stress die before the re-roll is refused by name.** `pushPool` throws
  `the tray holds no die for stress-1` rather than acting out the wrong dice, because the tray never
  spawned that die. `pool-stress-and-complications` is the one preset that needs it. The fix is
  `box.add`, and the trap is recorded at the call site: `add` appends to `diceList` while
  `trayOrder` sorts by face count, so the index map must be rebuilt there. Unit 4.2 turns that
  profile on.
- **`src/tray/throw.ts` does not reach `dist/` yet.** Nothing imports it, because the application
  layer is Phase 2. The bundle figures below are therefore unchanged, and they will move when the
  application wires the tray. The module imports the vendored bundle for its type only, so it will
  land in the initial chunk, not the 3D chunk.
- **The push scene is not the budget scene.** It holds eight dice and measures 561 draw calls, 562
  triangles and 77 textures. It is reported, not judged.

### Measurements

| Number | Value |
|---|---|
| Lazy 3D chunk | 152,290 gzip bytes, unchanged. The ceiling is in `budgets.json`. |
| Initial JavaScript | 6,858 gzip bytes, unchanged. |
| Twelve-die render counters | 841 draw calls, 842 triangles, 77 textures. Unchanged, and all three under the ceilings in `budgets.json`. The headroom Unit 3.5 needs is intact. |
| Branding gate | `files_scanned=71`, `hits=0`, exit 0. |
| Validate | `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, all exit 0. |

## Unit 3.8 — performance gates, the CI half

### The split, and what stays open

The unit has two halves. The four CI gates need nothing but node. The in-app debug overlay — p95
and p99 frame duration, total long-task time and throw-to-first-motion — needs the Phase 2
application shell, and Unit 2.0 waits at `BLOCKED:owner-gate`. There is no page to put an overlay
on. **The CI half landed. The overlay half is open and carries the four numbers the plan names.**

### The order deviation

Units 3.5, 3.6 and 3.7 come first in the plan and all three need the interface: an affordance on
the dice, a volume control, and a startup probe that falls back to flat dice. Each waits on the
same owner gate. This half of 3.8 waits on nothing, so it runs ahead.

### What landed

Three of the four gates already existed. `scripts/check-bundle-size.mjs` judges the initial chunk
and the 3D chunk. `scripts/browser.mjs --tray` judges the render counters of Unit 3.2. The fourth
is new: `scripts/perf.mjs`, the steps-to-rest gate, and it closes the last `null` in
`budgets.json`.

The gate runs in node with no renderer, because the physics is cannon-es on the CPU. It needs no
WebGL, no canvas and no display, so it cannot flake on a graphics card or on a shared runner. It
builds the tray world, steps it until every die body is asleep, and counts the steps.

It measures the library the application ships, not a copy of it. The tray walls come from
`makeWorldBox` and every die body comes from `spawnDice`, both called against a plain object
instead of a `DiceBox`, because a `DiceBox` builds a renderer in `initialize` and there is none
here. The collision shapes, the masses and the damping come from the library's own dice factory,
and the gravity, the timestep and the iteration limit come from its own default configuration.
The vendored bundle grew five names on its export list to make that reachable, and nothing else
moved. `src/tray/vendor/README.md` records the edit.

`npm run perf` runs it. `npm run perf -- --quick` takes one measurement instead of five, for a
fast inner loop. **`validate` is unchanged and still names four commands.** A validation attempt
is capped at five, and a perf run must never spend one. CI runs the gate as its own step, after
the bundle-size gate.

### The number, and how steady it is

Fifty measurements over ten separate node processes all read **203 steps**. The spread is 0. The
count is arithmetic over a fixed input, so it repeats exactly rather than closely.

`steps_to_rest_fixed_seed_scene` is recorded at **224**, which is 203 plus ten per cent, rounded
up. The headroom is not for noise, because there is none. It covers a deliberate physics change
that is not a regression. It is small on purpose: at 203 steps a throw already freezes the tab for
about 3.4 seconds of simulated time, and a gate that would pass a doubling would gate nothing.

### How the scene is pinned

A step count means nothing without the scene it was counted on. `scripts/perf-scene.json` holds
the whole scene: the container size, and one starting position, spin axis, angular velocity and
velocity for each of twelve dice. The pool is the pool the browser harness renders, so both gates
judge the same twelve dice. The gate itself calls no random source at all.

The seed is recorded in the scene file, and `node scripts/perf.mjs --emit-scene --seed <n>` builds
the file again. It seeds the library's own throw recipe by standing a small generator in for
`Math.random` for the length of one call, then putting it back.

`steps_to_rest_scene_sha256` in `budgets.json` fingerprints the resolved scene: the pinned vectors,
the wall positions, the gravity, the solver iterations, the contact materials, and the collision
shape, mass, damping and sleep limits of every die. A scene that no longer matches fails by name.
It does not compare the count against a bound recorded for something else.

### The three red proofs

**One — the budget.** The plan warns not to prove this by throwing 200 dice, because 200 convex
dice never settle and the run hits the iteration limit, which is a red for the wrong reason. So the
proof is a test-only `--slow` flag that shrinks the timestep and makes the same throw take
proportionally more steps:

    perf: TEST-ONLY --slow=2. The timestep is 0.008333333333333333 against a normal
    0.016666666666666666. This run is not a measurement.
    perf: steps runs=1 counts=501 spread=0
    perf: OK steps_to_rest_scene_sha256 0e60e573bdab61c3f6b7bd28536eb208ac3f06641338b662527053e6bb3bda81
    perf: FAIL steps_to_rest_fixed_seed_scene measured=501 budget=224

Exit 1. The failure names the budget and both numbers. The scene digest stayed green through it,
so the red is the budget and nothing else. The scene did come to rest, so it is not the
iteration-limit failure either, which prints `measured=none` and says so.

**Two — a null budget.** Run against a copy of `budgets.json` with the key set to `null`:

    perf: budget steps_to_rest_fixed_seed_scene is null in budgets.json. It is not measured yet.
    Record it in the unit that owns it. Do not invent a number and do not skip the check.

Exit 2. The gate reuses `readBudget` from the bundle-size gate, so both read a null budget the same
way. A missing scene digest fails the same way, with its own message.

**Three — the scene pin.** One die moved by one world unit on the z axis:

    perf: steps runs=1 counts=174 spread=0
    perf: FAIL steps_to_rest_scene_sha256 measured=cf1b02684bb9435482977e35c3748bdecfb4b73c7a88bf4f6f94b867db2af6e4
    recorded=0e60e573bdab61c3f6b7bd28536eb208ac3f06641338b662527053e6bb3bda81. The scene changed, so
    the recorded steps_to_rest_fixed_seed_scene was measured against a different scene and means
    nothing.

Exit 1. That one unit moved the count from 203 to 174, which is what the pin is for: without it the
gate would have read 174 against a bound of 224 and passed.

Every red proof ran against a copy of the data, through `--budgets` and `--scene`. No tracked file
was edited to force a failure, and no git command touched one.

### Reported, not fixed

- **The vendored narrowphase prints a `clamped:` line** whenever it clips a deep overlap, and the
  first steps of a throw always produce some. Fourteen lines a run would bury the report, so the
  gate holds them back and prints the count. A line the library has never printed here is passed
  through rather than swallowed. The warning is the library's own and is not a fault of the scene.
- **The count is exact on this host and is not proven across platforms.** Every operation the
  simulation runs is arithmetic, but the scene is built once through `Math.sin` and `Math.cos`,
  which no standard pins to the last bit. CI runs the same node major version, and the ten per cent
  headroom absorbs a small difference. A cross-platform difference larger than that would show as a
  budget failure, which is loud and is the correct place to find out.
- **The overlay half needs the throw-to-first-motion number the plan calls first-class.** The
  synchronous pre-simulation this gate counts is exactly that stall, so the CI half already watches
  the quantity the overlay will report. It reports it in steps, not in milliseconds.

### Measurements

| Number | Value |
|---|---|
| Steps to rest | 203, over 50 measurements in 10 processes, spread 0. The ceiling is in `budgets.json`. |
| Gate runtime | Under one second for five measurements. `--quick` takes one. |
| Lazy 3D chunk | 152,331 gzip bytes, up from 152,290. The five new export names reach the chunk, because `loadTray` imports the whole module namespace. Measured against a build with the pristine bundle. |
| Initial JavaScript | 6,856 gzip bytes, down from 6,858. The initial chunk holds no library code. The two bytes are the name of the lazy chunk, whose content hash moved. |
| Twelve-die render counters | Unchanged. Nothing in this unit touches the scene the browser harness renders. |
| Branding gate | `files_scanned=73`, `hits=0`, exit 0. |
| Validate | `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, all exit 0. |

## Units 4.4, 4.5 and 4.6 — the design-independent half

### Why these three, and why only half of each

Phase 2 waits at `BLOCKED:owner-gate` on Unit 2.0, so no application state exists. Units 4.4 to 4.6
mix three concerns, and only one of them needs that state:

- **IndexedDB** — the ring buffer, two connections, `visibilitychange`, quota and `blocked`
  handling. It needs a browser and an application.
- **The long-task measurements** — a full-buffer insert and a full-buffer export with no task over
  50 ms, read through `PerformanceObserver`. They need the same browser and the same application.
- **The entry model, the profile hash and the CSV codec.** Pure functions over the rules core. They
  need none of it, and everything else is built on them.

This unit builds the third group and leaves the first two. **None of the three units is complete.**
The status table names what is open in each.

The order deviation is the same one Units 3.0 to 3.8 recorded: work that does not need the screen
design runs ahead of work that does.

### What landed

`src/log/entry.ts` holds the entry model and the hash.

A `LogEntry` carries the roll, its derived values and `profileHash`. A `LoggedDie` is one column of
the history matrix, and each of its cells holds the value, the successes that value was worth and
whether the die was locked, at that generation. A generation the die did not exist at holds `null`
instead of a cell, which is the spec's rectangular matrix.

`profileHash` is SHA-256 over the profile, serialised with the keys sorted at every level.
`JSON.stringify` takes a replacer and then walks into what the replacer returns, so one four-line
function sorts the whole tree. The hash comes from `node:crypto`, so it adds no dependency.

`src/log/csv.ts` holds the codec. `csvParts` returns the header and one piece per row.
`exportCsv` hands that list to `new Blob(parts)`. `importCsv` reads a whole log back.

`src/log/node-crypto.d.ts` declares the two calls `profileHash` makes. `@types/node` is a whole
runtime surface and the constraint list forbids a new dependency, so the declaration is local.
`scripts/check-branding.mjs` already calls `createHash().update().digest('hex')`, so the shape is
proven inside this repository.

### The log stores, and never re-derives

The spec gives the reason: "a later profile edit silently rewrites campaign history, and an
export/re-import equality check still passes because both sides re-derive the same wrong way".

So `createLogEntry` computes every derived number once and writes it into the entry, and the
importer reads those numbers and never touches a profile. A test holds the defect still: it logs a
roll under a preset, edits the preset through `mergeProfile`, and asserts the export still names the
digest of the profile the roll was made under and never names the digest of the edited one.

### The die identifier does not survive the export, so the log does not hold one

The schema names a die by `die_index`, which is its place in the roll. It has no column for a die
identifier. A field the log cannot read back is a field the log must not hold, or "the round trip is
identical" would be false for a field nobody looks at. `LoggedDie` therefore carries the type, the
face count and the cells, and the rules core keeps its `stress-5` identifiers to itself.

### Two decisions the plan settled, obeyed and stated

- An import **replaces** the log. `importCsv` returns the whole new log, and it merges nothing.
- A duplicate `roll_id` is **rejected**. It is not merged, not renamed and not overwritten.

Both are written at the top of `src/log/csv.ts` and both are asserted.

### Formula injection

A field that opens with `=`, `+`, `-` or `@` reads as a formula in a spreadsheet, so the writer puts
an apostrophe in front of it. The apostrophe is on the sigil list as well. Without that, a note the
user typed as `'=1+1` would come back as `=1+1`, and the round trip would be a lie. The reader drops
one leading apostrophe, whatever follows it, so the rule reverses exactly.

### Counted denominators

| Claim | Measured | Counted a second way |
|---|---|---|
| One row per non-null cell | 111 pieces, so 110 rows | 110 non-null cells, counted die by die while the writer walks generation by generation |
| Null cells are present in the round trip | 2 | 1 preset with `addBeforeReroll` x 2 modes |
| The hash reads every field | 16 leaf fields changed, 16 digests, all different | 16 leaves under 9 top-level keys, enumerated from the profile itself |
| The round trip is identical | 224 fields compared | 16 entries x 14 fields of a `LogEntry` |
| The log covers the domain | 16 entries | 4 presets x 2 modes x 2 push choices |
| Every push case pushed | 8 | 4 presets x 2 modes |

The hash denominator comes from the profile's own key list, not from a written list, so a field added
to `PushProfile` later raises the count and the pinned 16 goes red. It cannot stay silently unhashed.

### The builder never holds one joined string

A full buffer is roughly 180,000 rows and about 21 MB. `csvParts` pushes one piece per row and
returns the list. `exportCsv` gives that list to `Blob`, which joins it outside the JavaScript heap.

Over the 16-entry log the list holds 111 pieces and the longest piece is 216 characters against a
whole document of 21,590. The test asserts the piece count against the row count and asserts that no
piece holds a tenth of the document. A writer that concatenated would return one piece and fail the
first assertion.

### The four rejections, each with its own message

    csv import: column 9 is named "die_sides". The export schema holds no such column.
    csv import: the header is out of order. Column 1 must be "roll_id" and it is "timestamp_iso".
    csv import: roll "roll-0" appears twice. Every roll must hold one block of rows.
    csv import: the file holds 33554433 characters, over the limit of 33554432.

Three more guards carry their own messages: two rows for one cell, a field that is not a count or
not a member of its union, and a row that gives its roll a second set of roll-level values. Each one
would otherwise lose data quietly.

### Red proofs

Both ran against a saved copy of the file, restored with `cp` and checked by `sha256sum`. No git
command touched either file.

**One — a field dropped from the writer.** `entry.profileHash` in `rowFields` replaced by `''`. The
round trip went red and named the field:

    AssertionError: field profileHash of roll roll-0: expected '' to deeply equal
    '0b489af645bfff8b454c5aad77831da2e93ba...'

The injected row is visible in the failure output, with an empty fourth column.

**Two — the entry re-derives the hash instead of storing it.** `createLogEntry` changed to hash
`mergeProfile(profile, { maxPushes: 3, lockSuccesses: false })`, which is the digest a reader that
re-derived from the edited profile would produce. Three tests went red:

    AssertionError: the export names the profile the roll was made under: expected
    'roll_id,timestamp_iso,ruleset,profile...' to contain '0b489af645bfff8b454c5aad77831da2e93ba...'
    + r-1,...,pool-banes-damage-ratings,20eeae536ee3c01a9b61a36a3b3a8a78a9bbc3cc290e9b7627ce12717eabb581,...

The row carries `20eeae53...`, the digest of the edited profile, where `0b489af6...` belongs. That is
the defect the spec's rule exists to prevent, and the check sees it.

### Reported, not fixed

- **`node:crypto` is not available in a browser.** The plan named it and it adds no dependency, so
  the pure half uses it. The browser half needs `crypto.subtle.digest`, which is asynchronous, so
  `createLogEntry` will need an asynchronous sibling or a hash passed in. Unit 4.4 owns that call
  site and must settle it. Nothing in the shipped bundle imports this module today, and the
  bundle-size gate confirms it: 6,856 and 152,331 gzip bytes, both unchanged.
- **`MAX_IMPORT_CHARS` caps characters, not bytes.** The cap bounds the work the parser does, which
  is the risk. The browser half should refuse a `File` over the same number of bytes before it reads
  it, because one character may be several bytes.
- **The importer trusts the derived values in the file.** It reads `die_successes` and
  `roll_successes` rather than recomputing them, because recomputing is exactly what the spec
  forbids. A hand-edited file can therefore carry a wrong success count. That is the price of the
  rule and it is the right price.

### Measurements

| Number | Value |
|---|---|
| Round trip | 16 entries, 224 fields compared, 0 different |
| Export | 110 rows, 111 pieces, longest piece 216 characters, whole document 21,590 characters, Blob 21,590 bytes |
| Hash sensitivity | 16 of 16 leaf fields, 16 distinct digests, 9 top-level keys |
| New tests | 22, in `src/log/entry.test.ts` and `src/log/csv.test.ts` |
| Initial JavaScript | 6,856 gzip bytes, unchanged. Nothing imports the log yet. |
| Lazy 3D chunk | 152,331 gzip bytes, unchanged |
| Branding gate | `files_scanned=78`, `hits=0`, exit 0 |
| Validate | `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, all exit 0 |

## Unit 4.1 — the pure half, and the repository-local reviewer

Two deliverables landed together. Both are independent of the owner gate on Unit 2.0.

### The repository-local reviewer

`.claude/agents/reviewer.md` holds the two duties the plan's roster mapping names.

1. **No forbidden token in the diff.** The reviewer runs `scripts/check-branding.mjs` and never
   reads the diff for the terms, because the list is hashed and cannot be read by eye. A green gate
   is necessary and not sufficient: Unit 3.0 measured the gate's own list as short, and a real
   bundle carried a trademark 58 times and passed clean. The reviewer therefore asks of every diff
   that brings in outside bytes whether the file could carry a term the list does not hold yet.
2. **No code copied from a GPL-3.0 source.** The data model is a design idea and gets reimplemented
   from `specs/0001-rules-model.md`. The reviewer looks for the signs of copying: identical function
   names, a table in another project's order, comments in another project's voice, or a structure
   that matches a published file rather than the spec.

A third section carries the repository's own review context: a new check must be red-proofed with a
failure that names the defect, a counted denominator must be computed a second way, and a budget
must be read from `budgets.json` rather than retyped.

The file replaces the user-scope reviewer rather than adding to it, because a project copy takes
precedence. It therefore names the shared duties and points at `~/.claude/agents/reviewer.md`.

### The migration

`src/settings/settings.ts` holds `Settings`, `DEFAULT_SETTINGS` and `migrate`. `Settings` carries
the mode, the push-profile id, the artifact curve and a version. `migrate` takes `unknown`, because
storage holds user-editable text on every platform, and returns a record the application can use.

Two rules decide every answer. A stored version below the current one runs its step in
`MIGRATIONS`. Anything else — a future version, a missing version, a value that is not a record —
reads as the defaults. Nothing throws, and there is no `try`/`catch` around the chain, so a step
that throws reaches the test rather than hiding as a fallback.

**A decision the plan did not settle: `SETTINGS_VERSION` is 2, not 1.** Version 1 is the same
record without `artifactCurve`. No version 1 record ever reached a user, because this unit is the
first to store anything. The version exists so the chain has a step to run and a step to prove. The
alternative was a single version, which makes "a known older version" the same case as "an unknown
future version" and leaves no migration path to red-proof.

### What the test proves

Ten stored values run against `ENUMERATED_CASES`, a ten-item list written in the test file. The
count of cases exercised is asserted against the table length, the table length against the
enumeration, and the enumeration against the literal ten, so a case dropped from the table fails
here. The allowed modes and the allowed artifact curves are written out again in the test, so the
module cannot answer its own question. The shipping preset ids come from `PUSH_PROFILES`, which is
the definition of a preset that still ships.

| Case | Answer |
|---|---|
| An unknown future version | Defaults |
| A known older version | Migrated, and the fields it held are kept |
| A missing version field | Defaults |
| `null` | Defaults |
| `undefined` | Defaults |
| A string | Defaults |
| An array | Defaults |
| An object of the wrong shape | Defaults |
| A valid version with one field of the wrong type | That field defaults, the rest is kept |
| A preset id that no longer ships | That field defaults, the rest is kept |

Two more tests stop the check from passing for the wrong reason. A record this build wrote, with
every one of the three fields different from its default, comes back unchanged — a `migrate` that
always answered with the defaults fails all three. A version 1 record keeps its mode and its preset
id and gains the default artifact curve, so the step is proven to do work rather than fall back.

### The red-proof

The step from version 1 was made to throw. Two of the three tests went red, and the first failure
named the path:

```
Error: the migration path for "a known older version" threw: Error: the step from version 1
cannot read {"version":1,"mode":"step","presetId":"pool-referee-gains-a-point"}
```

The module was restored from a copy saved outside the repository. No git command touched the
bytes, because the commands that restore a file target the last commit and delete uncommitted
work. The SHA-256 of the restored file matches the saved copy at
`2169a0881d60c58b66f944714f26244ac2a50f4ca32e5e23b6556c998161d04e`.

### Open

- **The `localStorage` binding.** The read, the write, and the failure path for a browser that
  refuses storage. All of it needs the application state the Phase 2 shell holds, and Phase 2 waits
  at `BLOCKED:owner-gate` on Unit 2.0. **Unit 4.1 is not complete.**
- **Nothing imports the settings module yet.** The bundle-size gate confirms it: the initial
  JavaScript is unchanged.

### Measurements

| Number | Value |
|---|---|
| Migration cases | 10 exercised, against an enumeration of 10 |
| New tests | 3, in `src/settings/settings.test.ts` |
| Test total | 121 to 124 |
| Initial JavaScript | 6,856 gzip bytes, unchanged. Nothing imports the settings yet. |
| Lazy 3D chunk | 152,331 gzip bytes, unchanged |
| Branding gate | `files_scanned=78`, `hits=0`, exit 0 |
| Validate | `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, all exit 0 |

---

## Unit 3.7 — the engine half

The unit splits in two. One half needs the Phase 2 application shell and one half does not. Phase 2
waits at `BLOCKED:owner-gate` on Unit 2.0, so the half that needs nothing was built first. That is
the order deviation, and it is the same reason every Phase 3 and Phase 4 row records.

### What landed

- **The probe.** `probeCapability` in `src/tray/capability.ts` reads four things: a WebGL2 context,
  `navigator.deviceMemory`, `navigator.hardwareConcurrency` and whether `canvas.toBlob` hands back a
  blob. It never throws. Each reading is wrapped, a hidden reading answers `null`, and the WebGL2
  context is released through `WEBGL_lose_context` as soon as it is read, because an open context
  costs memory on the device the probe exists for. A `toBlob` that never calls back is answered
  after `TO_BLOB_TIMEOUT_MS`.
- **The decision.** `decideTray` reads the probe record and nothing else. It names no browser API
  and holds no state. It answers `{ tray, reasons }`, and it names every reading below the bar
  rather than the first one.
- **The permanent fall.** `Settings` gains `flatFallback`. `SETTINGS_VERSION` moves from 2 to 3 and
  `MIGRATIONS` gains the step from 2 to 3. The store is `readSettings`, `writeSettings` and
  `recordFlatFallback`, all in `src/settings/settings.ts`, all taking the store as an argument. The
  file names `localStorage` nowhere, so it still runs under a plain test runner.
- **Context loss.** `watchContextLoss` in `src/tray/scene.ts` listens for `webglcontextlost` and
  `webglcontextrestored` and hands both to `onFallToFlat`. `mountTray` wires it before the first
  frame. The scene module writes no settings: the caller supplies the callback, so the storage
  binding stays with the application.
- **Reduced motion.** `prefersReducedMotion` reads the media query. `throwPool` and `pushPool` take
  a `skipTumble` option and pass nothing to the physics.

### Two decisions the plan did not settle

**`canvas.toBlob` counts against the bar.** The plan lists it in the probe and says a reading below
the bar falls to flat, but it does not say which readings make up the bar. A canvas that cannot hand
back a blob is a canvas the platform has crippled, and the tray is drawn on a canvas. The share card
of Unit 4.9 is the visible cost, not the reason. Reverse this by deleting four lines in `decideTray`
and one class list in the test.

**A hidden reading never fails the bar.** Safari reports no `deviceMemory` at all. A missing reading
read as a failure would take the tray away from every iPhone, which is the platform the plan worries
about most. `null` therefore passes, and the two bars are `MIN_DEVICE_MEMORY_GB` of 1 and `MIN_CORES`
of 2.

### The counted denominators

| Check | Denominator |
|---|---|
| Decision table | 64 cases, a cross product of 2 WebGL2 classes, 4 memory classes, 4 core classes and 2 `toBlob` classes. The count is asserted against the product, against the literal 64, and against a count of unique names. |
| Decision outcomes | 9 of the 64 clear the bar and 55 fall, both counted by hand and asserted. |
| Reasons reachable | The set of reasons the 64 cases produce equals `FALL_REASONS`. A reason no case reaches fails. |
| Migration table | 13 cases against a 13-item enumeration, up from 10. |
| Reduced motion, faces | 48 of 48 up-faces, a pool of 24 over 2 modes, each read off a body quaternion. |
| Reduced motion, agreement | 24 of the pool size 24, die for die, from one seed. |

The memory list and the core list each hold a class below the bar, a class exactly at the bar and a
class above it. A bound checked at the ends alone says nothing about its middle, and the bar is the
middle here. The test writes 1 gigabyte and 2 cores out again rather than importing the constants,
because a bound that reads the constant it bounds cannot fail.

### What the probe read

| Run | Readings | Decision | Exit |
|---|---|---|---|
| Graphics card, sandbox off | `webgl2=true device_memory_gb=null cores=16 to_blob=true` | `tray=true, reasons=[]` | 0 |
| Sandbox on, no WebGL context | `webgl2=false device_memory_gb=null cores=16 to_blob=true` | `tray=false, reasons=[no-webgl2]` | 0 |

The sandboxed run is the failure path, and it is free: the sandbox hides `/dev/dri`, so there is no
WebGL context to be had. The probe answered rather than threw. Firefox reports no `deviceMemory` on
this host, which exercises the hidden-reading rule on real hardware.

The probe check does not read its own answer back. A second route in the page asks for a WebGL2
context with plain page code and no import, and the two answers are compared.

### Context loss, measured

`WEBGL_lose_context` forced the loss on the graphics card. Both handlers fired, and the flag moved:

```
browser: context-loss events=[webglcontextlost, webglcontextrestored] flag before=false
  after_loss=true after_restore=true
  stored={"version":3,"mode":"pool","presetId":"pool-banes-damage-ratings",
  "artifactCurve":"artifactEscalating","flatFallback":true}
```

The flag is read back out of `localStorage` through `readSettings`, before the loss and after it, so
the check asserts a transition rather than a value that was already true.

### Three red-proofs

**One, the lost handler disconnected.** `canvas.addEventListener('webglcontextlost', lost)` was
removed from `src/tray/scene.ts`. Two checks went red and both named the missing transition:

```
browser: FAIL context-loss.the-lost-handler-fires ... events=[webglcontextrestored]. The
  transition this check needs is a webglcontextlost event, and it never arrived.
browser: FAIL context-loss.the-permanent-flag-goes-from-false-to-true the stored flatFallback
  flag read false before the loss and false after it ... The transition this check needs is
  false to true.
```

**Two, the tumble skip made a no-op.** `skipTheTumble` was made to subtract zero. The two face
checks stayed green, which is the point of the third check, and only the third went red:

```
browser: FAIL reduced-motion.the-skip-lands the tumbling throw drew 213 frames against a floor
  of 50, and the skipped throw drew 243 against a ceiling of 5, counted by the renderer itself.
```

**Three, the core bar lowered.** `MIN_CORES` was moved from 2 to 1. Two tests went red and the first
named the class and the reason:

```
AssertionError: webgl2 answers, memory hidden, one core, the canvas reads back: the reasons the
decision names: expected [] to strictly equal [ 'low-core-count' ]
```

Every file was restored from a copy saved outside the repository. No git command touched the bytes,
because the commands that restore a file target the last commit and delete uncommitted work. The
restored hashes match the saved copies:
`src/tray/scene.ts` at `e3a3ba5a06e8e313f8784969a3ca0464b90c7da1378f4bdc2ebc8100087ee647`,
`src/tray/throw.ts` at `f1b608347346a8a09130ecc865b451d9a9b4b95df5d069588dd3da4f616bf6a6`.

### How the tumble is skipped, and why no face can change

The library decides every face before it draws anything. It simulates the whole throw to rest, puts
the bodies back at the spawn state, swaps the face labels so the settled orientation reads the value
the rules core chose, and then replays the same fixed-step sequence for the player to watch. The
replay steps the world by a fixed `framerate` and takes as many steps per frame as real time has
passed. Winding its clock back therefore takes the same steps in the same order, all inside one
frame, and lands on the same orientation. Nothing about the sequence changes, so nothing about the
faces can change.

The instrument is the renderer's own frame counter, `info.render.frame`, and not a clock. `reset`
never touches that field. The tumbling throw drew 223 frames and the skipped throw drew 4, against a
floor of 50 and a ceiling of 5. A whole number cannot flake. The wall times, reported and not judged,
were 4,452 ms and 1,007 ms.

`SKIP_TUMBLE_SECONDS` is 20, which is 1,200 steps at the library's step of 1/60. The measured
steps-to-rest of the settled twelve-die scene is 203, so the margin is nearly six times over. A scene
that needed more would tumble for the rest of the way rather than fail.

### One driver fix

`network.proxy.type` is now 0 in `scripts/browser-driver.mjs`. Firefox reads the system proxy by
default. Inside the sandbox that proxy asks for a user name and a password, so a sandboxed run
stopped at a modal prompt instead of loading the page. The harness only ever reaches a local dev
server, so it needs no proxy at all. The sandbox also gives each Bash call its own network
namespace, so the dev server has to start in the same call as the harness. Both facts are recorded
in `.claude/skills/run-clatter/SKILL.md`.

### Reported, not blocking

**`--pool` is not deterministic.** One run of `--pool` went red on `stress-d10` and on one colour
cluster, and twelve later runs passed. The vendored library picks its throw vector with
`Math.random`, so every run throws from a different place, and a rare resting pose reads an
ambiguous up-face. Six runs of the pre-change checkout in a separate worktree and six runs of this
one both read `up_face_failures=0`, so this is not a regression from Unit 3.7. It is a property of
Unit 3.3's check and it is left as it is.

### Open

- **The flat-dice renderer.** Unit 2.2 builds it. Nothing here draws a flat die.
- **The message shown once**, the settings toggle back, and the call site that runs the probe at
  startup. All three need the Phase 2 application shell.
- **The plan's acceptance**, a driven-browser run with the 3D chunk blocked at the network layer
  that exercises every rule and every affordance. It needs the whole application.
- **Unit 3.7 is not complete.**

### Measurements

| Number | Value |
|---|---|
| Decision cases | 64 exercised, against a product of 2 x 4 x 4 x 2 |
| Migration cases | 13 exercised, against an enumeration of 13 |
| New tests | 7, in `src/tray/capability.test.ts` and `src/settings/settings.test.ts` |
| Test total | 124 to 131 |
| Initial JavaScript | 6,856 to 6,958 gzip bytes. `watchContextLoss` is in the initial chunk, because `src/app.tsx` imports `mountTray`. Budget 61,440. |
| Lazy 3D chunk | 152,331 gzip bytes, unchanged. Budget 204,800. |
| Twelve-die render counters | 841 draw calls, 842 triangles, 77 textures, unchanged, against 968, 969 and 89 |
| Branding gate | `files_scanned=83`, `hits=0`, exit 0 |
| Validate | `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, all exit 0 |

## Fix — the tray world clock ran on into the replay

### What was reported

Unit 3.7 recorded that `--pool` is not deterministic. One run went red on `stress-d10` and on one
colour cluster, and twelve later runs passed. The note named `Math.random` as the reason. That is
the mechanism which selects a throw. It is not the reason a throw reads the wrong face.

### What the measurement found

A seeded throw makes a run repeatable. Sixty seeded throws gave three runs where at least one die
read a face the rules core never chose. The read is sound in all three: the failing die of seed 44
rests flat, at 0.000135 radians from up, and the next nearest face is 1.107 radians away. A tie
between two faces cannot explain it.

The library decides every face before it draws anything. It simulates the whole throw to rest,
reads the settled pose, puts the bodies back at the spawn state, swaps the face labels so the
settled pose reads the chosen value, and replays the same fixed-step sequence for the player. The
failing dice end the replay in a different pose from the one the labels were swapped against. For
seed 44 that die ends 1.219 radians away from the simulated pose.

A step-by-step trace of both passes gives the first point of difference. For seed 44 it is step
129, on die index 3, at an identical position and an identical quaternion:

    simulate  velocity (0.002072033, 0.008419770, 0.000020831)  sleep state 1
    replay    velocity (0.000000000, 0.000000000, 0.000000000)  sleep state 2

The replay put that die to sleep one step earlier. A body sleeps when `world.time` minus
`timeLastSleepy` passes `sleepTimeLimit`. `sleepTimeLimit` is 0.9 seconds and the timestep is 1/60
second, so the test crosses at exactly 54 steps. It lands on a step boundary, where a difference of
one part in ten thousand million decides the answer. `world.time` is never reset, so the replay
reads it about ten seconds later than the simulation did, with different accumulated rounding. From
that step the two passes take different paths, and the difference grows until a die comes to rest
on another face.

### The fix

`simulateThrow` in the vendored bundle saves `world.time` and puts it back. The replay then reads
the same clock values the simulation read, and the two passes are identical step for step. The
patch is two lines. `src/tray/vendor/README.md` records it beside the earlier ones.

No tolerance was widened, no retry was added and the rules core was not touched.

### The rate, before and after

Every number below was measured on `AMD Radeon RX 6700 XT (radeonsi, navi22, ACO, DRM 3.64,
7.1.5-201.fc44.x86_64)` with the sandbox off.

| Measurement | Before | After |
|---|---|---|
| `--pool` runs where the up-face check failed | 1 of 20 | 0 of 20 |
| Direct seed sweep, runs with a wrong face | 3 of 60 | 0 of 60 |
| Largest pose drift from the simulated pose | 1.219266 radians | 0.000000 radians |
| Seeds 30, 44 and 51, which failed by name | red | green |

The three seeds that failed are the proof the check can still go red. Seed 1 of the harness failed
before the fix with four wrong dice of 24, and named each one:

    browser: FAIL pool.up-face-equals-core-value compared=24 of a pool of 24, read from each
    body quaternion. wrong=4 [attribute-d6 expected 6, the quaternion reads 1; attribute-d10
    expected 5, the quaternion reads 2; skill-d10 expected 7, the quaternion reads 6;
    attribute-d12 expected 8, the quaternion reads 1]

The denominator held at 24 while the check failed. The same seed passes after the fix.

### The seed

`scripts/browser.mjs` takes `--throw-seed <n>`. It replaces `Math.random` in the page with the
generator `scripts/perf.mjs` already uses to emit its pinned scene. There is one generator and it
has one home.

A run that names no seed draws a fresh one, because a fixed default would throw the same pool for
ever and stop sampling. Sampling is what found this defect. Every run prints its seed, so a red run
repeats exactly.

Determinism, measured in both directions. Two separate processes at seed 5 wrote byte-identical
captures, `sha256 1cf1204f2349ef8a48d68a8a970ff66f7be078f537f3b0b0bec831a09a1c4991`. Seed 6 wrote
`sha256 87f805b5285daf4eba7931c19a021da47480290e662a20dfefd8f47c3f0cf048`.

### Reported, not fixed

**`pool.colour-separates-the-types` fails on 6 runs of 20.** The rate is the same before this
change and after it, and the cause is unrelated to the clock. The dice pile up against one corner
of the tray, so the patch the check samples at a die's projected centre often reads a neighbour
that stands in front of it. The capture `docs/design/0007-colour-flake-seed-13.png` shows the heap.
A fix is a design decision about the check or about the throw, so it is left for the owner to
direct. It is why `--pool` still exits 1 on about three runs in ten.

### Measurements

| Number | Value |
|---|---|
| Files changed | 5 |
| New tests | 0. The check is the browser harness, which needs a graphics card and stays out of `validate`. |
| Test total | 131, unchanged |
| Initial JavaScript | 6,956 gzip bytes. Budget 61,440. |
| Lazy 3D chunk | 152,331 to 152,342 gzip bytes. Budget 204,800. |
| Steps to rest | 203 over 5 runs, spread 0, scene digest unchanged |
| Harness exit codes at seed 5 | `--tray` 0, `--pool` 0, `--push` 0, `--probe` 0, `--context-loss` 0, `--reduced-motion` 0 |
| Branding gate | `files_scanned=84`, `hits=0`, exit 0 |
| Validate | `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, all exit 0 |

---

## Fix — the colour check read the die standing in front

### What was reported

The world-clock fix recorded that `pool.colour-separates-the-types` fails on 6 runs of 20, at the
same rate before that fix and after it. The dice heap into one corner of the tray. The check
sampled a square patch at each die's projected centre, so that patch often held the neighbour which
stands in front of the die under test. The capture `docs/design/0007-colour-flake-seed-13.png`
shows the heap.

### The cause, measured

Seed 13 failed with `stress-d6 drew nearer the gear colour than its own`. The new instrument reads
that same throw and reports `stress-d6 13 of 38 points behind gear-d12`. The die the old patch read
is named, and it is the die the old failure blamed.

### The fix

For each die the check now aims a ray from the camera at the centre of one device pixel, and asks
which body the ray meets first. It reads the pixel only when that body is the die under test. The
points are walked outwards from the projected centre, so an unoccluded die is read at its centre as
before, and an occluded die is read at the nearest part of its own front surface.

Three further properties were necessary to make the read honest. Each one was measured on a seed.

- **The ray and the pixel must be the same sample.** The old code rounded a screen coordinate to a
  pixel index. That names the pixel corner nearest to the point, not the pixel which holds it. On a
  die reduced to a one-pixel strip, that half-pixel error reads the neighbour. Seed 39 measured it:
  `skill-d6` read `70,113,139`, a steel blue, where every other skill die read `85,121,77`, a green.
  The ray now goes through the centre of the pixel it reads.
- **A pixel the die shares with anything behind it already holds a mixture**, because the renderer
  antialiases the silhouette. A pixel counts only when the four pixels beside it are the same die.
  A die with no such pixel is still counted, from the mixed pixels it has, and the run says so.
- **A lattice can miss a narrow strip.** When the first sweep finds no whole pixel, a second sweep
  runs over the whole silhouette at a step of a twentieth of the die radius. Seed 10 measured it:
  the first sweep called `skill-d10` invisible, and the second found four pixels of it behind
  `skill-d12`.

Every die stays in the denominator. The check still reports `classified=<n> of <pool size>` and it
fails when the two disagree. A die with no visible pixel at all fails by name.

No tolerance was widened. The colour distance, the palette and the rules core are untouched. The
vendored bundle is untouched, so `src/tray/vendor/README.md` has nothing to record.

### Two options rejected, and why

Both were rejected for a stated reason. A later session must not reopen this choice blind.

- **Drop an occluded die from the comparison.** Rejected. It weakens the denominator. A check which
  quietly drops the awkward cases is the failure mode this plan is written against.
- **Spread the throw.** Rejected. It moves `steps_to_rest_fixed_seed_scene` and the pinned scene
  digest in `budgets.json`. Constraint 5 forbids a change to one gate which makes another gate pass.

### The rate, before and after

Every number below was measured on `AMD Radeon RX 6700 XT (radeonsi, navi22, ACO, DRM 3.64,
7.1.5-201.fc44.x86_64)` with the sandbox off. One run per seed, `--pool --hardware`.

| Seeds | Before | After |
|---|---|---|
| 1 to 20 | 6 of 20 failed: 10, 11, 13, 14, 16, 18 | 0 of 20 |
| 21 to 40 | 7 of 20 failed: 21, 22, 23, 31, 32, 33, 39 | 1 of 20: 22 |
| 1 to 40 | 13 of 40 | 1 of 40 |

Seeds 1 to 20 are the set the instrument was built against. Seeds 21 to 40 were never read while it
was built, and they carry the same before rate. The before column comes from the committed file at
`ae09d5a`, run under a second name and deleted afterwards.

### What still fails, reported and not tuned away

Seed 22 goes red after the fix, and both of its findings are real.

- `stress-d6` is wholly hidden. 145 pixels out to 0.85 of its radius, and 1257 more over the whole
  silhouette, all meet another body first. The capture confirms a d6 buried under the heap at the
  top left. The plan calls a die with no visible surface a finding worth failing on, so the check
  names that die and goes red.
- `gear-d6` lies 72 per cent behind `artifact-d12`, inside the shadow of that die. The pixels it
  does show are its own, and they read `49,84,114`, which is the gear blue at about half of its
  brightness. The rule which classifies a die compares linear light, so a shaded die of one type
  can sit nearer to the mean of a darker type. This is a property of the light, not of the palette.
  The two closest type means on that frame are 0.127 linear units apart, and the ladder holds.

The second finding needs a decision about what the check measures. It is handed back, not tuned.

### The red-proof

`skill` took the `gear` hex value in `src/tray/dice-colors.ts`. The run at seed 5 went red and
exited 1:

    browser: FAIL pool.colour-separates-the-types classified=24 of 24 dice against 6 type means
    read off the frame, each at points a raycast proves are that die's own frontmost surface.
    ... The closest two means are skill/gear at 0.001 linear units. failures=3 [gear-d6 drew
    nearer the skill colour than its own; gear-d8 drew nearer the skill colour than its own;
    gear-d12 drew nearer the skill colour than its own]

The failure names the two types and the separation it measured between them. The denominator held
at 24 of 24 while the check failed. The file came back from a copy saved outside the repository.
No version-control command restored it, so no byte of the work was at risk.

### Measurements

| Number | Value |
|---|---|
| Files changed | 2, `scripts/browser.mjs` and `LEDGER.md` |
| New tests | 0. The check is the browser harness, which needs a graphics card and stays out of `validate`. |
| Test total | 131, unchanged |
| Initial JavaScript | 6,956 gzip bytes. Budget 61,440. |
| Lazy 3D chunk | 152,342 gzip bytes. Budget 204,800. |
| Steps to rest | 203 over 5 runs, spread 0, scene digest unchanged |
| Harness exit codes at seed 5 | `--tray` 0, `--pool` 0, `--push` 0, `--probe` 0, `--context-loss` 0, `--reduced-motion` 0 |
| Branding gate | `files_scanned=84`, `hits=0`, exit 0 |
| Validate | `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, all exit 0 |

## Fix — one check answered two questions

### What was reported

The raycast fix left seed 22 red, with two findings under one name. Both findings are real and
they are not the same kind of thing. `pool.colour-separates-the-types` carried both, so the run
could not say which one it had found.

- `gear-d6` sat 72 per cent behind `artifact-d12`, inside the shadow of that die. Its pixels are
  its own and they read `49,84,114`, which is the gear blue at about half of its brightness. The
  rule compared linear RGB, so the shaded die landed nearer the mean of the darker violet type.
- `stress-d6` was wholly buried. 145 pixels out to 0.85 of its radius, and 1257 more over the whole
  silhouette, all met another body first. The check failed that as a colour finding.

### Finding 1 — the check measured colour times light

A player who looks at a die in shadow still sees blue. The instrument was wrong, not the palette.
A distance over linear RGB measures the light as well as the hue, because the renderer multiplies
the type colour by the light which reaches the surface.

The check now compares in chromaticity. Each linear channel is divided by the sum of the three, and
the first two numbers carry the answer, because the third is one minus the other two. A scale
factor cancels exactly, so brightness cannot move a die between clusters. The palette itself is
untouched.

The two type colours the failure named show the size of the effect. In linear RGB the shaded read
`49,84,114` lies 0.592 from the artifact colour and 0.679 from its own. In chromaticity it lies
0.271 from artifact and 0.0009 from gear.

`scripts/browser.test.mjs` pins both halves of that arithmetic, so the repair holds without a
graphics card.

### Two claims, two instruments. Do not collapse them again

The palette makes two separate claims and each one needs its own check.

- **The palette claim.** `src/tray/dice-colors.test.ts` measures the CIE L* ladder over the hex
  values, unrendered. It says a greyscale copy of the tray still separates the six types, which is
  the accessibility property of Constraint 6. It stays a pure lightness assertion and it must never
  read the frame.
- **The render claim.** `pool.colour-separates-the-types` asks whether each die on the screen reads
  as its own type under the light the tray casts. It must be robust to the lighting, so it compares
  chromaticity and never lightness.

Neither claim implies the other. A palette which passes the ladder can still fail on the screen,
and a palette which reads correctly on the screen can still fail a greyscale copy. Both files carry
this note.

### Finding 2 — a buried die belongs to the tray

Visibility is now its own check, `pool.every-die-shows-its-own-surface`, with its own counted
denominator. A die counts as visible when a raycast proves at least one pixel of its own surface is
the frontmost body.

**The floor is the whole pool.** It is the only floor with no free parameter to tune, and it is
what the product needs: Unit 3.5 asks the player to click a single die, and a die with no visible
surface cannot be clicked. A buried die is therefore a finding the tray owns, not a finding about
colour. It is recorded against Unit 3.5 in the plan as well.

The two checks report against each other, and neither can pass on an empty set.

- The visibility check reports `visible=<n> of a pool of <size>, against a floor of <size>`.
- The colour check reports `classified=<n> of the <visible> visible dice, out of a pool of <size>`.
  It fails when the compared count and the visible count part, and it fails when nothing is
  visible. `judgeDieVisibility` counts the visible dice and `judgeColourClusters` counts the
  compared dice, so an edit which quietly drops an awkward die from the comparison parts the two
  counts and goes red.

The throw was not changed. A wider throw would move `steps_to_rest_fixed_seed_scene` and the pinned
scene digest, and Constraint 5 forbids a change to one gate which makes another gate pass.

### The rate, before and after

Every number below was measured on `AMD Radeon RX 6700 XT (radeonsi, navi22, ACO, DRM 3.64,
7.1.5-201.fc44.x86_64)` with the sandbox off. One run per seed, `--pool --hardware`, seeds 1 to 40.
The before column comes from the committed file at `51339fe`, run under a second name and deleted
afterwards.

| Check | Before | After |
|---|---|---|
| `pool.colour-separates-the-types` | 1 of 40: seed 22 | 0 of 40 |
| `pool.every-die-shows-its-own-surface` | did not exist | 1 of 40: seed 22 |
| Runs which exit 1 | 1 of 40 | 1 of 40 |

The one red before carried both findings under the colour name: one die drew nearer another type's
mean, and one die showed no colour of its own. The rate did not move, because both findings are
real. What moved is which check owns each one.

Seed 22 now reads:

    browser: FAIL pool.every-die-shows-its-own-surface visible=23 of a pool of 24, against a floor
    of 24. ... hidden=1 [stress-d6 no pixel of its own surface is frontmost, over 145 pixels out to
    0.85 of its projected radius, and over 1257 more across the whole silhouette, at a step of a
    20th of that radius]. ... Fewest verified points on one visible die=25
    browser: OK pool.colour-separates-the-types classified=23 of the 23 visible dice, out of a pool
    of 24, against 6 type means. ... The closest two means are attribute/bonus at 0.173
    chromaticity units. failures=0

`gear-d6` is no longer a colour failure on that frame.

### Three red-proofs, each against one check

Every file came back from a copy saved outside the repository. No version-control command restored
one, so no byte of the work was at risk.

**The colour check.** `skill` took the `gear` hex value in `src/tray/dice-colors.ts`. Seed 5 exited
1, and the visibility count stayed whole:

    browser: OK pool.every-die-shows-its-own-surface visible=24 of a pool of 24, against a floor of
    24. ... hidden=0
    browser: FAIL pool.colour-separates-the-types classified=24 of the 24 visible dice, out of a
    pool of 24 ... The closest two means are skill/gear at 0.001 chromaticity units. failures=3
    [gear-d6 drew nearer the skill colour than its own; gear-d8 drew nearer the skill colour than
    its own; gear-d12 drew nearer the skill colour than its own]

**The visibility check.** A temporary line in `runPoolScene` moved die 0 to the position of die 1
and scaled it to 0.4, which buries a small die inside a larger one. The run printed
`browser: INJECTED die 0 moved inside die 1`, so the injection is known to have landed. Seed 5
exited 1, and the colour check stayed green over the dice which remained visible:

    browser: FAIL pool.every-die-shows-its-own-surface visible=23 of a pool of 24, against a floor
    of 24. ... hidden=1 [attribute-d6 no pixel of its own surface is frontmost, over 145 pixels out
    to 0.85 of its projected radius, and over 1058 more across the whole silhouette ...]
    browser: OK pool.colour-separates-the-types classified=23 of the 23 visible dice, out of a pool
    of 24 ... failures=0

The same seed 5 passes both checks with no injection.

**The unit test.** `toChromaticity` returned the linear point unchanged. `node --test` exited 1 and
named the claim: `a shaded gear die must read as gear in chromaticity`. A second injection, which
returned the first two linear channels and divided nothing, was caught by the invariance assertion:
`light times 0.5 moved the point by 0.21257319181832063`.

### Measurements

| Number | Value |
|---|---|
| Files changed | 4, `scripts/browser.mjs`, `scripts/browser.test.mjs`, `.claude/skills/run-clatter/SKILL.md` and `LEDGER.md` |
| New tests | 1, in `scripts/browser.test.mjs`. The `node --test` total moves from 11 to 12. |
| Test total | 131 under Vitest, unchanged. The browser run needs a graphics card and stays out of `validate`. |
| Initial JavaScript | 6,956 gzip bytes, unchanged. Budget 61,440. |
| Lazy 3D chunk | 152,342 gzip bytes, unchanged. Budget 204,800. |
| Steps to rest | 203 over 5 runs, spread 0, scene digest unchanged |
| Harness exit codes at seed 5 | `--tray` 0, `--pool` 0, `--push` 0, `--probe` 0, `--context-loss` 0, `--reduced-motion` 0 |
| Branding gate | `files_scanned=84`, `hits=0`, exit 0 |
| Validate | `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, all exit 0 |

## Unit 3.6 — the engine half

The unit splits in two, for the reason every Phase 3 row records. The engine and the state it
stores need nothing from the application shell. The volume control and the settings toggle are
interface, and Phase 4 owns them, so they wait at `BLOCKED:owner-gate` on Unit 2.0.

### The acceptance, restated

The plan writes the acceptance as *no audio file loads until the user enables sound*. This unit
loads no audio file in any state, because every sound is synthesised and the repository holds no
audio file at all. The sentence is therefore true of a broken build as well as a working one, and a
check written from it could not fail. Four properties carry the same intent and can fail:

1. **No `AudioContext` is constructed** until the player turns sound on.
2. The engine starts **no voice while sound is off**, while collisions are still arriving.
3. The context is **born suspended**, and nothing in the engine resumes it. A user gesture does.
4. Every collision the tray reports is **accounted for**, against a count taken outside the engine.

### What landed

- **The engine.** `src/tray/sound.ts`. `createSoundEngine` holds the player's choice, builds nothing
  until `enable`, and takes one collision at a time through `impact`. `voiceOf` is pure: it turns a
  collision into a pitch, a level and a length, or into nothing when the collision is too soft.
  `playVoice` builds the three nodes one voice needs.
- **The sound.** A burst of noise through a band-pass filter, which is what a small hard object
  striking another one sounds like. The noise buffer is one fixed waveform per context, filled by a
  32-bit xorshift with a fixed start, so an offline render repeats exactly. Two timbres: a die
  meeting a die is 2,400 Hz and 50 ms, a die meeting a wall or the desk is 780 Hz and 130 ms. The
  level is the square root of the closing speed, mapped over the measured range. A drawn spread
  moves the pitch by up to 35 per cent and the length by up to 30 per cent, so twelve dice landing
  together do not make one sound twelve times. The spread comes from `crypto.getRandomValues`,
  because Constraint 7 bans `Math.random` from shipping code.
- **A limiter.** Twelve dice land inside a second and their voices overlap. The offline render of
  one whole throw peaked at 13.8 before the limiter and at 1.1 after it.
- **The collision hook.** The vendored `eventCollide` reports the collision and plays nothing. It
  reports the kind of body the die met, the closing speed **along the contact normal**, and the two
  body ids. The normal speed is what separates a heavy landing from a die skidding past its
  neighbour; the length of a velocity vector cannot tell those apart. `loadSounds` and `loadAudio`
  are deleted, with the `await this.loadSounds()` clause and the six instance fields the two of them
  used. All of it pointed at the mp3 files Unit 3.1 deleted.
- **The stored state.** `Settings` gains `soundEnabled`, false by default, and `soundVolume`, 0.5 by
  default. `SETTINGS_VERSION` is 4 and `MIGRATIONS` gains a 3 to 4 step. The migration table runs 17
  cases against a 17-item enumeration, and the four new cases are a version 3 record, a volume above
  the range, a volume that is not a number, and a flag that is not a boolean.

### The measured impact speeds

The two constants are sized against the tray, not guessed. One sounded throw of the fixed twelve-die
scene reported this distribution of closing speeds along the contact normal, in tray units a second:

    min=1 p25=48 median=128 p75=427 max=1560

`SILENT_BELOW` is 120 and `LOUDEST_AT` is 2,400. The floor drops the settling touches near the
bottom of the range, which is where the count of quiet collisions comes from, and the top sits just
above the hardest landing measured. A change to `gravity_multiplier`, `baseScale` or the die size
moves this distribution and both constants must be read off it again.

### The browser check

`scripts/browser.mjs --sound` throws the fixed twelve-die scene twice, once with sound off and once
with it on. It counts the collisions itself, off the tray's `onImpact` hook and off the world's own
`beginContact` event, which reaches this file by a different route. Neither number is one the engine
can write. Run on the graphics card with the sandbox off, at `--throw-seed 5`:

    browser: sound OFF collisions=507 pairs=181 die=296 surface=211 contexts_built=0 triggers=0
    browser: sound ON contexts_built=1 state=suspended output_gain=0.4000000059604645
    browser: sound gesture shut=suspended state before=suspended after=running user_activation=true
    browser: sound ON collisions=683 pairs=270 triggers=224 paired=246 quiet=213
    browser: sound render peak_at_0.4=1.098862 peak_at_0=0.000000 distinct_levels=221 kinds=2
    browser: mode=hardware failures=0

The collision counts are not the same from run to run, because the library replays its throw in
batches of steps sized by the wall clock. No check reads a recorded count: every one is a relation
between two counts measured in the same run, or a floor.

**This browser does not enforce the autoplay policy on web audio.** Measured on 2026-08-09: an
ungestured `resume()` succeeds, and a context Firefox allows starts itself a moment after it is
built. So the gesture check would have raced the browser, and it would have passed on an engine
whose `resume` did nothing. The run therefore shuts the clock from outside the engine, and the
gesture is then the only thing that can restart it.

### The red-proofs

Each one restores from a saved copy, and the hash of `src/tray/sound.ts` matches the copy after
every restore. Nothing was recovered with `git stash` or a checkout.

1. **A context built up front.** `sound.no-audio-context-until-the-player-turns-sound-on` went red:
   `the page constructed 1 audio contexts over a throw that reported 535 collisions, against a floor
   of 1 collision and a ceiling of 0 contexts`. Exit 1.
2. **The gate removed**, so the engine plays whatever the tray reports.
   `sound.silent-while-sound-is-off` went red: `the engine started 236 voices, against a ceiling of
   0, while the tray handed it 581 collisions and this file counted 581 of them for itself`. Exit 1.
3. **Every third collision dropped** without being counted anywhere.
   `sound.every-collision-reaches-the-engine-and-is-accounted-for` went red: `152 started a voice,
   135 were the second report of one die-on-die contact and 79 were too soft, which is 366 and must
   equal 485`. Exit 1.
4. **A resume that does nothing.** `sound.a-user-gesture-starts-the-audio-clock` went red: `The
   context read suspended inside the handler before that call and suspended after it`. Exit 1.

### Measurements

| Number | Value |
|---|---|
| Files changed | 11. Two new: `src/tray/sound.ts` and `src/tray/sound.test.ts`. |
| New tests | 9 under Vitest. The total moves from 131 to 140. The `node --test` total is unchanged at 13. |
| Harness modes | 8. `--sound` is new. Every mode exits 0 on the graphics card at `--throw-seed 5`. |
| Initial JavaScript | 6,951 gzip bytes, from 6,956. Budget 61,440. |
| Lazy 3D chunk | 151,842 gzip bytes, from 152,342. Budget 204,800. The deleted audio loader is the fall. |
| Steps to rest | 203 over 5 runs, spread 0, scene digest unchanged |
| Branding gate | `files_scanned=86`, `hits=0`, exit 0 |
| Validate | `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, all exit 0 |

### What is open

The engine has no caller in the application yet. `mountTray` takes the hook through its `config`
option and nothing passes one, so the module is not in the built chunk. The volume control, the
settings toggle and that wiring are Phase 4 interface work and wait on Unit 2.0. **Unit 3.6 is not
complete.**

---

## Unit 3.5 — the tray half

The unit splits in two, for the reason every Phase 3 row records. What is drawn on the dice and
what a click does need nothing from the application shell. Roles, accessible names, `aria-pressed`
state and focus order are DOM, and the keyboard route runs through the history matrix of Unit 2.2,
so both wait at `BLOCKED:owner-gate` on Unit 2.0.

### Shape carries the state

Unit 3.3 already spends hue on the dice type, over a lightness ladder. A second meaning on the same
axis would compete with the first, and Constraint 6 puts accessibility inside the unit. The state
therefore rides shape:

| State | Mark | What it says |
|---|---|---|
| rule | a closed frame around the die | the rules hold it, and a click does nothing |
| choice | four blocks gripping its corners | the player put them there, and a click takes them away |
| loose | nothing | the die goes back in the cup |

Colour is a second, redundant carrier. The frame is slate and the blocks are near-white.
`src/tray/affordance.test.ts` computes the contrast of each one against the tray surface and
against the other, from the hex values, with no renderer.

A mark is a flat unlit shape at the die's own height, not a child of the die. A child would join
`box.diceList` under a recursive raycast, and the colour check of Unit 3.3 reads every node of a die
as that die's own surface. The height matters as well: the camera looks down from one point, so a
mark lying on the desk projects away from the die standing above it, and the gap widens with the
distance from the middle of the tray. At the die's own height the two are concentric everywhere.

### A die can be wholly buried

Unit 3.5's own measurement, before this unit was built: on one seed of forty a d6 showed no pixel of
its own, 1,257 silhouette pixels all meeting another body first. `dieAt` answers `null` at every
point over such a die, on purpose. A player who cannot see a die cannot aim at it, and a click that
reached through the heap would toggle a die the player never meant. The tray therefore has no route
to a buried die, the run reports it as unreachable, and the keyboard route through the history
matrix is the route to it. The pool never depends on the tray for correctness.

The throw is not spread to fix this. Spreading it moves `steps_to_rest_fixed_seed_scene` and the
pinned scene digest, which is a budget conversation and not a free change.

### The measurements

Run on the graphics card with the sandbox off, at `--throw-seed 5` and `--viewport 1440x900`:

    browser: affordance states rule=4 choice=4 loose=4 of 12
    browser: affordance counters draw_calls=849 triangles=906 textures=77 geometries=15 dice=12
    browser: affordance shape rule dice=4 directions_covered=[48, 48, 48, 48] of 48
    browser: affordance shape choice dice=4 directions_covered=[20, 20, 20, 20] of 48
    browser: affordance shape loose dice=4 directions_covered=[0, 0, 0, 0] of 48
    browser: affordance marks read=8 of 8 sampled_points=268 occluded_points=3 edge_points=1
    browser: affordance marks dimmest_reading=4.91 weakest_pixel=4.91
    browser: affordance clicks refused=4 toggled=8 unreachable=0 reported=12 of 12
    browser: mode=hardware failures=0

The shape probe drops a ray straight down onto the desk, so it reads geometry and can see no colour,
no light and no hue at all. It counts every hit on the die's own mark, not the frontmost one, so one
mark overlapping another cannot hide it. The gate is that the three states occupy three separated
ranges of directions, which carries no tolerance to widen.

The luminance reading is the strongest pixel that is wholly one mark, taken off the frame composited
over the tray surface, because the renderer clears to transparent. A pixel is wholly a mark only
when its eight neighbours all raycast to the same mark; anything else already carries a share of
whatever lies behind it. The mark is one flat unlit colour, so one such pixel carries the claim, and
the denominator is the count of marked dice. The occluded and edge counts are reported and not
gated, because the heap is what a throw makes of it.

**Measured while building this: sampling at the mark's first hit read 2.28:1 rather than 4.91:1.**
The first hit along a direction is the mark's own silhouette edge, where the renderer has already
blended it with the desk, so a contrast read there measures the antialiasing. The probe now samples
the middle of the run.

**A five-run batch showed one run at 25 occluded points and one blended sample.** Eight consecutive
runs after that were identical, die position for die position, so the poses are deterministic. Two
things now hold the reading steady: the run waits two animation frames after the throw, so the
library owes no frame, and `frontmostAt` derives its ray from the framebuffer itself rather than
from the css rectangle and the pixel ratio, so the ray and the pixel are the same sample whatever
those two say. Six runs after the change read 268, 3 and 1 every time.

### The render counters

| Counter | Twelve dice, no marks | Twelve dice, eight marks | Ceiling |
|---|---|---|---|
| draw calls | 841 | 849 | 968 |
| triangles | 842 | 906 | 969 |
| textures | 77 | 77 | 89 |

One mark costs one draw call and eight triangles, and it casts no shadow, so it is drawn once. The
scene the ceilings were recorded against is the twelve-die scene of Unit 3.2 and this fixture is a
different scene, so the base above is that scene's own 841 and 842. Twelve marks would therefore add
twelve draw calls and 96 triangles, and both stay under. No budget was widened and `budgets.json` is
unchanged.

### The vendor patch

The bundle inlines three.js and exports none of it, so a module outside `src/tray/vendor/` cannot
build a mesh. Four names are added to the export list: `ThreeMesh`, `ThreeBufferGeometry`,
`ThreeBufferAttribute` and `ThreeMeshBasicMaterial`. Nothing else moved. The published
`enableDiceSelection` click path is left alone and unused, because it fires only when a pointer move
has already set `hoveredDice`. `src/tray/affordance.ts` hit-tests the click event itself, through
the same raycaster.

### The red-proofs

Each one restores from a saved copy, and the hash of `src/tray/affordance.ts` matches the copy after
every restore. Nothing was recovered with `git stash` or a checkout.

1. **A rule-locked die responds to a click.** `clickOutcome` returns `released` for a rule lock.
   `affordance.a-rule-lock-refuses-a-click-and-the-other-two-toggle` went red: `refused=0 against
   the 4 dice the core locks by rule ... failures=4 [rule-d6 was rule, so the click had to be
   refused, and it was released; rule-d8 ...; rule-d10 ...; rule-d12 ...]`. Exit 1.
2. **Two states drawn the same.** The choice state draws the frame the rule state draws.
   `affordance.the-three-states-differ-by-shape-alone` went red: `rule 48-48 over 4 dice, choice
   48-48 over 4 dice, loose 0-0 over 4 dice. overlaps=1 [choice and rule cannot be separated: choice
   reaches up to 48 directions and rule down to 48]`. Exit 1.

### What the capture shows

`docs/design/0008-affordance-1440.png`, seed 5. The frames read at once as cages. The corner blocks
read as a grip on the die they surround. A loose die carries nothing and is unmistakable. Against
the six type colours the frame is a desaturated slate that no dice type uses, and every mark sits
outside the die silhouette on the dark surface, so no mark is read against a die body.

**Reported, not fixed.** Where two marked dice land close together the eight corner blocks read as
one group for a moment before the eye pairs them with their dice. The frames never do this, because
a closed shape is its own boundary. The near-white of the blocks is also the closest mark colour to
the ivory of an attribute die, which is the lightest of the six.

### What is open

Roles, accessible names, `aria-pressed` state and focus order asserted in the driven browser, and
the keyboard route to the same toggle through the history matrix. All of it is DOM, the history
matrix is Unit 2.2, and both wait at `BLOCKED:owner-gate` on Unit 2.0. The affordance also has no
caller in the application yet. **Unit 3.5 is not complete.**

`.claude/skills/run-clatter/SKILL.md` was not updated with the `--affordance` mode, because the
permission rails deny a write under `.claude/skills`. The mode is documented in the header of
`scripts/browser.mjs`.

## Unit 4.4 — the store half

The plan's own words drive every clause: IndexedDB, a 5,000-roll ring buffer, insert and trim in
**one** transaction, a flush on `visibilitychange`, and four named refusals. `src/log/store.ts`
carries all of it. Nothing in the application imports it yet, so the built output does not hold it.

### One transaction, and why two is wrong

The store adds the batch, reads the count the insert produced, and deletes the excess from the
oldest end. All three run in one readwrite transaction. IndexedDB serialises readwrite transactions
over the same object store across every connection, so no other tab can add or delete between the
count and the deletions.

The keys come from the store's own generator. The key is therefore the insertion order, it is
monotone across every connection, and the oldest roll always holds the smallest key.

### The two-connection measurement

Run on the graphics card with the sandbox off, through `--log-store`:

    browser: log-store fill wrote=5000 batches=200 dropped=0 held=5000 elapsed_ms=880
    browser: log-store two connections wrote=400 total_written=5400 held=5000 dice_per_roll=12
    browser: log-store persist calls=1 answer=true usage=28747688 quota=8390139904
    browser: mode=hardware failures=0

The buffer is filled to 5,000 rolls of twelve dice over three generations. Two connections then
write 200 rolls each, one roll per transaction, neither waiting for the other. The denominator is
5,400 rolls, counted from the list this file hands to the store, and every roll carries the key its
own insert was acknowledged with. The order therefore comes from the write path and never from the
buffer, where the trim has already been. The survivors must be the newest 5,000 of those keys, in
that order: `compared=5000, missing=0, unexpected=0, out_of_order=0, dropped=400 of which 0
belonged to the newest 5000`. The two connections changed hands 399 times over the 400 rolls, so
the interleaving is real and not one connection twice over.

### The end state cannot see the defect. This is the finding

**Measured while building this: the split into two transactions leaves the end state correct.**
The first red-proof below split the insert and the trim apart, ran the same two connections, and
every end-state check stayed green. The reason is that the error heals itself. Two connections both
read a count of 5,001 and 5,002, both trim, and the buffer drops to 4,999 for a moment. The next
insert refills it, and the roll destroyed early is one the buffer would have dropped a moment later
anyway. At rest the buffer holds exactly the newest 5,000 either way.

A ring buffer owes its invariant at every committed state, not only when the writing stops. So each
connection now reads the committed buffer after every one of its own writes, in its own readonly
transaction, through the browser's own count and two key cursors. Every reading must hold exactly
5,000 rolls over a dense window of keys ending at the newest. That reading is 400 of 400 in window
with the store as it stands, and it is the check the red-proof breaks.

### Zero long tasks over 50 ms

    browser: log-store fill ... longtask_supported=false longest_task_ms=0.0
             longest_gap_ms=5.0 ticks=219

**This browser has no `longtask` entry type.** `PerformanceObserver.supportedEntryTypes` does not
list it, so the plan's instrument cannot run here. The run says so in the check text rather than
reporting a silent zero. A second instrument therefore carries the measurement: a timer that
re-arms itself, whose longest gap between two consecutive tasks is how long the main thread was
blocked. The observer is still registered where a browser has one, and the check takes the larger
of the two.

The longest task over the whole 5,000-roll insert is 5 ms against a ceiling of 50 ms. The timer
ticked 219 times against a floor of 200, which is its own denominator: a watchdog that never ran
fails rather than reports nothing.

### Four refusals, four answers

Each one is asserted on its own, because a caller must tell a full disk from a database the browser
would not open.

| Path | How the run reaches it | What the store answers |
|---|---|---|
| refused | the error this browser raises on an opaque origin, measured in-run | `refused` |
| blocked | a second connection holds version 1 with no `versionchange` handler | `blocked` |
| versionchange | another tab asks for version 2 | the connection closes, the other tab is never blocked |
| full | the browser is launched with a 4 MB storage limit | `full` |
| error | a roll carrying a value the browser cannot clone | `error`, never `full` |

The refusal error is not invented. The run first puts a sandboxed frame on the page, whose origin is
opaque, and reads what `indexedDB.open` throws there: `SecurityError: IDBFactory.open: The
operation is insecure`. That is the shape a private window has. The run then makes `open` throw that
same error and proves the injection landed before it believes the answer.

The quota error is not simulated either. `--quota-kb 4096` launches the browser with its own storage
limit, and the browser raises the error:

    browser: log-store quota limit=4194304 batches_written=14 kind=full
             reason=QuotaExceededError: The current transaction exceeded its quota limitations.

The filler bytes are random. A run of zeros compresses away inside the store and never reaches the
limit.

### The flush on visibilitychange

    browser: log-store flush queued=3 before=5000 midway=5000 after=5000 pending=0
             hidden_landed=true

Three rolls are queued and the buffer does not move, so nothing is written early. The run then makes
`visibilityState` read hidden, proves it, and dispatches the event. The queue empties and the three
newest rolls in the buffer are the three that were queued. The buffer is at capacity, so a count
alone would prove nothing and the check reads the identifiers.

### The red-proofs

Each one restores from a copy saved outside the repository, and the SHA-256 of `src/log/store.ts`
matches that copy after the restore. Nothing was recovered with `git stash` or a checkout.

1. **A long task during the insert.** `--long-task-ms 120` blocks the main thread for 120 ms inside
   the fill. `log-store.no-long-task-over-the-ceiling-during-a-full-buffer-insert` went red and
   named the duration: `The longest task is 121.0 ms against a ceiling of 50 ms: the timer measured
   a gap of 121.0 ms`. Exit 1.
2. **The insert and the trim in two transactions.** The trim moved into a second transaction, using
   the excess the insert transaction had computed.
   `log-store.the-full-buffer-never-loses-a-roll-between-two-writes` went red and named the roll:
   `readings_out_of_window=5, rolls_lost=1 [fill-000002] [after a roll 0 the buffer held 4999 rolls
   over keys 4 to 5002, and it must hold 5000 over 3 to 5002, so fill-000002 had already gone; ...
   after a roll 1 the buffer held 5001 rolls over keys 4 to 5004 ...]`. Exit 1. The three end-state
   checks stayed green in the same run, which is the finding above.

### The bundle

`bundle-size: OK initial_js_gzip_bytes measured=6953 budget=61440` and `lazy_3d_chunk_gzip_bytes
measured=151876 budget=204800`. Both are unchanged, because nothing imports the store yet: `dist`
holds no occurrence of the database name. Priced for the day the screen wires it up, with every
export referenced from the entry, the initial chunk reads 8,005 gzip bytes. That is 1,052 bytes
against a budget of 61,440.

### What is open

The settings screen that shows `estimateStorage`, the log view, the export button, and the note the
plan asks for in the interface: iOS deletes script-writable storage after seven days without a
visit unless the site is installed to the home screen, so "survives a campaign" is false on an
iPhone for a fortnightly group. All four are interface work and wait on Unit 2.0.
**Unit 4.4 is not complete.**

## Unit 4.1 — the localStorage binding

`readSettings` and `writeSettings` already took the store as an argument, so the binding is
`localSettingsStore` in `src/settings/local-store.ts` and nothing else. It answers the page's own
`localStorage`, or null where the browser throws from the property. It is a separate file because
`src/settings/settings.ts` states that it names no browser API, and that claim is what lets the
migration run under a plain test runner.

The migration was already held by `src/settings/settings.test.ts` over hand-made objects. The
`--settings-store` mode drives the same claims through the real store, which is the half no check
had ever exercised.

    browser: settings-store round trip wrote=true fields=7 moved_off_default=6 raw_bytes=153
    browser: settings-store corrupt values=6 failures=0
    browser: settings-store refused injection_landed=true binding=null wrote=false fell=true
             threw=nothing restored=true
    browser: settings-store quota filled_bytes=5239488 blocks=150 error=QuotaExceededError
             wrote=false threw=nothing
    browser: mode=hardware failures=0

Four claims, each asserted on its own:

1. **A real round trip.** A record with six of its seven fields off the default is written through
   the binding and read back through a second call to it. All seven fields are compared and the
   floor of six moved fields is what stops a binding that always answers the defaults from passing.
2. **Six unusable stored values.** An unknown stored version, text that is not JSON, a JSON array, a
   JSON string, an empty value and JSON null. Every one is put into the page's own `localStorage`
   as text, because text is all `localStorage` ever holds. Every read equals the defaults over all
   seven fields and none throws. The first case is the plan's own acceptance for this unit, now
   asserted through the real store.
3. **A refused store.** The run makes the `localStorage` property throw a `SecurityError` and proves
   the injection landed by reading it. The binding answers null, the read answers the defaults, the
   write answers false and the permanent fall to flat still answers true from memory. Nothing
   throws, and the property is put back.
4. **A full store.** The run fills `localStorage` with 150 blocks over 5,239,488 characters, at
   three block sizes, until the browser raises `QuotaExceededError`. Nothing simulates that error.
   The settings write then answers false rather than throwing.

### What is open

The settings screen. **Unit 4.1 is not complete.**

## Both halves — how they were run

`.claude/skills/run-clatter/SKILL.md` was not updated with the `--log-store` and `--settings-store`
modes, because the permission rails deny a write under `.claude/skills`. Both modes are documented
in the header of `scripts/browser.mjs`, with `--long-task-ms` and `--quota-kb` beside them.

`scripts/browser-driver.mjs` gained two settings. `permissions.default.persistent-storage` is
allowed, because `navigator.storage.persist()` asks for a permission and a headless browser has
nobody to answer the prompt: the promise never settles and a run hangs until the driver gives up.
Measured on this host on 2026-08-09. `--quota-kb` adds the browser's own storage-limit switch, and
only a run that names that flag carries it.

Every harness mode was run again on the graphics card with the sandbox off, in hardware mode. All
twelve invocations exited 0: the self-test, `--tray`, `--pool`, `--push`, `--affordance`, `--probe`,
`--context-loss`, `--reduced-motion`, `--sound`, `--log-store`, `--log-store --quota-kb 4096` and
`--settings-store`. `npm run perf` reports 203 steps against a budget of 224, with the scene digest
unchanged.

## Units 4.5 and 4.6 — the export and the round trip

Both units shipped their codec against hand-made logs. What no pure test can reach is the store, and
the store landed at Unit 4.4. `scripts/browser.mjs --log-csv` is the browser half of both units.

### The full-buffer export

Run on the graphics card with the sandbox off:

    browser: log-csv fill wrote=5000 held=5000 elapsed_ms=872
    browser: log-csv export rolls=5000 rows=160000 parts=160001 chunks=100 bytes=32910207
             chars=32910207 read_ms=110 export_ms=794 wall_ms=904 longtask_supported=false
             longest_task_ms=0.0 longest_gap_ms=13.0 ticks=124
    browser: log-csv one-task export ms=402 longest_gap_ms=402.0 bytes=32910207
    browser: mode=hardware failures=0

The buffer holds 5,000 rolls of twelve dice over three generations. It exports to 160,000 rows and
32,910,207 bytes in 904 ms of wall time, and the longest task is 13 ms against the 50 ms ceiling the
plan sets.

**The window covers the read as well as the build**, because an export button does both and a player
waits through both. The plan's own acceptance names the export alone. A window drawn around the
build alone would have passed on the first measurement and hidden the finding below.

**This browser still has no `longtask` entry type.** The re-arming timer of Unit 4.4 carries the
measurement, and the check says which instrument answered rather than reporting a silent zero. The
timer ticked 124 times against a floor of 100, which is its own denominator.

### Two long tasks the first measurement found

1. **`readRolls` rebuilds the whole buffer in one task.** The first run read a longest task of 86 ms
   inside the read, and the whole of it is the browser deserialising 5,000 rolls in the task that
   answers one `getAll`. `readRollsInPages` reads the buffer a page of 250 rolls at a time, each
   page in its own transaction. No timer is needed for that: the answer to a request already
   arrives in a task of its own. The longest task inside the read is now 10 ms.
2. **The build is one task for as long as it takes.** The same buffer through the one-task
   `exportCsv` blocks for 402 ms, and the same timer reads 402 ms. That number is reported and
   never gated. It prices what the chunking buys, and it is how the run shows the instrument
   responds: an instrument that reads the same small number either way is measuring nothing.

`exportCsv` stays, with the cost written into its own comment. It is the honest call for a small log
and for a test that wants one string.

### The chunk size is measured, not chosen

The longest task of a full-buffer export, at four chunk sizes, with the build wall time beside it:

| Rolls in a chunk | Longest task | Build |
|---|---|---|
| 500 | 72 ms | 508 ms |
| 100 | 18 ms, and 60 ms on one run | 578 ms |
| 50 | 14 ms over three runs | 790 ms |
| 25 | 12 ms | 1,216 ms |

Below fifty rolls the number stops falling. What is left is the timer the yield rides on, so the
work of one chunk is a small part of the longest task and a device several times slower still stays
inside the ceiling. The wall time rises because `setTimeout` clamps a nested timer, and the wall
time is not gated.

### The pieces are counted where they are handed over

`exportCsvInChunks` counts the pieces at the point it gives them to `Blob`, and the run counts the
rows a second way, over the rolls themselves after the measured window closes. The two must agree at
one header plus one row per non-null cell: 160,001 against 160,000 plus one. A rewrite that joins
the document fails that count. Each chunk is its own `Blob`, so the strings of a chunk are released
when it closes and the heap never holds the whole 32 MB.

### A full export only just fits under the import cap

    browser: OK log-csv.a-full-buffer-export-fits-under-the-import-cap the file holds 32910207
             characters against the 33554432 an import reads, so 644225 characters of room.

**Reported, not fixed.** The room is 644,225 characters over 160,000 rows, which is four characters
a row. Every row repeats the roll's note, so a note four characters longer than the 22 the fixture
carries fills the cap, and the application would then write a file it refuses to read. The cap is
`MAX_IMPORT_CHARS` and the row shape is the schema, and the two are set in different places. The
check measures the real file on every run, so the day this stops being true it goes red rather than
rotting. The owner decides whether to raise the cap.

### The round trip, through the real store

    browser: log-csv round trip before=60 chars=134015 imported=60 after=60 store_count=60
             fields=3872 of 3872 differences=0 import_ms=5
    browser: log-csv mid-import readings=2 old=1 new=1 neither=0 doomed_survives=false

Sixty rolls go into the store, come back out of it, go to a file, are read back by `importCsv` and
are written to the store again. The rolls are built in the page, because `src/log/entry.ts` reaches
for `node:crypto` and cannot be imported into a browser. Every field is moved off a constant: six
dice types, four face counts, one to twelve dice, one to three generations, dice that joined the
pool later, and ten awkward notes, which include a formula, a comma, a quote, a line break, an
apostrophe, two signs, an at sign and an empty note.

The comparison is field by field and not roll by roll: 3,872 leaf fields against 3,872 counted a
second way over the log that went out. The compared roll count is 60, it equals the store's own
`count()`, and the floor is the whole fixture, so an empty round trip cannot pass. The profile hash
is counted on its own as well: 60 of 60 equal, and 60 of them distinct, so one fabricated constant
cannot pass either.

### The three decisions, asserted through the store

| Decision | How the run reaches it | What must hold |
|---|---|---|
| an import replaces the log | one roll is added that the file does not carry | the log holds 60, the added roll is gone, and a merge would leave 121 |
| a duplicate `roll_id` is rejected | the file is rebuilt with the first roll's block written twice | `importCsv` throws naming the roll, and the log is untouched |
| the cap refuses a file before it is parsed | a file one character over the cap, which opens a quoted field and never closes it | the error names the limit and not the quote, so nothing was parsed |

The third one needs no clock. A parser reaching that text throws about the quote, so the error text
alone says which check ran first.

### Replace is mid-flight work, and the end state cannot see it

Unit 4.4 found that a split transaction heals itself. The same shape is here: a clear and an insert
in two transactions leave exactly the same log as one transaction does. So a second connection reads
the committed log in a loop while the import writes, in its own readonly transactions, and every
reading must hold the whole old log or the whole new one. The loop starts before the write, so its
transactions are already queued when the write begins.

### The red-proofs

Each one restores from a copy saved outside the repository, and the SHA-256 of the file matches that
copy after the restore. Nothing was recovered with `git stash` or a checkout.

1. **A long task inside the export.** `--long-task-ms 120` blocks the main thread at a chunk
   boundary. The injection is proved to have landed by `blocked_injections=1`, and
   `log-csv.a-full-buffer-export-holds-no-long-task-over-the-ceiling` went red naming the duration:
   `The longest task is 125.0 ms against a ceiling of 50 ms: the timer measured a gap of 125.0 ms`.
   Exit 1.
2. **The pieces joined.** Each chunk was joined into one string before it went to `Blob`.
   `log-csv.the-document-is-built-from-many-parts` went red and named both counts: `the writer
   counted 100 pieces ... against 160000 rows counted a second way ... plus the header: 160001`.
   Exit 1. The file it produced was byte for byte the same size, so nothing else could have caught
   it.
3. **The clear in its own transaction.** `appendRolls` was made to empty the log in a first
   transaction and insert in a second.
   `log-csv.the-replace-is-one-transaction-and-never-shows-an-emptied-log` went red: `3 readings ...
   1 of the whole old log, 1 of the whole new one and 1 of anything else`. Exit 1. **The four
   end-state checks stayed green in the same run**, which is the Unit 4.4 finding again.

### The bundle

`bundle-size: OK initial_js_gzip_bytes measured=6953 budget=61440` and `lazy_3d_chunk_gzip_bytes
measured=151876 budget=204800`. Both are unchanged, because nothing in the application imports the
log yet.

### How it was run

`.claude/skills/run-clatter/SKILL.md` was not updated with the `--log-csv` mode, because the
permission rails deny a write under `.claude/skills`. The mode is documented in the header of
`scripts/browser.mjs`, beside `--log-store` and `--long-task-ms`.

Every harness mode was run again on the graphics card with the sandbox off, in hardware mode. All
thirteen invocations exited 0: the self-test, `--tray`, `--pool`, `--push`, `--affordance`,
`--probe`, `--context-loss`, `--reduced-motion`, `--sound`, `--log-store`,
`--log-store --quota-kb 4096`, `--settings-store` and `--log-csv`. `npm run perf` reports 203 steps
against a budget of 224, with the scene digest unchanged.

### What is open

The export button, the download, the import control and the file picker, plus the byte-size check on
the file the picker returns and the message a rejected import shows. All of it is interface work and
waits at `BLOCKED:owner-gate` on Unit 2.0. **Units 4.5 and 4.6 are not complete.**

## Unit 4.9 — Share card, the capture half

The unit splits. The summary composition, the download button and the Web Share call are design
work behind the Unit 2.0 owner gate. The capture is not, and it holds the trap.

### The trap, and the shape of the answer

The published library builds its renderer with a literal option object, so `preserveDrawingBuffer`
can never be set. `docs/design/0003-vendor-patch-list.md` records that as fact 3. Without the flag
the browser clears the drawing buffer once it composites the frame, so a copy taken in a later task
reads an empty canvas. Unit 3.1 exposed the renderer, which is what makes this unit possible.

The answer is order, not a flag. `captureTrayJpeg` renders one frame and copies it in the same
task. The function is synchronous, and that is the enforcement: a synchronous function cannot
await, so the copy cannot fall into a later task by accident. `src/tray/capture.test.ts` fails when
the declaration becomes `async`, and the failure names it. That check was red-proved by making the
function async: `expected 'AsyncFunction' to be 'Function'`.

The renderer clears to transparent and the surface a player sees is the element behind the canvas.
JPEG carries no alpha. The capture therefore lays the surface colour down first and draws the frame
over it, inside the same task. A card that skipped this step would show the dice on black.

### The two measures

Both come from the plan, and neither asks what the picture is of.

    browser: share pool_seed=20260809 dice=24 css=1440x900 buffer=1440x900 pixel_ratio=1 surface=#23262b
    browser: share capture media_type=data:image/jpeg bytes=93833 canvas=1440x900 declared=1440x900 decoded=1440x900
    browser: share frame pixels=1296000 mean_luma=42.10 luma_variance=383.92 distinct_values=28892
    browser: mode=hardware failures=0

Both numbers are read off the **decoded JPEG**, not off the canvas, so the encode sits inside what
they cover. Luminance is the Rec. 709 luma of the sRGB bytes, on the 0 to 255 scale, and the
variance runs in two passes so no cancellation between two large sums can hide a small spread.

The floor of 25 luma levels squared is a standard deviation of 5 levels. That is above the 8-bit
quantisation step and above the ringing a JPEG encoder leaves on a flat field, so a frame that is
one colour apart from compression noise fails it, whatever colour that is. The two measured frames
sit either side of the floor by orders of magnitude: 383.92 for a real card and 0.00 for a cleared
one.

### The red-proof: the defect itself, not a stand-in

`--capture-later` splits the render away from the copy and puts the copy two animation frames and
one task later. The defect reproduces on this browser.

    browser: share frame pixels=1296000 mean_luma=37.72 luma_variance=0.00 distinct_values=1
    browser: FAIL share.luminance-variance-above-the-floor variance=0.00 luma levels squared against a floor of 25
    browser: FAIL share.distinct-pixel-values distinct=1 packed sRGB values against a floor of more than 1000
    browser: mode=hardware failures=2

Exit 1. The cleared frame is not black on the card, because the capture lays the surface colour
down first, so it comes back as one flat rectangle of `#23262b`. A mean luma of 37.72 is that
colour exactly. Both measures still go red, and each names the number it read and the floor it read
it against.

**The file check stayed green through the red-proof**, on a valid 36,223-byte JPEG of an empty
table. That is the finding worth keeping: a check on the file proves nothing about the picture, and
"the image contains the dice" would have proved nothing either.

### The file, and the checks a file can carry

`readJpeg` in `scripts/browser.mjs` reads the opening marker, the end-of-image marker at the tail
and the frame header. An empty capture, a half-written file and a PNG under a `.jpg` name each fail
on a different clause. Six such cases run against a six-item enumeration in
`scripts/browser.test.mjs`, with the count asserted, and none of them needs a browser.

The declared size, the decoded size and the canvas size are compared to each other, so a card of
the wrong part of the page fails.

### The card

`docs/design/0009-share-card-1440.jpg`, at seed 5. **For the owner, not for a check.** All 24 dice
lie flat on the tray, whole, with their shadows under them and nothing cut at any edge. The six
type colours all read at a glance. The pool spreads over the lower half of the frame and four dice
sit alone in the upper half, so the empty upper left is about a third of the card. The composition
is loose. That is a composition finding and it belongs to the deferred half of this unit, which
draws the summary over that space.

### Reported, not fixed

- Nothing in `src/` imports `src/tray/capture.ts` yet, so it enters no built chunk and both bundle
  figures are unchanged. It reaches a chunk when the share button lands.
- `.claude/skills/run-clatter/SKILL.md` was not updated with the `--share` mode, because the
  permission rails deny a write under `.claude/skills`. The mode is documented in the header of
  `scripts/browser.mjs`.
- The share mode stays out of `validate`. It needs a browser and a graphics card.

### How it was run

Every harness mode ran again on the graphics card with the sandbox off, in hardware mode. All
fourteen invocations exited 0: the self-test, `--tray`, `--pool`, `--push`, `--affordance`,
`--probe`, `--context-loss`, `--reduced-motion`, `--sound`, `--log-store`,
`--log-store --quota-kb 4096`, `--settings-store`, `--log-csv` and `--share`. `npm run perf`
reports 203 steps against a budget of 224, with the scene digest unchanged.

### What is open

The summary composition, the download button and the Web Share call. What text sits on the card and
how it is laid out is design work, and it waits at `BLOCKED:owner-gate` on Unit 2.0. **Unit 4.9 is
not complete.**

## Unit 2.1 — application shell and pool builder

### What landed

`src/shell/state.ts` holds the application state and every reading the screen takes from it. It
names no browser API and it decides no rule. The pool, the caps, the step ladder and the effect of
the difficulty all come from `src/rules/pool.ts`. `src/app.tsx` is the screen: the status line, the
pool builder, the difficulty, the footer and the one disclosure. `src/shell.css` carries the tokens
and the layout of `docs/design/0013-screen-final.html`, with the container queries of the drawn
frames rewritten as media queries over the viewport.

The shell throws no dice. `Roll` collapses the builder and shows the table, and `Edit pool` brings
the builder back, so both rest states of section 1 are reachable. The table mounts the vendored
tray through the dynamic import Unit 3.1 left, which is the routing to the tray this unit owes.

### Two instruments for one keyboard order, and why both

`src/app.test.tsx` runs under jsdom and enumerates the tab stops itself, because jsdom runs no
sequential focus navigation. `node scripts/browser.mjs --shell` presses the real keys in a real
browser. The first runs in `npm test` on every change and the second needs a browser, so neither
one covers the other.

Both read the list out of section 6 of `docs/design/0002-screen-design.md` rather than restating
it. That section states the same walk three ways — 11 numbered names, a count in words, and a
sentence splitting Tab from the arrow keys — and every statement is asserted, so the list carries a
denominator that can fail.

The walk knows no answer. At each stop it presses one arrow key. Focus that moves means a composite
the arrows walk, so the walk follows it until it comes back. Focus that stays means a control whose
arrows change a value, so the press is undone and no inner visit is recorded.

**The browser adds one tab stop the markup never asked for.** Firefox gives `.shell-m` a stop of its
own, because the box scrolls and a keyboard must be able to scroll it. The drawn screen earns the
same stop, since it carries the same `overflow-y: auto`. The run identifies such a stop by measure —
no `tabindex` attribute and a scroll height over its client height — reports it by name, and does
not count it against the authored list.

### The four red-proofs

1. The minus end of every pool tile lost its `tabindex="-1"`. The walk went from 11 visits to 154
   and the failure printed both lists.
2. The artifact tile was dropped from the bar. The walk read 10 against the document's 11 and named
   `pool-cell-artifact`.
3. `withMode` kept the counts. The switch check went red naming the gear tile, which read 1.
4. The live region was frozen at the empty sentence. The change check went red on the press that
   added the first die.

### Three decisions taken, each with its reason

**The bonus tile caps at 2, and the drawn screen prints no cap label on it.** Decision 1 fixes the
pool at 15 dice from an attribute of 5, a skill of 5, a gear of 3 and a bonus of 2, so 2 is the cap
and the tile prints `max` there like every other tile at its cap. The drawn file marks the other
five and not this one.

**Step mode holds one ladder tile, not two size pickers.** The plan's unit line asks for two size
pickers. Section 5 of the screen design merges them into one tile, and `STEP_LADDER` is why: the
core holds a step roll as one index into eight states, on purpose, because a pair of independently
stepped sizes is path-dependent and an index is not. Two pickers cannot be built without
reimplementing the ladder. The tile prints both sizes, `d10 + d8`, and steps the index.

**The artifact ladder lives in the shell, not in the core.** `specs/0001-rules-model.md` says which
faces an artifact die has and what each face scores. It says nothing about how a rating becomes
dice. Section 5 of the screen design is what asks for the enumerated ladder, so the mapping sits
beside the tile that steps it.

### The three widths, against the drawn renders

Captured from the running application at 360 by 760, 768 by 1024 and 1440 by 900, with the drawn
pool built by pressing the plus ends, and compared against `0013-screen-final-builder-*`. The
status line, the builder card, the six tiles, the difficulty row, the preview sentence and the
footer geometry match at all three widths. Every difference is a part no throw has produced yet:

- The status line reads 0 successes, 0 banes and push 0, where the drawn screen reads 6, 4 and 1.
- The kept shelf and the throw zone are absent. No die exists before Unit 2.2.
- The footer holds two buttons and no cost row. `Push` and `Edit pool` belong to a table with dice
  on it, and `Roll` carries the accent because it is the only throw on the screen.
- The bonus tile prints `max`, for the reason above.

### Reported, not fixed

- The stress counter is application state and is not persisted. `Settings` holds no field for it,
  and adding one is a settings version and a migration step that no acceptance here asks for.
- The mode is not persisted either. `src/settings/local-store.ts` is built and unread. The settings
  screen is Unit 4.1.
- The disclosure sheet holds the three controls section 4 marks as Unit 2.1: the mode switch, the
  stress reset and the close. The ruleset, the overrides, the artifact curve, the themes and the
  history are the units that own them.
- `--shell` stays out of `validate`. It needs a browser.

### How it was run

`npm run build`, then `node scripts/browser.mjs --shell --url http://localhost:4173/clatter/`
exited 0 over 5 checks, and `--offline` exited 0 over 8. The offline run is what proves the table
still reaches the lazy 3D chunk: it clicked `Roll` with the origin stopped, the precache answered
for `dice-tray-Cz13SOUC.js`, and the tray mounted one canvas.

---

## Unit 2.2 — flat dice, roll, push, readout

### What landed

`Roll` throws. `src/shell/state.ts` gains the throw, the push, the two zones, the readout and the
cost sentence, and every one of them asks the rules core. `rollNow` calls `firstRoll`, `pushNow`
calls `push`, `zonesOf` calls `isLocked`, `dieView` calls `lockState` and `score`, and `costLine`
and `pushNote` read one `previewPush`. The shell holds no lock rule, no cost model and no success
table. `src/app.tsx` draws the answer, and `src/shell.css` carries the zones, the dice, the pips,
the badges and the shake from `docs/design/0013-screen-final.html`.

The click that keeps or releases a die is `clickDie` from `src/tray/affordance.ts`, which Unit 3.5
already wrote against the same core. The flat renderer duplicates none of it.

**The tray is one control.** One roving tab index over the shelf and the zone, pool order inside
each, the shelf first. A die the rules hold is not a button, because the player cannot release it,
and it still holds its place in the arrow walk. A throw puts the roving index back on the first die
of the shelf, because the same 25 dice come back on every throw.

**Accessibility ships here, not later.** Every die carries a name that states its face, its worth
and its state. Shape carries the same three facts to the eye. The status line is the live region and
it now names the result. The short shake becomes a cut under `prefers-reduced-motion`.

### The four acceptances, each with its denominator

1. **The push button is live below the limit and dead at it.** The limit is read off the profile
   record, not restated: `maxPushes` is 1 on the first preset, and `previewPush` reports
   `pushesSoFar=0` before the press. The button is asserted live, then pressed, then asserted dead,
   and the cost row names the limit.
2. **The push button is live with no stress bane showing and dead under the blocker.** Both
   directions, over two fixtures that differ in one face. The core answers both: `previewPush`
   returns `available` for one and `refused` with `blocker=stressOneShowing` for the other.
3. **The thirty visits of section 6.** The list is parsed from `docs/design/0002-screen-design.md`,
   which states the same walk three ways and states its zone split twice more. Eleven checks run
   before the screen is asked anything: the numbered list is as long as the prose says, the Tab
   positions and the arrow positions partition 1 to 30, and the two zone counts sum to the pool the
   core built, 25. The fixture states which dice the document keeps and the screen decides the
   order.
4. **A push re-throws the loose dice alone.** The core is the oracle. The same profile and the same
   seed are given to the screen and to `push` outside it, and the whole pool is compared: 8 of 8
   faces equal the core's answer, the 4 dice the core did not re-throw kept their faces and their
   `data-el` names, and the throw zone before the press held the 4 ids the core named. The seed is
   chosen for the split and the reason is written beside it: seed 8 of the first thirty gives four
   dice against four, where the seed tried first gave one against seven and would have left the
   kept-face check a denominator of one.

### The four red-proofs

Each injection landed, each failure named the gate it broke, and each file was restored byte for
byte from a copy saved before the injection.

- `canPush` made to ignore `atPushLimit`. The failure read `at the limit the button is dead:
  expected false to be true`.
- `canPush` made to ignore `blocked`. The failure read `a stress bane stops the push: expected
  false to be true`.
- The throw zone drawn before the kept shelf. **This one first passed.** The arrow walk is a cycle,
  and a cycle is the same whichever zone comes first, so a rotation satisfied it. The check now
  reads the DOM order straight, and the same injection then failed naming `die-at2` where
  `die-at1` was wanted. A check that could not fail is recorded here rather than quietly repaired.
- `pushNow` made to throw every die itself instead of asking the core. The failure read `die-ge1
  kept its face across the push: expected 6 to be 1`.

### Two instruments again, and what the browser half can and cannot compare

`src/app.test.tsx` walks the screen under jsdom and compares name for name against the document,
over a fixture whose lock states reproduce the drawn split. `node scripts/browser.mjs --shell`
presses real keys in Firefox over the built output. It cannot compare name for name, because the
dice it throws decide which zone each die lands in. It compares what it can measure: 25 dice on the
table against the 25 names the document lists, the shelf and the zone summing to that number, the
shelf first, and the walked order against the order the DOM holds. Both halves assert the Tab and
arrow split.

**The browser walk needs a table the player may push**, because a dead button holds no tab stop and
the list holds thirty. Under the profile the application rolls, a stress die showing a bane stops
the push, and ten stress dice show one about five throws in six, so the run throws again until the
push is live and reports how many throws it took. Six runs took 1, 2, 4, 5, 8 and 16 throws of at most 40.
A run that never reaches a live push fails and names the limit.

Two harness faults were measured and fixed, both in the walk and neither in the application. The
sequential focus navigation starting point stays where the last focused element was, so the walk of
rest B started at the footer until the harness put it back at the top; `blur()` does not move it,
and the same call inside the throw evaluate did not hold. And Firefox hands the focus to its own
chrome after the last control while leaving `document.activeElement` where it was, so the walk
recorded that control twice until it learned to stop at a Tab that moves nothing.

### The stop the browser adds

Measured through the same run: at 360 by 660 with 25 dice on the table the walk reported one
implicit stop at `shell-mid`; at 360 by 760 and at 800 by 600 it reported none. The stop follows the
overflow and not the markup. Section 6 of the screen design now records it, so a later unit does not
remove the scroll to make the count come out.

### The screen, against the drawn render

Captured at 360 by 760, 768 by 1024 and 1440 by 900 from the running application and compared with
`0013-screen-final-roll-360x760.png`. The header, the two zone bands, the shelf, the zone, the die
size, the pips, the badges, the captions, the cost row, `Edit pool`, `More`, `Roll again` and `Push`
all match, and the caption state word appears at 1440 exactly as the drawn file draws it. Every
difference is the result on the table rather than a part of the screen:

- The drawn screen holds 13 kept dice and 12 loose. A live throw holds whatever it threw.
- The drawn screen holds a die kept by choice, drawn with a dashed frame. A throw nobody has clicked
  holds none, so only two of the three lock states are drawn.
- The drawn cost row reads a complication check. It appears only when a stress die shows a bane.

**One finding about the drawn screen itself, reported and not fixed.** Its state cannot occur under
the profile section 7 names for it. It draws four dice showing banes, two of them stress dice, and a
live `Push` beside them. The third preset stops every further push while a stress die shows a bane,
so that table would refuse the push it offers. The drawing is a drawing; the application follows the
profile record.

### Reported, not fixed

- **A push at the stress cap can put a 26th die on the tray.** The third preset raises stress by one
  before the re-throw and the core creates the die for it. Decision 1 caps the counter at 10 and the
  tray at 25. The counter is capped where it lives, in the application, and the added die is not
  refused, because refusing a push is a rule and the rule belongs to the profile record. Unit 4.2
  owns that record.
- **A die that changes zone under a click loses the focus**, because the cell is rebuilt inside the
  other zone. The roving index survives and the focus does not. Unit 3.5 has the focus half of its
  own row open and this belongs beside it.
- **The 3D table still mounts while the table is empty.** The route Unit 5.1 measures runs through
  it: `Roll` on an empty pool shows the table, the chunk loads, and the offline run reads it there.
  Unit 3.7 chooses between the two renderers, and until it does the flat dice draw every throw and
  the 3D mount point draws the empty table.
- The difficulty is applied at the throw and the preview sentence lives in the builder, so a
  collapsed builder shows no preview. The drawn screen does the same.
- No roll is logged. The log store is built and unread, and Unit 4.4 owns the write.

### How it was run

`npm run build`, then `node scripts/browser.mjs --shell --url http://localhost:4173/clatter/` with
the sandbox off, which passed 8 of 8 checks, and again with `--viewport 360x660` for the scroll
measurement, which passed 8 of 8. The renderer read `AMD Radeon RX 6700 XT`. `--shell` stays out of
`validate`, because it needs a browser.

## Unit 2.3 — Roll again, and deploy the slice

### What landed

Five checks prove the re-throw works correctly, and one comment block in `src/app.tsx` records the
difficulty settlement. No behaviour changed. `src/app.test.tsx` gained 303 lines of test code. The
five checks run under jsdom and under the browser harness, and both instruments report the same
outcome.

### The five checks, each red-proved

1. **The re-throw calls the core and the core is the oracle.** Injection: `applyDifficulty` dropped
   from `rollNow`. Failure: `the re-throw put the whole pool back on the table: expected 7 to be 9`.

2. **The re-throw is a new roll and not a continuation.** Generations back to one, counted as a
   denominator over every die. Injection: `rollNow` kept the old result. Failure:
   `the generation count is back at one: expected 2 to be 1`.

3. **The stress counter carries in over a case where a push raised it.** Injection: `rollNow` reset
   stress when a result exists. Failure:
   `the re-throw took the counter the push left: expected +0 to be 2`.

4. **The difficulty on `roll-button` after a throw.** Injection: the button printed 0 once
   collapsed. Failure:
   `the difficulty after the throw is the one the throw took: expected '5 dice, difficulty 0' to be '5 dice, difficulty +3'`.

5. **The control inventory holds at both rest states, 16 cells read out of the design.** Injection:
   the builder rendered in both states. Failure:
   `- "difficulty at rest B: false"` against `+ "difficulty at rest B: true"`.

### The keyboard walk

The keyboard walk reads 11 visits before the throw and 35 after it, in both the jsdom run and the
browser run. Both lists are read out of section 6 of `docs/design/0002-screen-design.md` and never
restated in the test.

### The difficulty is settled, from the design document

Section 3 of `docs/design/0002-screen-design.md` marks `difficulty` rest A only. The reason is
that the builder collapses on a roll and its read-only list separates "the difficulty preview line
inside the builder" from "the dice count and the difficulty printed on `roll-button`". Line 61
describes the builder control, not rest B.

Section 8 states the consequence: the throw that filled the table took the same difficulty. The
whole after-throw difficulty readout is the signed value on `roll-button`. What the last throw took
and what the next throw will take are one number, because no control of rest B can change it. A
change needs `Edit pool`, which returns the screen to rest A. Nothing conflicted and no code
changed.

### Reported, not fixed

**A re-throw does not replay the shake for a die that stays in its zone.** The Preact key is
`${id}:${values.length}` and both parts are identical on a first roll and on a re-throw, so the
element is reused and the CSS animation does not restart. A die that changes zone is rebuilt and
shakes. A throw ordinal in `AppState` would fix it. This is Unit 2.2 renderer behaviour and Unit
3.7 chooses the renderer.

**The design document line 286 is stale.** It reads "The authored counts stay eleven and thirty"
inside the browser-stop paragraph, while section 6 states and lists thirty-five. No check reads
that sentence, so both instruments pass. Unit 4.11 owns those lists.

**No roll is logged.** The log store is built and unread. Unit 4.4 owns the write.

### Validation and deploy

**Validation:** `npm run lint` 0, `npm run typecheck` 0, `npm test` 0 over 230 vitest tests and
20 node --test tests, `npm run build` 0. The branding gate reports `files_scanned=116` and
`hits=0`.

**Deploy:** PR #8 merged as commit `2a4d751` at 21:40:18 UTC on 2026-08-09. CI SUCCESS. Every URL
was read out of the returned HTML, not guessed. Six asset paths answered HTTP 200: the page itself
at 544 bytes, `assets/index-CITyIdqU.js` at 39,652 bytes, `assets/index-C2iXhYBQ.css` at 9,895
bytes, `manifest.webmanifest` at 425 bytes, `registerSW.js` at 150 bytes, and the lazy chunk
`assets/dice-tray-Cz13SOUC.js` at 596,587 bytes. The asset hashes match the build, so the live
page is this commit and not a stale one.

**Bundle:** Initial JavaScript 14,356 gzip bytes and lazy 3D chunk 151,876 gzip bytes, both
unchanged because the only source addition is a comment block. Point at `budgets.json` for the
ceilings rather than restating them.

## Unit 3.7 — the interface half

The engine half landed earlier and nothing of it is rebuilt here. This half is the call site: the
screen asks the decision, mounts one renderer or the other, records the fall, says so once, and
offers the way back.

### What landed

- **The choice, pure.** `src/shell/renderer.ts` names no browser API. `chooseRenderer` reads the
  probe answer and the settings record and answers a renderer, a cause and the readings below the
  bar. `startRenderer`, `withDecision`, `fallToFlat` and `askForTray` are the four changes over that
  record, and every one of them is a function of the state before it.
- **The call site.** `src/app.tsx` runs the probe once, in one effect, and draws flat dice until it
  answers. A fall nothing measured is never recorded, so the opening state writes nothing. The
  screen is the only place that reads the store and writes it, so the choice stays pure and a test
  hands over a store, a probe answer and a mount of its own.
- **The table mounts only where the probe clears the bar.** The dynamic import is behind that
  guard, so a browser below the bar fetches no part of the 3D chunk at all.
- **Context loss is wired.** `mountTray` is given `onFallToFlat`, which is the same call the mount
  failure takes. The engine half built the watcher and this half connects it to the store.
- **The notice, once.** `flat-fallback-note` is in the document from the first paint with no text,
  so a reader is already watching the region when it fills. CSS hides an empty one, so the drawn
  screen is unchanged while the table runs. It holds no tab stop and section 3 lists it under the
  read-only parts.
- **The way back.** `sheet-tray-renderer` on the disclosure sheet, with a note that names the cause
  every time.
- **The shake.** `AppState` gains `throwOrdinal` and the die cell is keyed by it.

### Three decisions, each with its reason

**The platform is read before the record.** Both can hold at once, because a probe below the bar
records the fall as well. The platform limit is the useful answer of the two: it is the one the
toggle cannot clear, so the sheet can say why the control is dead and name every reading that
failed.

**"Says so once" is tied to the fall and not to the state.** A session that opens on a recorded
fall says nothing, because the player was told in the session that fell. A second lost context
writes nothing and says nothing, because the record already holds the fall. A fall the player asked
for through the toggle is not announced back.

**The notice is not a control.** It takes no press and holds no tab stop, so the eleven visits
before the throw and the thirty-five after it are unchanged. Both instruments still read those
lists out of section 6 and both still walk them.

### The counted denominators

| Check | Denominator |
|---|---|
| The choice table | 8 cases, a cross product of 4 probe answers and 2 stored records. The count is asserted against the product and against the length of the answer table beside it. |
| Causes reached | The set of causes the 8 cases produce holds all three plus the tray itself. A cause no case reaches fails. |
| Words for the readings | The keys of `FALL_REASON_TEXT` are asserted equal to `FALL_REASONS`, so a reading added to the probe cannot reach the screen with no words. |
| Sheet notes | 4 states, 4 distinct sentences, both counts asserted. |
| The shake, under jsdom | Every die that stayed in the zone it was in, counted, with a floor above zero. A re-throw that moved every die would prove nothing about the key. |
| The shake, in the browser | Every die on the table, twice. The first re-throw proves the instrument answers before the second one is judged. |
| The dice on the table | The 30 names section 6 lists, with the shelf and the zone summing to that number. |
| The keyboard walk | The 35 names of section 6, read out of the document. |
| The kept dice | The count the screen put on the shelf, with a floor above zero. |
| Every die answers a press | The pool size. The pressed count and the refused count sum to it and both carry a floor above zero. |

### The acceptance, measured

`node scripts/browser.mjs --blocked-chunk --url http://localhost:4173/clatter/`, on the graphics
card with the sandbox off, exits 0 at `checks=11 failures=0 skipped=0`:

```
browser: blocked-chunk before registrations=1 caches=1 entries=8 after registrations=0 caches=0
browser: blocked-chunk decision=true renderer=flat canvases=0 chunk_requests=1 refused_aborts=0
  chunk_entries=1 chunk_bytes=0 caches=0 controller=null stored_flat_fallback=true
browser: blocked-chunk built_clicks=32 throws=4 dice=30 kept=7 loose=23 push_disabled=false
browser: blocked-chunk push kept=7 kept_same=7 loose=23 loose_moved=20 dice_after=31
browser: blocked-chunk re-throw 1 shook 30 of 30 dice
browser: blocked-chunk re-throw 2 shook 30 of 30 dice
browser: blocked-chunk press pool=30 toggled=28 refused=2
```

**Two stores can answer a request the network refused, and both are closed by measurement.** Unit
5.1 precaches the chunk, so the run unregisters the worker and deletes Cache Storage and reads both
counts before and after. Firefox refuses `request.abort()` once the worker owns the request, so
every refused abort is counted and one refusal fails the run. The worker and its registration
script are blocked with the chunk, so no worker can install again mid-run.

**The proof that the chunk did not arrive is positive on both sides.** The screen decided the table
could run and asked for the chunk once, which is what proves this run exercised the fall rather
than a screen that never asked. The chunk's resource timing entry carries 0 encoded bytes, the page
holds 0 canvases, and the screen reads `renderer=flat`.

### The skip, named

`blocked-chunk.the-chunk-was-refused` prints `NOT JUDGED` where the startup probe answers below the
bar, because the screen then draws flat dice from the first paint and never asks for the chunk.
Measured by turning WebGL off in the driver preferences and running again: `decision=false`,
`chunk_requests=0`, the notice reads `This browser cannot draw the table. The dice are flat now.`,
the stored flag is true, and the run exits 0 at `checks=11 failures=0 skipped=1`. Every other
check held, so the acceptance still ran on that machine. The preference was restored by editing it
back and the file hash matches the saved copy.

The harness itself always runs outside the sandbox, because the owner excluded
`node scripts/browser.mjs*`, so the sandbox cannot produce that reading on this host.

### Eight red-proofs

Each injection landed, each failure names the gate it broke, and each file was restored by editing
the injection back. No git command touched the bytes. The four source files and the driver were
copied outside the repository first and every restored hash matches its copy.

1. **The old key, back.** `${die.id}:${die.values.length}` in place of the ordinal.
   Under jsdom: `every die cell is rebuilt on a re-throw, so the shake plays again on all of them:
   expected [ 'die-at1', 'die-at2', …(5) ] to deeply equal []`. In the browser:
   `FAIL blocked-chunk.every-re-throw-shakes-every-die the first re-throw shook 30 of 30 dice, ...
   and the second shook 11 of 30`. **The two rounds are why this reads at all.** The first re-throw
   follows a push, where the re-rolled dice carry two values and the fresh roll carries one, so
   every key changes and the old code passes. Only the second re-throw is the one-to-one case.
2. **The player is not told.** `fallToFlat` left `noticed` false.
   `AssertionError: the player is told: expected false to be true`, and in the browser
   `the one it holds reads ""`.
3. **The stored fall ignored.** The `settings.flatFallback` branch removed from `chooseRenderer`.
   The table went red naming the case: `- "above the bar, a fall recorded: flat, recordedFall"`
   against `+ "above the bar, a fall recorded: tray, null"`.
4. **The mount guard dropped.** `!wanted` removed from the table effect.
   `and nothing of the 3D chunk is fetched: expected 1 to be +0`, twice: once before the probe
   answers and once below the bar.
5. **The block made a no-op.** The chunk pattern removed from the request interception. The chunk
   arrived and the tray mounted: `chunk_bytes=151876`, and four checks went red, among them
   `the table holds 1 canvas elements and the screen reads renderer=tray`. This is also the reading
   that shows the application does reach the 3D tray on this host when the chunk is served.
6. **The precache left in place.** The `caches.delete` loop removed.
   `0 registrations and 1 caches were left, 1 caches remain after the reload`.
7. **The push made a whole re-throw.** `pushNow` took a fresh roll in place of the core's answer.
   `1 of the 9 kept dice hold the face they held`.
8. **A press made a no-op.** `toggleDie` answered every id with the state it was given.
   `0 answered by changing aria-pressed and 6 refused ... [die-at2 did not answer the press:
   aria-pressed stayed false; ...]`.

### One check of another unit was moved, and why

`offline.the-lazy-3d-chunk-is-precached` counted the requests the application made through the
table. The application now asks for the chunk only where the probe clears the bar, so a browser
with no WebGL context would never ask and the check would report a missing graphics card as a
precache failure. That is the exact fault the mount check beside it was split out to avoid. The
check now asks for the chunk from the page and reads the bytes back, so the claim is about the
service worker alone: `status=200 bytes=596587`, with the application's own request count reported
beside it. The wait after the roll gained a third end for the same reason, because the table is now
sometimes never asked for at all.

**The offline mount check is judged for the first time.** It has been `SKIP` since Unit 5.1. On the
graphics card with the sandbox off, `--offline` reads `renderer=tray` and the tray mounts from the
precached chunk with the origin stopped: `checks=8 failures=0 skipped=0`.

### What is still open, and why

**The 3D tray draws no result yet.** The choice governs the table, and the flat dice draw every
throw in both paths. Three measured reasons, none of them inside this unit:

1. **The push cannot be acted out.** `pushPool` refuses a die the tray never spawned, and the
   shipped profile adds one stress die before every re-throw. Unit 3.4 recorded the follow-up:
   spawn the added die through `box.add` and rebuild the index map, because `add` appends to
   `diceList` while `trayOrder` sorts by face count.
2. **A 3D die has no DOM cell**, so the 35 visits of section 6, the accessible names and
   `aria-pressed` have nowhere to live. That is the open screen half of Unit 3.5.
3. **A sighted player could not click a 3D die.** The raycast route exists in the harness alone,
   also under Unit 3.5.

Making the 3D tray the result renderer before those land would ship a screen a keyboard cannot use
and a push the tray would refuse. The renderer choice, the fall, the notice, the toggle and the
acceptance are all built and proved, and this is the part that waits.

**Also open:** the `--hardware` phone reading of Unit 3.8 stays with the owner.

### Measurements

| Number | Value |
|---|---|
| New tests | 18, in `src/shell/renderer.test.ts` and `src/app.test.tsx` |
| Test total | 230 to 248 vitest tests over 27 files, plus 20 node tests, unchanged |
| Initial JavaScript | 14,356 to 16,355 gzip bytes. Budget in `budgets.json`. |
| Lazy 3D chunk | 151,876 gzip bytes, unchanged |
| Service worker | 5,958 to 5,975 gzip bytes over 2 files, reported with no budget |
| `npm run perf` | 203 steps against the recorded bound, scene digest unchanged, exit 0 |
| Branding gate | `files_scanned=118`, `binary_skipped=47`, `hits=0`, exit 0, `accounted=165` against an independent 165 |
| Harness | `--blocked-chunk` 11/0/0, `--shell` 8/0/0, `--offline` 8/0/0 |
| Validate | `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, all exit 0 |

## Unit 3.5 — the screen half, and the tray in the application

This unit is the main effort reaching the screen. Units 3.0 to 3.4 made the subset re-throw correct
on the table. Until now the flat dice drew every result in both renderers. They no longer do.

### What landed

- **The push defect is fixed.** `pushPool` spawns the dice a push added, through `box.add`, on the
  values the core decided. `TrayPush` is the narrow input the tray needs, and `PushedRoll` from the
  rules core satisfies it, so a caller hands the core's own answer straight over.
- **`src/shell/table.tsx`** is the call site. It mounts the tray, acts out each roll with
  `throwPool` and each push with `pushPool`, wires `mountAffordance`, and reads back where every die
  landed. It decides no rule and reads no random source.
- **`src/tray/spots.ts`** answers where each die sits on the screen, in CSS pixels.
- **`src/app.tsx`** draws one cell per die in both renderers. Over the table the cell draws nothing.
- **`mountAffordance` returns a handle** with `update` and `dispose`, so the screen stays the one
  authority on the pool and the tray's own copy is overwritten after every change.
- **`AppState` gains `lastThrow` and `stressAdded`.** A roll and a push are not the same throw and
  the dice alone cannot tell them apart, because a re-throw of the same pool carries the same ids.

### The decision, and where it is recorded

Decision 9 of `docs/design/0012-settled-decisions.md`, with its four reasons and its two measured
limits. Section 3 of `docs/design/0002-screen-design.md` now says what `dice-tray` holds in each
renderer, section 6 says the list holds in both and records the scroll stop the 3D table does not
earn, and section 7 names the marks and the skipped tumble.

### The defect the render found

A green suite did not prove the render was right, and this is the case that shows it.

The vendored library renders one last frame the instant a throw finishes and then stops, and it
renders nothing at all for a click. A mark added or moved after that frame therefore kept the world
matrix the renderer gave it on the frame before, so the player saw the marks of the previous throw
standing where the previous dice stood. Measured in the running application: up to 682 world units
from the die the mark named, against a die radius of 90.

**Neither of the two obvious probes can see it.** A raycast updates the world matrix of anything it
casts against, so a probe that raycasts repairs the fault it came to measure. A pixel read needs a
render in the same task, and that render repairs it too. Unit 3.5's `--affordance` mode did both,
which is why the tray half shipped with this defect and passed.

`table.the-lock-marks-are-drawn-on-the-dice-they-name` reads the world matrix itself, which is the
matrix the renderer last used, and asks whether the mark lies inside its own die's radius. The fix
is one line: `drawMarkers` draws the frame that shows the marks it just placed.

### The counted denominators

| Check | Denominator |
|---|---|
| Every up-face | The pool the screen names. `compared=30 of a pool of 30`, and again `31 of 31` after the push. Each face is read off the body quaternion and compared against the face the screen printed for that die, so the 3D layer is judged against the rules core and never against itself. |
| Every cell over its die | The same pool. The cell centre is compared against a centroid the harness projects from the camera matrices with its own 4x4 multiply, so the two routes are independent. |
| The key press | The pool size. The toggled count and the refused count sum to it and both carry a floor above zero. |
| The pointer route | The pool size. The reached count and the unreachable count sum to it, and the toggled and refused counts sum to the reached. |
| The die the push added | The screen's own answer. The tray must hold one body per die the screen names, and the added names must be the difference between the two pools. |
| The lock marks | The dice the screen keeps, at both throws. A mark for a die that is not kept, or a kept die with no mark, fails the count before any distance is read. |
| The keyboard walk | The 35 names of section 6, read out of the document, in both instruments. |

### The measurements

`node scripts/browser.mjs --table --hardware --url http://localhost:4173/clatter/ --viewport
1440x900`, on `AMD Radeon RX 6700 XT (radeonsi, navi22, ACO, DRM 3.64, 7.1.7-200.fc44.x86_64)` with
the sandbox off. There is no WebGL context inside the sandbox, and a run there prints every table
check as `NOT JUDGED` and counts them in `skipped=`.

```
browser: table renderer=tray canvases=1 throws=6 of at most 40 settled=true dice=30 kept=7
  loose=23 tray_bodies=30 acted_out=2
browser: table keys pool=30 toggled=23 refused=7
browser: table clicks pool=30 reached=30 unreachable=0 toggled=23 refused=7
browser: table push settled=true dice=31 tray_bodies=31 added=[die-st11] acted_out=3
browser: table marks after_throw=7 of 7 kept, after_push=13 of 13 kept, stray=0
browser: mode=hardware checks=9 failures=0 skipped=0
```

### Nine red-proofs

Each injection landed, each failure names the gate it broke, and each file was restored by editing
the injection back. No version-control command touched a byte. The six source files were copied
outside the repository first and every restored hash matches its copy.

1. **The added die is never spawned.** `addDice` removed from `pushPool`. Under jsdom:
   `the tray spawned the die the push added, on its own value: expected [] to deeply equal
   [ '1d6@5' ]`. In the browser: `FAIL table.the-push-put-the-die-it-added-on-the-table ... the
   tray holds 30 bodies for them ... wrong=1 [die-st11 reads null, the screen says 2]`.
2. **The tray is never asked to act the throw out.** Under jsdom: `the tray acted the throw out
   once: expected +0 to be 1`. In the browser: `FAIL table.the-3d-tray-draws-the-result ... It
   holds 0 bodies against the 30 dice the screen names`, with five more checks red beside it.
3. **The cells are placed away from the dice.** 20 px added in `dieSpots`. Under jsdom:
   `die-at1 lies over the die the tray put down: expected [ '120px', ... ]`. In the browser:
   `FAIL table.every-die-carries-a-cell-over-it ... off=30 [die-at1 sits 20.015 px away; ...]`.
4. **One die acts out a value the core did not decide.** `poolNotation` adds one to the first die:
   `FAIL table.up-face-equals-core-value compared=30 of a pool of 30 ... wrong=1 [die-at1 reads 3,
   the screen says 2]`. The other 29 still compared, so the denominator held while the check failed.
5. **No frame is drawn for the marks.** The render removed from `drawMarkers`:
   `FAIL table.the-lock-marks-are-drawn-on-the-dice-they-name ... stray=8 [die-at2 was drawn 682.3
   away; die-st3 was drawn 644.9 away; ...]`.
6. **A press answers with the state it was given.** `toggleDie` made a no-op:
   `FAIL table.every-die-answers-a-key-press 0 answered a real Enter ... faults=23 [die-at2 did not
   answer the press: aria-pressed stayed false; ...]`.
7. **The raycast route ignores the click.** The listener returns early:
   `FAIL table.every-die-is-accounted-for-by-the-pointer-route ... 0 toggled ... faults=29`. **The
   key press stayed green at 29 toggled**, so the two routes are proved separately.
8. **A cell over the table holds no tab stop**, which is the whole reason the cells are DOM. The
   walk reached 4 stops of 35: `expected [ 'edit-pool-button', ...(3) ] to deeply equal
   [ 'dice-tray', 'die-at2', ...(33) ]`.
9. **A push is always acted out as a whole throw.** `canActOutPush` forced false:
   `a push is not a fresh throw of the whole pool: expected 2 to be 1`.

### The probe constants, and which ones moved

**None of them.** The camera, the tray walls and the die size are untouched, so Unit 3.5's
48-direction shape probe and Unit 3.4's 1 px kept-die bound still measure what they measured.
`--affordance` reads the same numbers it recorded: `rule=48, choice=20, loose=0` of 48 directions,
`marks read=8 of 8`, `dimmest_reading=4.91`. `--push` reads `compared=4 of the 4 dice the rules core
reports as locked`, and `--tray` reads 841 draw calls, 842 triangles and 77 textures.

Two constants are new and both are derived rather than chosen.

- **The 1 px bound of `table.every-die-carries-a-cell-over-it`.** A browser lays out in CSS pixels
  and rounds, so anything under one pixel is layout noise. The defect it must catch is a cell over
  the wrong die, which is about 96 px. The bound is far narrower than the defect.
- **The 200 px floor under `.table`.** A die is a fixed size on the screen whatever the canvas is,
  because the library builds it at `baseScale` world units and the camera frames twice the element
  in world units. Measured in the running application: a die is 93 to 99 CSS pixels across, and the
  tray wall stands one `baseScale` inside the frame, which is 50 CSS pixels a side. An element
  shorter than one die plus two wall insets holds no die. Re-derive it from `baseScale` and the
  measured die if either one moves.

### The history matrix is no longer owed as a route

Unit 3.5's note said the keyboard route to a buried die runs through the history matrix of Unit 2.2.
**It does not any more.** Every die carries its own DOM cell in both renderers, the arrow keys reach
all of them, and a press on any of them keeps or releases the die. `--table` measures that directly:
30 of 30 dice answered a real Enter or refused it by rule, with none out of reach.

The history matrix is still owed as a **history view**. Decision 3 moved it into the history record
and transposed it, Unit 2.2d records the deferral and the two acceptances that travel with it, and
Unit 4.5 lands it. Nothing about accessibility waits on it.

### The captures, and what they show

`docs/design/0014-table-throw-1440.png` and `docs/design/0014-table-push-1440.png`, both at 1440 by
900 from the running application. **For the owner, not for the gate.**

The throw frame holds 30 dice spread across the table, all six type colours separable, every numeral
legible, and seven kept dice each inside a slate cage. The status line reads 8 successes, 2 banes,
30 dice, stress 10 and push 0, and `Push` prints 24 dice.

The push frame holds 31 dice. Every one of the seven caged dice sits in the same place at the same
angle with the same face, down to the shadow under it, and six more dice now carry cages of their
own. The loose dice are elsewhere. `Push` is dead and the cost row reads
`A stress die shows a bane. No push is left.`, which is the third preset refusing a further push. A
player reads the frame as: the successes stayed, the rest went back in the cup, and one more stress
die joined them.

**Reported, not fixed.** Where several kept dice land close together their cages overlap, and the
eye takes a moment to pair each cage with its die. A cage is a closed shape and is still its own
boundary, so no die is ambiguous. The mark sits at the die's own centre height while the face the
camera sees is the top of the die, so a cage near the edge of a wide table reads a few pixels away
from its die. Both belong to the affordance Unit 3.5 shipped and neither is a defect of this unit.

### Reported, not fixed

- **The dice heap, and no layout stops that.** The library builds a die at a fixed world size and
  throws every die from one place. Thirty dice of 96 pixels cover about 276,000 square pixels and a
  phone middle offers far less. The throw is not spread, because spreading it moves
  `steps_to_rest_fixed_seed_scene` and the pinned scene digest in `budgets.json`.
- **A buried die has no pointer route.** The run counts the dice the raycast can reach and the dice
  it cannot, and it fails unless the two sum to the pool. Every run so far read `unreachable=0`,
  because the click probe walks outwards over the die's own disc rather than aiming at its centre.
  The key press reaches every die whatever the heap does.
- **A throw the player outruns is dropped.** A press inside a throw replaces whatever was waiting,
  so the tray never falls more than one throw behind the screen. A push dropped that way is acted
  out as a whole throw of the table as it now stands, because a subset the tray cannot map back is
  not a subset it may guess at.
- **`window.__clatterTable` is a shipped seam.** A WebGL scene has no other route for an outside
  instrument, and the acceptance needs one: the up-faces are read off the physics bodies the
  application mounted. Nothing in the application reads the field and no check writes one.
- **The shell walk waits for the table.** `--shell` now waits for the tray to come to rest before it
  puts the sequential focus navigation starting point back. Without the wait the last render of a
  throw moved that point and the walk of rest B reached one stop of 35. The wait returns at once on
  flat dice.
- **The profile is read once, at the mount.** Unit 4.1 lets the player change the ruleset, and the
  affordance would need a remount for that. Nothing changes it today.

### Measurements

| Number | Value |
|---|---|
| New tests | 4, in `src/app.test.tsx` and `src/tray/throw.test.ts` |
| Test total | 248 to 252 vitest tests over 27 files, plus 20 node tests |
| Initial JavaScript | 16,355 to 18,944 gzip bytes. Budget in `budgets.json`. |
| Lazy 3D chunk | 151,876 gzip bytes, unchanged |
| Service worker | 5,974 gzip bytes over 2 files, reported with no budget |
| Render counters | 841 draw calls, 842 triangles, 77 textures. Unchanged, all three under the ceilings. |
| `npm run perf` | 203 steps over 5 runs, spread 0, scene digest unchanged, exit 0 |
| Harness | `--table` 9/0/0, `--shell` 8/0/0, `--blocked-chunk` 11/0/0, `--offline` 8/0/0, `--tray` 7/0/0, `--pool` 7/0/0, `--push` 7/0/0, `--affordance` 9/0/0, `--reduced-motion` 5/0/0 |
| Validate | `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, all exit 0 |

## Units 4.1 and 4.2 — the rules the player chooses

Two units, one surface. Unit 4.1's pure half and its `localStorage` binding were already built and
proved. This is the screen half of Unit 4.1 and the whole of Unit 4.2, and **Unit 4.1 is now
complete.**

### The decision the units had to settle

**Decision 10 of `docs/design/0012-settled-decisions.md`: a change of rules clears the roll on the
table and returns the screen to rest A.** The pool, the difficulty and the stress counter all stay.

The reason is the purpose of the application. The cost of a push is read **before** the player
commits to it, so a roll on the table was committed to at a price read under one profile. New rules
change that price, which dice the table keeps, and which dice a push would throw again.

Two alternatives were priced and rejected, and the record names both. Pricing the roll again moves a
die from the kept shelf to the throw zone under the player's hand and prints a price for a roll
nobody threw at that price. Keeping the old profile alive for the roll on the table runs two rule
sets at once, so the sheet states one and the table obeys the other, and every reader of a profile —
the cost row, the two zones, the marks on the 3D dice, the log entry a roll will write — has to know
which of the two it holds. One screen, one rule set.

The precedent is in the rules model, which already discards the built pool on a change of mode. This
is the smaller version of the same rule. The screen returns to rest A because section 1 names two
rest states and a collapsed builder over an empty table is neither.

### How the tray remounts

Unit 3.5 recorded the limit: `mountAffordance` reads the profile once, at the mount, because it
answers every click and draws every mark from it. `src/shell/table.tsx` now disposes the affordance
and mounts it again under the profile in force, keyed on the profile itself. The canvas, the scene,
the physics world and the dice bodies all stay, so nothing of the 3D chunk is fetched again and no
context is lost. The table is cleared by the same change, so the new affordance opens over an empty
pool and no mark of the old rules survives it.

The check is an effect and not a call count: the fake tray is asked how many lock marks stand in its
scene after a fresh roll under the new preset, and that count must equal the count the rules core
reports as locked. Removing the remount leaves 0 marks where the core says 3.

### The panel, and the trap it had to avoid

**A panel generated from a record can still miss a field.** The rows are compared against a walk of
the record written in the checking file, path for path, in two instruments. The record holds 16
leaves under 9 top-level keys, which is the count Unit 4.4's profile hash already asserts: 3
read-only, 7 toggles, 2 numbers, 3 choices and 1 set.

Two rules decide the panel, and both come from the record rather than from a list of field names.
The editor follows the run-time type of the value the preset holds. A text value belongs to a
published domain or it is not editable at all — the identifier, the name and the description belong
to no domain, so the identity of a profile is read-only by rule. That same rule refuses an identity
override arriving from storage, so there is one rule and not two.

The domains are the rules core's own lists, built there from total records, and the panel asserts
that no two of them hold the same value by counting their members against the size of their union.
A value therefore names one domain, which is what lets a leaf find its own control.

### The effects, with the core as the oracle

| The claim | How it is measured |
|---|---|
| A change of preset changes which dice the rules keep | The kept shelf on the screen equals `isLocked` under the profile in force, over a stub source that answers a bane on every die. The two presets keep 0 dice and 3 dice of the same roll. |
| A change of curve changes what a die is worth | The status line equals `successCount(result, curve)` for each curve, over two d12 artifact dice showing 8. |
| An override changes what the rules allow | The preset allows one push and the core refuses the second. The override raises the limit and the core allows it. |
| The reset returns the preset | Every editable leaf is changed at once, and the merged profile then equals the preset again, compared as a whole record. |
| A change of rules never re-prices a roll | The table holds the roll, then holds nothing, and the live region names the next throw again rather than a table. |

### Twelve red-proofs

Each injection landed, each failure names the gate it broke, and every file was restored by copying
back a copy saved outside the repository. No version-control command touched a byte, and every
restored file's SHA-256 matches its copy.

1. **The panel skips one field.** `blockers` filtered out of `profileFields`: `the panel and the
   record name different leaves: expected [ 'id', ... ] (12) to strictly equal (13)`, and the
   editable count fell from 13 to 12 in a second check.
2. **The identity becomes overridable.** The text rule removed from `normaliseOverride`:
   `override-id: a control changed the identity: expected { id: 'a name of my own' } to strictly
   equal {}`.
3. **The chosen preset never reaches the rules.** `profileId` dropped from `withPreset`: `the screen
   now follows the core under the chosen preset: expected [] to deeply equal [ 'die-at1', 'die-at2',
   'die-at3' ]`.
4. **The roll is priced again under new rules.** The clearing removed from `withRules`: `the table is
   cleared: expected 5 to be +0` under jsdom, and in the browser `FAIL
   sheet.a-change-of-rules-clears-the-table ... it holds 3 after the rule set changed`.
5. **The artifact curve never reaches the score.** The curve dropped from `readout`: `the flat curve
   reached the core: expected '...4 successes...' to contain '2 success'`.
6. **The override never reaches the profile in force.** `mergeProfile` dropped from `profileOf`: `the
   core allows a second push under the raised limit: expected true to be false`.
7. **The reset keeps the override.** `withoutOverride` made a no-op: `the reset takes every mark
   away: expected 1 to be +0`.
8. **The stored rule set is ignored when the screen opens.** `stateFromSettings` made to keep the
   opening id: `the rule set: expected false to be true`.
9. **Nothing is written at all.** The settings effect made a no-op, in the browser: `FAIL
   sheet.every-choice-survives-a-reload ... The record crossed the reload as 0 bytes`.
10. **The tray keeps the profile it mounted under.** The remount key pinned to a constant: `the tray
    marks the dice the new rules keep: expected +0 to be 3`.
11. **The two artifact curves stop agreeing about a lock.** The flat curve's first threshold moved
    from 6 to 8: `a d8 showing 6 is a success on one curve and not on the other: expected true to be
    false`.
12. **A control loses the label that is its hit target and its name.** The `label` around the toggle
    replaced by a `span`, in the browser: `FAIL sheet.every-control-carries-a-role-a-name-and-a-state
    ... 7 of them without an accessible name` and `FAIL sheet.the-panel-is-usable-at-360-px ... 7
    under the 24 px floor ... the shortest one measures 14 px`. A thirteenth injection was tried
    first and is recorded below, because it did not land.

**An injection that did not land, and why it is recorded.** Shrinking `min-height` on the choice rows
from 44 px to 20 px left `under_floor=0`, because the natural line box of the label is already over
the floor. The check was not blind: the target it measures is the label a press lands on, and the
defect it must catch is a control with no label at all. The injection above is that defect, and it
went red. A run that had stopped at the first injection would have recorded a check that cannot fail.

### What the captures show

`docs/design/0015-sheet-top-360.png`, `0015-sheet-overrides-360.png`, `0015-sheet-top-1440.png` and
`0015-sheet-overrides-1440.png`, from the running application. **For the owner, not for the gate.**

At 360 px the sheet fills the screen and scrolls. The rule-set picker holds four radio buttons, each
on its own 44 px row, with the description of the chosen preset under them. The panel opens with the
three identity rows, drawn as read-only text, and every editable row below them stacks its label over
its control, so nothing is squeezed side by side. A changed row carries a shaded ground and the word
CHANGED beside it, so the mark is never colour alone. The reset button sits at the end of the panel
and reads as a button rather than as another row. At 1440 px the same rows put the label and the
control side by side and the whole panel is in view at once.

**Reported, not fixed.** The push limit of the third preset is `Number.MAX_SAFE_INTEGER`, so its
number field prints sixteen digits. It is honest and it fits, because the field scrolls, but a player
reading it learns nothing except that there is no limit. A word for "no limit" belongs to the panel's
own vocabulary and is a change to the record's meaning, not to its shape.

### Where each claim is judged, and why

The browser mode judges what only a browser can: the roles, the names and the states, the clearing of
the table, a real reload through the page's own `localStorage`, and the layout at 360 px. **It does
not judge whether a setting reaches the rules core**, because the built bundle exposes no rules
module and a check there could only compare against an expectation written by hand. That claim is
asserted under jsdom, where the core itself answers.

### Measurements

| Number | Value |
|---|---|
| New tests | 20: 11 in `src/settings/profile-fields.test.ts`, 7 in `src/app.test.tsx`, 1 in `src/rules/success.test.ts`, 1 more migration test path |
| Test total | 252 to 272 vitest tests over 28 files, plus 20 node tests |
| Migration cases | 32 exercised, against an enumeration of 32 |
| Panel rows | 16 leaves under 9 top-level keys, counted a second way in two instruments |
| Initial JavaScript | 18,944 to 21,152 gzip bytes. Budget in `budgets.json`. |
| Lazy 3D chunk | 151,876 gzip bytes, unchanged |
| `npm run perf` | 203 steps over 5 runs, spread 0, scene digest unchanged, exit 0 |
| Harness | `--sheet` 7/0/0, `--shell` 8/0/0, `--table` 9/0/0, `--blocked-chunk` 11/0/0, `--settings-store` 6/0/0 |
| Branding gate | `files_scanned=120`, `binary_skipped=49`, `hits=0`, exit 0 |
| Validate | `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, all exit 0 |

### Open

- **Unit 4.2 is complete.** Nothing of it is deferred.
- Unit 4.1 is complete. The stress reset, the mode switch and the renderer toggle already sat on the
  same sheet, and the theme picker of Unit 4.8 and the history of Units 4.4 to 4.7 are still owed
  there by their own units.

## Unit 4.3 — the saved pools on the screen

The storage half was already built and proved. This is the list on the screen, and **Unit 4.3 is now
complete.** No second store was built, no fifth operation was added, and the four operations and the
four refusals are the ones the store already answered.

### The decision the unit had to settle first

Section 4 of `docs/design/0002-screen-design.md` listed no pool preset list, and section 3 spends
five of its eight controls at each rest state, so a tenth control in the builder was affordable by
the budget alone. **The budget was not the deciding reason.** Decision 11 of
`docs/design/0012-settled-decisions.md` records the three that were.

1. **A recall writes over every tile of the built pool.** That is the hazard `sheet-mode` sits
   behind the disclosure for, and the paragraph under the section 4 table already states the rule: a
   control that destroys the built pool must not sit one tap from the throw.
2. **The drawn screen is the owner's.** `docs/design/0013-screen-final.html` is what the owner
   approved at Unit 2.0, and `src/shell/drawn-screen.test.ts` holds every later unit against it. A
   control in the builder would change the drawn builder pane, the rest A walk of section 6, and the
   counts both instruments read out of that section.
3. **Saving is rare and building is constant.** The builder is the tightest part of the screen at
   360 px, where it already holds two columns and scrolls.

**What the decision costs, measured rather than claimed.** Section 3 is untouched: five controls at
rest A and five at rest B against a ceiling of eight. The inventory check still reads the eight rows
out of the document and answers them control by control at both rest states. A second check reads
both rest states for any element of the panel and finds none, so the claim is a measurement and not
a sentence. Section 6 still reads eleven visits before the throw and thirty-five after it, in jsdom
and in Firefox, with both lists read out of the design document.

### The recall, and why the table stays

A recall opens the builder and closes the sheet, because the player has to see the pool that
arrived, and the status line is a live region that names the new throw.

**A recall does not clear the table.** Decision 10 clears the table on a change of rules, because a
roll was committed to at a price the rules set. A pool is not a rule: it decides what the next throw
takes and prices no roll already thrown. This is the rule the pool tiles already obey, where a press
on a tile over an open builder leaves the dice where they lie.

### A stored pool the six tiles cannot hold

Two stored pools cannot be drawn: a count above the cap of its tile, and an artifact list that is
not a rung of `ARTIFACT_LADDER`. Neither is writable through the interface, because every tile stops
at its own cap and the artifact tile steps the ladder. Both are writable by hand into the browser's
storage, and the migration keeps them, because it validates a pool against the rules core rather
than against this screen.

**Such a pool is refused and the panel says why.** Clamping a count or picking the nearest rung
would put a pool in the builder that the player never saved and could not see the difference from.
No fifth refusal was added to the store for it: the refusal is a message of the screen, and
`tilesFor` in `src/shell/state.ts` is the one place that answers whether the tiles can hold a pool.

### Step mode draws no control

A saved pool holds counts. Step mode holds two rated die sizes plus the extras, and the storage half
saves no step pool. A panel that saved the counts in step mode would save a pool the screen was not
showing, because the attribute and skill tiles carry sizes there and the counts behind them stand
where pool mode left them. The panel draws one sentence and no control.

### The traps this unit had to walk past

**A cap proved in storage is not a cap proved on the screen.** Nothing in the panel is disabled to
prevent a refusal. A disabled control names nothing, and it would put both caps out of reach of the
interface, which is where they now have to be proved. So the save control presses at the preset
limit and the name field takes a name over the cap, and both refusals are reached by hand: 60 emoji
save and 61 are refused, and the twenty-first preset is refused while a replacement under a name the
list already holds is still let through. The emoji case runs through the interface in both
instruments, because the cap counts code points.

**A check that reads the text alone passes while the markup is parsed.** The text of a parsed
`<b>bold</b>` still reads `bold`, so the name checks assert the drawn characters against the stored
characters AND that the name element holds one node and no element, and that the panel holds no
element the markup could have made. Both halves were proved red on their own: the parsed name failed
the character comparison, and an element added beside an unparsed name failed the element count.

**The fourth refusal needed a real route.** `noSuchPreset` cannot be reached by pressing a row that
is drawn, so the interface would have had no route to it at all. The route is the one a player takes
by accident: two presses on Delete before the list can be drawn again. Every operation therefore
reads the stored record out of the ref beside the renderer state rather than out of the render that
drew the row, so the second press reads the list the first press changed. Reading the render would
have deleted a second preset or done nothing, and neither would have told the player anything.

**A batched framework is not a player.** The browser harness first drove the field and the save
control inside one task, and every save used the name the field held before it. A player cannot type
and press inside one task. The harness now settles the screen between the two, and the comment says
why, because a script that drives one task drives a screen no player meets.

### What the injections found, and it was not always the code

Thirteen injections were proved red and every one was restored by editing the injection back. Two of
them found a check that could not fail, and the check was strengthened rather than the injection
softened.

- **A missing accessible name passed.** Removing `aria-label` from a delete control left the visible
  word `Delete`, which is a name, so the check passed while four rows all read `Delete` and a reader
  could not tell them apart. The check now asserts that a control inside a row holds the name of the
  pool it acts on, and that no two controls in the panel share a name.
- **A disabled save control passed.** Disabling the save at the preset limit left the note of the
  press before it standing, so four different sentences read as four refusals when one of them was a
  success. The browser check now reads what a save that went through prints and refuses to count any
  refusal that matches it.

A third injection landed on a guard that already covered it: an artifact rating of `-1` was caught by
the bound check below it rather than by the rung lookup, so the injection was replaced with the
defect the code comment warns about, which is clamping the rating to the nearest rung.

### The instruments

| The claim | The instrument |
|---|---|
| A recalled pool reaches the rules core | `src/app.test.tsx`, comparing every face against `firstRoll` over the stored pool |
| A recalled pool reaches the builder and crosses a reload | `node scripts/browser.mjs --sheet`, over the tiles and a real page reload |
| The reorder is observable | Both, over three presets, and by a real Enter press in the browser |
| The name is text and never markup | Both, by the drawn characters and by the element count |
| Every refusal names its cause | `src/app.test.tsx`, against the union read from the source of the store |
| Every refusal is reachable through the interface | `node scripts/browser.mjs --sheet`, by four real routes |
| The list is operable by keyboard alone | `node scripts/browser.mjs --sheet`, by real Tab and Enter presses at 360 px |
| The control budget of section 3 is untouched | `src/app.test.tsx`, by reading both rest states for any part of the panel |
| Both keyboard walks are unchanged | `src/app.test.tsx` and `node scripts/browser.mjs --shell` |

### The numbers

| Number | Value |
|---|---|
| New tests | 7 in `src/app.test.tsx`, and 4 new checks in `node scripts/browser.mjs --sheet` |
| Test total | 272 to 279 vitest tests over 28 files, plus 21 node tests |
| Injections proved red | 13, every one restored by editing the injection back |
| Controls at rest | 5 at rest A and 5 at rest B, against the ceiling of 8 in section 3 |
| Keyboard walks | 11 visits before the throw and 35 after it, unchanged, in both instruments |
| Initial JavaScript | 21,152 to 22,532 gzip bytes. Budget in `budgets.json`. |
| Lazy 3D chunk | 151,876 gzip bytes, unchanged |
| `npm run perf` | 203 steps over 5 runs, spread 0, scene digest unchanged, exit 0 |
| Harness | `--sheet` 11/0/0, `--shell` 8/0/0, `--table` 9/0/0, `--blocked-chunk` 11/0/0 |
| Captures | `docs/design/0015-sheet-presets-360.png` and `-1440.png`, looked at before this row was written |
| Branding gate | `files_scanned=124`, `binary_skipped=55`, `hits=0`, exit 0 |
| Validate | `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, all exit 0 |

### Open

- **Unit 4.3 is complete.** Nothing of it is deferred.
- The panel writes no step pool, and that is a decision with its reason recorded, not a deferral.

## Unit 4.8 — the open half: the picker, the builder's controls, and a stylesheet that spends a palette

### What landed

`sheet-theme` draws three groups of six rows plus the colour builder, `src/theme/css-vars.ts` says
which palette token fills which role, and `src/shell.css` holds no colour of its own. Decision 15 of
`docs/design/0012-settled-decisions.md` records every choice below, and section 7 of
`docs/design/0002-screen-design.md` carries the one amendment.

### The trap this unit was written against, and where it landed

**A palette that resolves is not a palette that is spent.** Every claim about the screen is measured
off a rendered element in the driven browser, and nothing in the theme mode reads `resolveTheme`.
The page colour comes off `.screen`, the tray surface off the element the tray mounts into, a flat
die body off the die, and a 3D die body off the material through the seam.

**Changing which token fills which role is how a proved palette fails.** The first draft of
`css-vars.test.ts` read `PALETTE_ROLES` out of the module and then asserted the module against it.
Two roles were swapped inside `PALETTE_ROLES` and every check stayed green. The map is now written
out again in the check, and the same injection goes red at
`ember: --ink takes text: expected '#C1ACA6' to be '#F7E4DE'`.

### A check that could not fail, and the control that gave it a route

`checkDiceTheme` judges three things: the ladder step, the black numeral, and the die against the
tray. A dice set the builder derives places every rung at a fixed CIE L*, so all three hold whatever
colour arrived and the checker can never report anything about a set the builder made. The claim
that its findings reach the player therefore had no route to be proved on.

`deriveDiceTheme` gains `exact`, behind `theme-exact-dice`. Off, the six dice are derived around the
chosen colour and are readable by construction. On, that colour itself goes on the rung nearest its
own lightness, and the checker reports whatever that costs. It is the same promise `derivePalette`
has always made for the accent, and it is what makes the dice half of the report a live claim: the
browser run reads 5 findings from `checkPalette` and 2 from `checkDiceTheme`, and the screen names
all 7.

### The four tokens the palette grew, and why each one is a literal

The stylesheet paints four grounds and two semantic marks. The data half named neither, so
`sunken`, `line`, `markSuccess` and `markBane` are new literals in all six rows. Nothing derives
them: the values were computed once with `withLightness` and written into the rows, so a seventh
preset is still a seventh row.

**`line` is the load-bearing one.** A button, a pool tile and a text field are each told from the
page by their boundary rather than by their ground, so the boundary answers WCAG 2.2 SC 1.4.11 at
3 to 1 against all three grounds. That is a heavier edge than the drawn screen carried, and it is
the price of the claim rather than a taste. The bone row needed its `line` at CIE L* 50 rather than
52, because 52 read 2.81 to 1 against its own `sunken`.

**The two marks do not follow the theme.** Five dark rows carry one green and one warm colour at
L* 70, and the light row carries the same two at L* 38. A success is green and a bane is warm in
every palette, so the meaning does not move when the page does, and shape carries it anyway.

### The three literals the stylesheet keeps, and why they are not palette colours

`rgb(0 0 0 / 14%)` under a loose die, `rgb(0 0 0 / 10%)` inside a die on a pad, and
`rgb(0 0 0 / 55%)` behind the disclosure sheet. A shadow is the absence of light rather than a
colour of the theme, and a scrim has to darken every palette, including the light one. The check
does not trust the list: it enumerates what the file holds, compares it against those three, and
then measures each one to be black and translucent, so a fourth literal cannot join by being
written into the table.

Three colours the drawn screen held were replaced rather than excused: the empty-tile digit and the
centre notch of the difficulty track now take roles, and the badge number takes `--mark-ink`. The
5 per cent accent tint on the throw zone was removed, because it was the one derived colour left in
the file and the dashed accent border already names the zone.

### The flat dice take the dice axis, and the stress die loses its material

Every flat die takes the body colour of its own type, which is what the 3D die has always done. The
drawn screen gave the stress dice a material of their own because every die was one neutral body
then. The six types are a lightness ladder, no two rungs closer than 8 CIE L*, so a greyscale copy
still separates them.

### Where the readout over the tray is measured, and where it is not

`--on-tray` is spent twice: on the two zone bands over the 3D table, and on `table-note`, the one
line drawn on the flat table. The browser probe measures it through `table-note`, because that
element is a child of the element the tray surface paints. Over the 3D table the bands lie on the
canvas, which is a SIBLING and not an ancestor, so an ancestor walk would measure them against the
page and report a ratio that means nothing. The first run did exactly that and reported
`bone: a zone band reads 1.03 to 1`. The claim itself is proved over all 36 combinations in
`theme.test.ts` and again in `css-vars.test.ts`.

### The seventeen red-proofs

Nine over the test runner:

1. a hex in a rule — `every colour literal left in src/shell.css: expected [ '#ff0000', … ]`
2. `color: white` — `a colour keyword is a colour this file holds: expected [ 'white in "white"' ]`
3. a role nothing spends — `these roles are written and nothing paints with them: expected [ '--mark-ink' ]`
4. two roles swapped — `ember: --ink takes text: expected '#C1ACA6' to be '#F7E4DE'`
5. an axis reading another axis — `the dice axis reads the ember row`
6. a built theme ignored — `the built theme is the one on the screen: expected false to be true`
7. a palette literal darkened — `ash: --ink-dim over --surface reads 1.48 to 1`
8. a readout darkened — `verdigris: a readout on the ember tray reads 1.08 to 1`
9. a role read from nowhere — `these roles are written and nothing paints with them: expected [ '--tray-surface' ]`

Four over the panel, in jsdom:

10. `checkDiceTheme` dropped — `the report names the numeral on a stress die`
11. `checkPalette` dropped — `the theme really does miss its floors: expected 0 to be greater than 0`
12. the refusal removed — the report read `This theme is on the screen now.` for a failing theme
13. `aria-hidden` off a swatch — `a swatch is decoration … expected +0 to be 18`

Eight over the driven browser, each one rebuilt and re-run:

14. `--surface` repointed — `6 disagreed with the row: [ember drew rgb(29, 23, 20) against rgb(38, 30, 27); …]`
15. `--tray-surface` repointed — `6 disagreed: [ember drew rgb(38, 30, 27) against rgb(62, 24, 16); …]`
16. one body colour for every type — `12 disagreed: [ember attribute drew rgb(251, 128, 86) …]`
17. `paintPool` removed — `15 disagreed with the row [ember attribute is #EFEFEA; …]`
18. a palette literal darkened — `4 missed a floor [verdigris: a quiet reading reads 1.30 to 1 …]`
19. the picker's name removed — `2 of them without an accessible name [color, color]`
20. `checkDiceTheme` dropped from the panel — `the report … names 5 of them by name. Unsaid: [the numeral on a stress die; a stress die on the #23262B tray]`
21. the settings write replaced by a state-only write — `it drew rgb(24, 33, 32) after a real reload … The record crossed the reload as nothing`

Each injection was confirmed to have landed before the run, and every file was restored by editing
the injection back rather than by a command that discards the working tree.

### The captures, and what they show

Six at 1440 px, one per interface palette, each with a pool on the table:
`0019-theme-ember-1440.png`, `-ash-`, `-verdigris-`, `-bone-`, `-void-` and `-cobalt-`. The six
files differ in size, which the first run did not: that run captured the same image six times,
because it ended on a reloaded page still carrying a built theme and the rows then changed nothing.
A capture that cannot differ proves nothing, so the built theme is cleared first and a pool is
thrown before the frames.

The panel and the builder are captured at 360 px and 1440 px: `0019-theme-panel-360.png`,
`0019-theme-panel-1440.png`, `0019-theme-builder-360.png` and `0019-theme-builder-1440.png`.

Every image was looked at. The six palettes each read as themselves, the light row included: the
bone page is warm and light with dark ink and a dark olive filled button, and the five dark rows
each carry one hue with the dice standing off the ground. The panel holds two columns of rows at
360 px and three at 1440 px, and the builder fits both.

### Reported, not fixed

**`node scripts/browser.mjs --table` fails on some throw seeds, and it is not this unit's.** The run
at seed 2107814439 reported `die-at2 did not answer the click: aria-pressed stayed false`. The same
seed was replayed on `main` in a separate worktree and it failed the same way. Three other seeds
passed on this branch. The failure is a die the raycast proves is on top and a real pointer click
misses, which is the hazard Decision 9 already records.

### Measurements

- Four validate commands, all exit 0.
- `node scripts/browser.mjs --theme` — `checks=10 failures=0 skipped=0`.
- `--shell` 8 checks, `--sheet` 11, `--history` 21, `--blocked-chunk` 11, all `failures=0 skipped=0`.
- `--tray` — the three render counters at 841, 842 and 77 against 968, 969 and 89.
- `npm run perf` — `steps_to_rest_fixed_seed_scene measured=203 budget=224`, scene digest matched.
- Initial JavaScript 37,631 gzip bytes and the lazy 3D chunk 151,876. Both under the budget.
- Branding gate `files_scanned=136`, `hits=0`, exit 0.

## Unit 4.9 — the open half: the summary, the download and the share target

### What landed

`sheet-share` behind the one disclosure, a card drawn over the captured frame in the interface
palette, an anchor download over the same bytes, and the browser's own share target where the
browser offers one. Decision 16 of `docs/design/0012-settled-decisions.md` records every choice, and
section 4 of `docs/design/0002-screen-design.md` lists the control.

### The trap this unit was written against, and the one that caught it anyway

**A composition drawn after the copy is the black-frame defect wearing a card.** The overlay runs
inside `captureTrayJpeg`, between the copy of the frame and the encode, so nothing can slip into a
later task. `captureTrayJpeg` stays synchronous, and it now refuses an overlay that is an async
function, because such an overlay would draw after the browser had cleared the canvas.

**And the composition broke the two acceptance measures the plan wrote.** A panel of text carries
luminance variance and thousands of distinct pixel values entirely by itself. Measured over the
whole card, the black-frame red-proof reads variance 253.03 and 2,810 distinct values — both clear
of their floors — on a card whose photograph is one flat rectangle. The measures now run over the
photograph, with the panel taken out by the box the layout names, and the two pixel counts are added
back up against the size of the card so no region can be dropped or counted twice. The same
red-proof then reads 0.00 and 59.

    browser: share frame whole_pixels=1296000 whole_variance=253.03 whole_distinct=2810
             photograph_pixels=1123800 mean_luma=37.72 luma_variance=0.00 distinct_values=59
    browser: FAIL share.luminance-variance-above-the-floor variance=0.00 ...
    browser: FAIL share.distinct-pixel-values distinct=59 ...

### The defect only the picture found

The first draft put the successes and the banes on one line. At 1440 by 900 that line ran past the
side of the panel and its last word landed on the photograph, dark on dark, unreadable. **Every
check was green.** The run's BOX fitted inside the panel, and the check that reads a run's ink only
ever looks inside that box, so the ink that escaped it was never read. The capture is what found it.

Three things close it. The successes and the banes are two lines. `drawShareCard` measures every run
with the real font metrics and fits anything too wide, and it reports what it drew. And
`share.every-run-is-drawn-inside-the-panel` reads that report, over the six drawn cards and over the
**widest card the readings can make** — every number at two digits — which fills 78.6 per cent of
its box at most. Putting the one line back turns it red at
`fitted_smaller=6 [ember: successes was fitted from 46 px to 36 px; ...]`.

### What the card says, and how Constraint 1 was proved on it

The application name, the successes, the banes, and five readings: the dice count, the kept count,
the count still in the cup, the stress and the push count. Nothing else about where the card came
from. `src/shell/share-card.test.ts` reads `scripts/forbidden-hashes.json` and scans all nine
strings of a card through `tokenise` and `digest` **imported from the gate itself**, so the check
and `scripts/check-branding.mjs` cannot disagree about what a term is. It runs over twelve rolls,
108 strings, and the count is asserted.

**A clean verdict alone proves nothing, so the scanner is shown to answer.** A real term may never
enter this repository, so the positive control hashes a word the card does hold — `kept` — and the
same function then reports it. An instrument that finds that finds a real term written the same way.

### The contrast claim is the card's own

The card is drawn, not styled, so nothing about it is inherited from Unit 4.8. The summary sits on
an opaque panel filled with `surface`, drawn in `text` and `textMuted`, bounded by `line`. Text over
a photograph would answer to whatever the photograph happened to be.

Six cards were drawn on the graphics card, one per interface palette, and every reading is taken off
the DRAWN pixels: the ground is the commonest colour inside the panel boundary, and each run's ink
is the pixel of its own box whose luma is furthest from that ground. The panel is opaque, so every
pixel inside it is a blend of the ground and one ink and the furthest one is the ink itself; a run
the draw loop skipped comes back as the ground and fails by name. Forty-eight readings, dimmest
5.28 to 1 against the 4.5 to 1 of WCAG 2.2 SC 1.4.3.

### The oracle is the state, in another engine

`node scripts/browser.mjs --share` builds the card in the page and builds it again in node, from the
same seed through `src/rules` and `src/shell/state.ts`, and compares all eight runs. Giving the page
a seed one higher turns it red naming four runs. In the application,
`node scripts/browser.mjs --share-controls` compares the alternative text against the readings the
SCREEN printed — the live region for the successes, the banes and the push count, and the two zone
bands for the kept and the loose dice — over a denominator of six.

### The two ways out

**The download is the anchor of Unit 4.5, over the same bytes.** No second download was written. The
file the button hands the browser is intercepted at `URL.createObjectURL`, which is the browser's
own call, and compared byte for byte against the data URL the preview carries, decoded in node:
69,460 of 69,460 bytes, first difference -1.

**The share target is the browser's own and may be absent.** `share-send-button` is drawn only where
`navigator.canShare` accepts this very file. This host reports `navigator.share=false`, so the
control is absent, the check that the two agree is judged, and the check that would judge the call
prints `NOT JUDGED` with the reason and counts in `skipped=1`. The call itself is proved in jsdom
against a stubbed target, where the file and the same readings in words are compared against what
the panel handed over.

### The limit this unit accepts

**A card needs the table.** `captureTrayJpeg` draws one fresh frame through the renderer, so the
flat dice of Unit 3.7 make no card and the panel says so, naming the switch one row above it. Two
alternatives were priced and rejected in Decision 16: a card of the summary alone fails the plan's
own acceptance, because a panel of flat colour holds neither the variance nor the thousand distinct
values a picture of dice holds; and drawing the flat dice a second time is a second renderer to keep
true. A platform below the bar therefore makes no card. The plan names the share card as the first
thing effort is traded from.

**A card belongs to the roll it was made from.** Any change of the dice clears it. Removing that
effect turns `src/app.test.tsx` red at `a new roll takes the old card away`.

**The opaque panel can cover a die.** The dice land where the physics puts them and the panel is
drawn over them. Nothing factual is lost — the panel carries every reading of the roll — but a card
is not a complete picture of the table.

### The twenty-one red-proofs

Nine over the test runner and `node --test`:

1. a reading changed — `seed 1, the kept reading: expected '6 kept' to be '5 kept'`
2. a reading dropped — `seed 1 draws every reading, in order: expected [ Array(4) ] to deeply equal [ 'dice', 'kept', 'inTheCup', …(2) ]`
3. a palette ink darkened — `every run of every palette clears the text floor: expected [ 'ash: title reads 1.25 to 1' ] to deeply equal []`
4. a mark no run asked for — `the fill, the boundary and one call per run: expected 11 to be 10`
5. the overlay call removed — the drawn order lost `"overlay"`
6. the async guard removed — `refuses an async overlay ... .toThrow(/async function and it may not await/)`
7. `canShare` taken on trust — `expected true to be false`
8. the card left standing over a new roll — `a new roll takes the old card away: expected <img class="share-shot" …> to be null`
9. the region ignored — `expected: 84 ... 'Missing expected exception.'`

Seven over the driven browser, `--share`:

10. the copy in a later task, which is the defect itself — `share.luminance-variance-above-the-floor variance=0.00`, `share.distinct-pixel-values distinct=59`
11. a run the draw loop skipped — `wrong=6 [ember: reading-stress marked no pixel of its own box; ...]`
12. a palette ink too near its ground — `below=7 [void: successes reads 1.48 to 1; ...]`
13. the panel filled with another token — `wrong=6 [ember: the panel drew rgb(38, 30, 27) against rgb(51, 42, 39); ...]`
14. the successes and the banes back on one line, which is the defect the capture found — `fitted_smaller=6 [ember: successes was fitted from 46 px to 36 px; ...]`
15. the page built from another roll — `wrong=4 [successes=4 successes was drawn as successes=6 successes; ...]`
16. the panel counted out twice — `the photograph is the other 1209900`

Five over the driven browser, `--share-controls`:

17. a way out drawn before a card exists — `the sheet holds 2 control: [share-card-button, share-download-button]`
18. a reading dropped from the alternative text — `compared=5 of 6 readings ... unsaid=1 [12 dice]`
19. the download handed other bytes — `The file measures 8 bytes against the 60322 this file decodes IN NODE`
20. a control taken out of the keyboard order — `reached=1 of 2 controls by real Tab presses alone`
21. the send control drawn where the browser offers nothing — `canShare({files})=false, and the panel drew the send control: true`

Each injection was confirmed to have landed before the run, and every file was restored by editing
the injection back rather than by a command that discards the working tree. **Two batches were
thrown away first:** the runs reported exit 1 with no failed check, because the dev server had been
started in the wrong directory and the browser met `NS_ERROR_CONNECTION_REFUSED`. A red with no
named gate is not a red.

### Reported, not fixed

- `.claude/skills/run-clatter/SKILL.md` still carries no `--share` or `--share-controls` mode,
  because the permission rails deny a write under `.claude/skills`. Both are documented in the
  header of `scripts/browser.mjs`.
- Both share modes stay out of `validate`. They need a browser and a graphics card.
- `docs/design/0009-share-card-1440.jpg` now holds the composed card rather than the bare capture of
  the first half, so the file the earlier notes point at has moved on.

### The captures, and what they show

Six at 1440 px, one per interface palette: `docs/design/0020-share-card-ember-1440.jpg`, `-ash-`,
`-verdigris-`, `-bone-`, `-void-` and `-cobalt-`. The panel is in the upper left, the dice spread
over the lower half, and every line of the summary reads at a glance in all six, the light row
included. `docs/design/0021-share-panel-1440.png` is the panel inside the application, with the
preview, the file name on the save control and the note under it.

Every image was looked at, and the first set is what found the overflow above.

### Measurements

| Number | Value |
|---|---|
| New tests | 41: 17 in `src/shell/share-card.test.ts`, 9 in `src/shell/download.test.ts`, 5 in `src/shell/share-state.test.ts`, 3 in `src/tray/capture.test.ts`, 7 in `src/app.test.tsx`, 2 in `scripts/browser.test.mjs` |
| Test total | 395 vitest tests over 38 files, plus 23 node tests |
| Injections proved red | 21, every one restored by editing the injection back |
| Controls at rest | 5 at rest A and 5 at rest B, against the ceiling of 8 in section 3 |
| Keyboard walks | 11 visits before the throw and 35 after it, unchanged, in both instruments |
| Card readings measured | 48, six palettes times eight runs, off the drawn pixels |
| Initial JavaScript | 37,631 to 39,932 gzip bytes. Budget in `budgets.json`. |
| Lazy 3D chunk | 151,876 gzip bytes, unchanged |
| `npm run perf` | `steps_to_rest_fixed_seed_scene measured=203 budget=224`, scene digest matched, exit 0 |
| Harness | `--share` 13/0/0, `--share-controls` 8/0/1, `--shell` 8/0/0, `--sheet` 11/0/0, `--theme` 10/0/0, `--table` 9/0/0, `--blocked-chunk` 11/0/0, `--history` 21/0/0 |
| Validate | `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, all exit 0 |

## Unit 3.6 — the interface half: the toggle, the volume, and the engine at work

### What landed

`sheet-sound` behind the one disclosure, a checkbox and a slider, and the wiring that makes the
engine of the first half audible: `src/shell/table.tsx` passes `onImpact` to `mountTray` through its
`config`, and the hook reads a ref, so the engine answers every collision under the choice in force
rather than the one that stood at the mount. Decision 17 of `docs/design/0012-settled-decisions.md`
records every choice and section 4 of `docs/design/0002-screen-design.md` lists both controls.

The engine, the stored state and the collision hook are the first half and were not rebuilt. No
audio file was added. Every sound is still synthesised.

### The claim the first half could not make, and how this one makes it

The engine half proved the engine against collisions it wired up by hand. This half proves the
**application**: the player turns sound on through the real control with real key presses, sets a
level with real arrow presses, and rolls.

**No number the engine writes is its own denominator.** `node scripts/browser.mjs --sound-controls`
counts the voices through `AudioBufferSourceNode.start`, which belongs to the browser, and it reads
the level off `engine.output.gain.value`, which is an `AudioParam` of a real `GainNode`. Run on the
graphics card with the sandbox off:

    browser: sound-controls OFF contexts=0 voices=0 started=0 impacts=125 triggers=0 engine=true
    browser: sound-controls keyboard toggle_presses=1 reached=true volume_presses=1
             gain_at_loud=0.75 gain_at_quiet=0.25 stored_loud=0.75 stored_quiet=0.25
             context=running gain_node=true
    browser: sound-controls ON contexts=1 voices=82 engine_triggers=82 collisions=130
             state=running gain=0.25
    browser: sound-controls OFF AGAIN voices=0 triggers=0 collisions=134 stored_enabled=false
             context_still_there=running

The toggle off leaves the graph standing and reads 0 voices over a whole throw while 134 collisions
still arrive, so the check reads the gate and not a torn-down context.

### Two accessibility defects the checks found

**The slider took its name from the label around it.** That label also holds the level, so the
accessible name read "Volume25 per cent" and a reader would announce the level twice, once from the
name and once from `aria-valuetext`. `aria-label="Volume"` is now written on the control and the
printed level is `aria-hidden`.

**The check that found it could not have failed at first.** Its first form asserted only that the
name was not empty, and the label fallback always fills that. Removing `aria-label` left it green.
The check now asserts the name is exactly "Volume", and the same removal turns it red at
`the volume is a range named "Volume25 per cent", which must be "Volume" and nothing more`.

**The slider drew itself 20 px tall**, against the 24 px floor of WCAG 2.2 SC 2.5.8 and the 44 px
this project uses. It now takes the full row at 44 px.

### The browser with no Web Audio

`enable` constructs an `AudioContext` and a browser without the Web Audio API has none. The failure
lands inside the press that asked for sound, so it is caught and the note says so. **The record is
not written in that case**, because a record that promised sound the browser cannot make would greet
the next session with a switch that reads on and a table that is silent.

## Unit 3.8 — the overlay half: four readings, reported and never gated

### The rule that governs the whole panel

The End state of `CLAUDE.md` splits the performance claims in two. The deterministic gates are
integers, they run in CI, and they read a bound out of `budgets.json`. The timing figures are
**reported, on real hardware**, once per phase, and the owner pastes them into this file. The overlay
is the second kind:

- It reads no budget, compares no reading against one, and prints no verdict.
- No `validate` command and no CI step runs it.
- Every number names its unit and its sample count, because the owner reads them off a photograph.
- A percentile below its floor is refused. A figure with no source in this browser is named.

Decision 18 of `docs/design/0012-settled-decisions.md` records all of it.

### The sample floor is derived, not chosen

A quantile q over n samples names a value that at most n(1-q) samples lie above. Below 1/(1-q)
samples that count is under one, so the "p95" is the largest sample and the "p99" is the same number
again. `minimumSamples` is `Math.ceil(1 / (1 - quantile))`: **20 frames for p95 and 100 for p99**.
Below it the panel prints `too few samples: 4 of 20 frames in a throw` and no number at all.

### The frames are sampled inside a throw, and nowhere else

A probe that samples a resting table measures the browser idling. The cost of this application is the
throw. A measurement window opens at the press and closes when the tray reports the table at rest,
and a window nothing reports rest for shuts after four seconds, because the flat renderer acts no
throw out and would otherwise fill the samples with idle frames.

### Throw to first motion, and both of its ends

**The near end is the press itself.** It is the `timeStamp` of the click event, which the browser
wrote before any handler of this application ran. The run reads the clock inside a capture-phase
handler of its own and prints both, so a figure taken at the handler rather than at the press is
visible: they read 6932.0 and 6932.0.

**The far end is a die drawn somewhere else.** `src/tray/motion.ts` compares the drawn positions of
every die against the reading taken at the press, exactly, with no tolerance: a sleeping body does
not move by a little, it does not move. The watch starts BEFORE `box.roll` is called, so the whole
synchronous simulation lies inside the measurement.

**The first frame is not the first motion, and that is measured rather than argued.** The harness
watches the same positions through the tray seam by a route of its own. On the run below the browser
drew a frame 4.3 ms BEFORE the press timestamp, and one more frame in which every die was exactly
where the press left it, before the dice moved 95.1 ms after the press:

    browser: overlay watcher pressed_at=6932.0 handler_at=6932.0 first_frame=+-4.3ms
             motion=+95.1ms still_frames=1 dice=20 apart=-0.0ms

The two watchers agree to 0.0 ms. The allowance is 34 ms, which is the one frame two watchers on the
same clock can differ by, and it is printed beside the difference it has to tell apart.

### The instrument is shown to answer before its verdict is trusted

`node scripts/browser.mjs --overlay` throws once, then holds the thread for 40 ms on every frame and
throws again:

    browser: overlay stall injected=40ms p95 17.1 -> 50.2 p99=50.2 samples 362 -> 429

A figure computed from a constant cannot move. The check reads no budget: it judges the instrument
and never the machine.

### The switch off and on again builds a new instrument

The samples belong to the sitting. A panel that carried the samples of an instrumented run across a
switch would report that run to the owner as this machine, so the recorder is built on the way on and
dropped on the way off. The captures are taken from a fresh sitting for the same reason.

### The desktop reading — NOT the reading the plan asks for

**This is an RX 6700 XT on a Linux desktop in Firefox. It is not a mid-range phone and it is not the
measurement the plan wants.** It is recorded here to show what the overlay prints, and the owner
still owes the phone reading. Twenty dice, the sandbox off, a fresh sitting, one throw:

| Figure | Reading |
|---|---|
| Frame p95 | 17.1 ms over 195 frames in a throw |
| Frame p99 | 17.3 ms over 195 frames in a throw |
| Long tasks | not measured here: this browser reports no long tasks |
| Throw to first motion | 96.8 ms over 1 throw |

### The figure this browser cannot measure

Firefox does not list `longtask` among `PerformanceObserver.supportedEntryTypes`, so there is no
source for the long-task total. The panel names the reason and prints no digit. A zero would be a
measurement and it would be a lie, because a run of 40 ms stalls had just gone through that page.

## Units 3.6 and 3.8 — what both halves share

### The twenty-one red-proofs

Sixteen over the test runner, in `src/shell/perf.test.ts`, `src/tray/motion.test.ts`,
`src/shell/overlay.test.tsx` and `src/app.test.tsx`:

1. `figureLine` prints a bare number — `expected '152' to be '152 ms over 2 long tasks'`, and five more
2. `minimumSamples` returns 1 — `expected 1 to be 20`
3. `quantileOf` returns a constant 16.7 — `expected { kind: 'measured', value: 16.7 } to deeply equal { kind: 'measured', value: 16 }`
4. frames sampled outside a window — `expected 59 to be +0`, and `expected 399 to be 250`
5. `hasMoved` always true — `expected [ { at: 16, evidence: … } ] to have a length of +0 but got 1`
6. an unavailable long-task total printed as 0 — `expected { kind: 'measured', value: +0 } to deeply equal { kind: 'unavailable', … }`
7. the level never leaves the record — `expected 0.5 to be 0.25`
8. the slider loses `aria-label` — `the accessible name, and only it: expected null to be 'Volume'`
9. the panel takes a `tabindex` and loses its name — `expected [ Array(12) ] to deeply equal [ 'collapse-button', … ]` and `expected null to be 'Performance readings'`
10. the overlay switch is stored — `expected [ 'overlayOn' ] to deeply equal []`
11. the record written on a browser with no audio — `expected true to be false`
12. a context built before the player asks — `nothing is built while sound is off: expected { destination: … } to be null`
13. the clock and the observer never stop — `expected +0 to be 1`
14. the panel drawn again inside a throw — `expected '90.0 ms over 1 long task' to be '0.0 ms over 0 long tasks'`
15. the sound toggle leaves the keyboard order — `expected [ undefined, undefined, …(54) ] to include 'sheet-sound-toggle'`
16. one of a thing printed in the plural — `expected '96.0 ms over 1 throws' to be '96.0 ms over 1 throw'`

Nine over the driven browser, each one rebuilt and re-run. Several of the injections above go red in
both instruments:

17. the sound hook never reaches the tray — `started 0 voices over a throw that reported 0 collisions`
18. the toggle off never disables the engine — `The browser started 69 voices and the engine started 69, both against a ceiling of 0`
19. the level never leaves the record — `At 0.75 the gain reads 0.5 against the 0.75 an AudioParam holds`
20. the toggle leaves the keyboard order — `reached the toggle in 30`, and three more checks with it
21. `minimumSamples` returns 1 — `the two percentiles read "too few samples: 0 of 1 frames in a throw"`
22. `quantileOf` returns a constant — `p95 reads 16.7 ms over 483 frames`, unmoved by a 40 ms stall
23. the long-task total printed as 0 — `The panel reads "0.0 ms over 0 long tasks"`
24. motion reported at the first frame after the press — `the first throw of the session read "-4.0 ms over 1 throw"`
25. the watch started after the library was asked to act the throw out — `The panel reads 262 ms, which is 133.4 ms from that`
26. a verdict word on a row, and separately a `tabindex` on the panel — `verdict_words=1`, and `holding 1 tab stops`
27. the recorder survives the switch — `the panel read "50.2 ms over 441 frames in a throw"` after the switch went off and on

Each injection was confirmed to have landed before the run, and every file was restored **by editing
the injection back**. The SHA-256 of each restored file matches the reading taken before its
injection. No `git stash` and no checkout touched the working tree.

### The injection that could not go red, and what it showed

Making `hasMoved` answer true on every frame turns three tests red and leaves the browser check
green. The reason is worth recording: the application's watch is registered inside the effect that
queues the throw, and that effect calls `box.roll` in the same task, so the first frame the watch
ever sees already falls after the synchronous simulation. The reading is the same either way on this
host. The two injections that DO move it are the two shapes the acceptance names — a reading taken at
the first frame after the press, and a watch started after the library was asked to act the throw out
— and both are proved above.

### Measurements

| Number | Value |
|---|---|
| New files | 6: `src/shell/perf.ts`, `src/shell/perf.test.ts`, `src/shell/overlay.tsx`, `src/shell/overlay.test.tsx`, `src/tray/motion.ts`, `src/tray/motion.test.ts` |
| New tests | 43. The vitest total moves from 395 over 38 files to 438 over 41. The `node --test` total is unchanged at 23. |
| Injections proved red | 21, every one restored by editing the injection back |
| Keyboard walks | 11 visits before the throw and 35 after it, unchanged, in both instruments, and asserted again with the overlay panel on the screen |
| Controls at rest | unchanged. Both new controls are on the sheet, which is a second surface. |
| Initial JavaScript | 39,932 to 43,390 gzip bytes. Budget in `budgets.json`, and the measurement is under it. |
| Lazy 3D chunk | 151,876 gzip bytes, unchanged |
| `npm run perf` | `steps_to_rest_fixed_seed_scene measured=203 budget=224`, scene digest matched, exit 0 |
| Twelve-die render counters | 841, 842 and 77, unchanged |
| Branding gate | `files_scanned=148`, `hits=0`, exit 0 |
| Harness | `--sound-controls` 6/0/0, `--overlay` 8/0/0, `--sound` 10/0/0, `--shell` 8/0/0, `--sheet` 11/0/0, `--theme` 10/0/0, `--history` 21/0/0, `--blocked-chunk` 11/0/0, `--table` 9/0/0, `--tray` 7/0/0, `--share` 13/0/0, `--share-controls` 8/0/1 |
| Validate | `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, all exit 0 |

### The captures, and what they show

`docs/design/0022-sheet-sound-360.png` is the sheet at 360 px with the sound panel open. The
checkbox and the slider each fill a 44 px row and the level is printed in words beside the slider.

`docs/design/0023-overlay-360.png` and `docs/design/0023-overlay-1440.png` are the overlay on a
fresh sitting after one throw of twenty dice. Every line reads at a glance at phone width: the
figure, the number, the unit and the sample count. The long-task row is in italic and names its
reason instead of a number. At 1440 px the panel sits in the upper left and covers no die.

Both images were looked at. The 360 px frame is the one the owner will photograph, and the dice are
still visible under the panel.

### What is open

**Nothing of either unit.** Both are complete.

**The owner still owes the phone reading.** The plan's owner action stands: open the application on
the phone, turn `sheet-overlay` on, roll, and paste the four figures into this file. The desktop
reading above is not that measurement and is labelled as such.

## Unit 5.1 — the mount, judged on a graphics card

The open item read: "The `--hardware` run stays with the owner. The sandbox gives no WebGL."

That was written on 2026-08-09. It was true then. It was measured again on 2026-08-10 rather than
assumed either way, and it is no longer true.

### What was run

```sh
npm run build
node scripts/browser.mjs --offline --hardware --url http://localhost:4173/clatter/
```

The sandbox was off. The harness started and stopped its own preview server, because the mode has
to prove the server stopped.

### What it read

| Reading | Value |
|---|---|
| Renderer | `AMD Radeon RX 6700 XT (radeonsi, navi22, ACO, DRM 3.64, 7.1.7-200.fc44.x86_64)` |
| Summary | `mode=hardware checks=8 failures=0 skipped=0` |
| Summary on 2026-08-09 | `checks=8 failures=0 skipped=1` |
| Origin before the reload | `origin_unreachable=true`, server pid held by the harness |
| Precache | 8 entries over 1 cache |
| Lazy 3D chunk, offline | `status=200`, 596,587 bytes, 0 failed requests |
| Renderer choice | `tray` |
| Canvas elements | 1 |
| Table status line | `"a canvas on the table"` |
| Frames sampled | 62 over 1000 ms, against a floor of 30 |

`offline.the-lazy-3d-chunk-mounts` is the check that was `NOT JUDGED`. It is now green. The skip is
gone from the summary, so the coverage is read off the same line that reported the hole.

### What settled it, and what did not

**No file in this repository changed for this row.** Two things outside it moved:

1. The owner added `node scripts/browser.mjs*` to `sandbox.excludedCommands` on 2026-08-09. The
   harness can now reach `/dev/dri` and the display.
2. Unit 3.5's screen half put the 3D tray inside the application, so the table is a route a
   throw reaches rather than a fixture the harness builds.

The earlier row named its skip, printed it in the summary and stated the reason. That is why this
row could measure the same check rather than argue about it.

### What the plan asked for

The acceptance is "the app loads with the network disabled after one visit". The offline mode
proves it end to end on the graphics card: the worker installs on the first visit, the origin is
confirmed unreachable, the reload renders 3 of 3 named parts, the chunk comes out of the precache,
**the tray mounts**, and the manifest and both icons read offline.

### What is open

**Nothing.** Unit 5.1 is complete.

## Unit 5.2 — the README, the version and the tag

### The README

The first README was reviewed before any commit and four errors were caught. This rewrite was
checked against those four shapes, one at a time, because the same review does not run twice.

| The first README's error | How this rewrite was checked |
|---|---|
| It claimed a capability the code did not have. | Every sentence of "What the application does" was read against the module that implements it. The fallback sentence was corrected while doing this: `src/shell/renderer.ts` makes the fall permanent **and** gives the player a switch back, and only a platform below the bar cannot use that switch. The draft said the fall was simply permanent. |
| It claimed `npm test` covers the browser harness. | The `test` script in `package.json` was read. The README states what that script runs and says plainly that it drives no browser. |
| It overstated a claim about other tools. | The narrow claim is kept, word for word: every existing 3D dice **integration** hides the kept dice. Nothing is claimed about dice tools in general. |
| It held a marketing adjective and a semicolon. | `grep` over the file for semicolons and for a list of marketing words. Both exit 1, which is no match. |

**A green branding gate is not a review of the document.** The earlier row wrote that lesson and it
held here: the gate reads forbidden tokens, not false statements. Nothing below was checked by the
gate.

Three further disciplines were applied:

- **No budget is retyped.** The README points at `budgets.json` and says in a sentence that it
  states no number from it.
- **No constant is retyped either.** The log capacity points at `RING_CAPACITY` in
  `src/log/store.ts`. A prose copy of 5,000 is a cache with no invalidation.
- **No "not affiliated with" disclaimer.** Writing one requires naming the publisher, which is the
  thing being avoided. Constraint 1.

### The version

`0.1.0`, set in `package.json`. It was `0.0.0`.

The reason for 0 and not 1: the application is feature-complete through Phase 4 and Unit 5.1, and
the owner gate at Unit 5.3 has not run. Nobody has judged the feel of it on a phone or on a tablet.
A major version claims a stability that no review has confirmed. `0.1.0` claims a first working
release, which is what this is.

### The tag and the release

The tag is `v0.1.0`, cut from the merge commit of pull request #23, after the merge. A tag cut
before the merge points at a commit that never reached `main`.

The tag name carries the version alone. No branding token reaches it.

**Recorded after the merge**, because none of it could exist before it. This section landed in a
second `docs:` pull request for that reason.

| Fact | Value |
|---|---|
| Tag | `v0.1.0`, annotated object `32a2988` |
| Commit the tag points at | `495f0e1c46962367f5d8331cd3e855fd306d69bf`, the squash merge of #23 |
| Tag push | `git push origin v0.1.0`, exit 0. The push was not refused. A tag ref is not `main`, so the workspace deny rule did not match it. |
| Release | `https://github.com/WilderSelf/clatter/releases/tag/v0.1.0` |
| Release notes | Written in Simplified Technical English, and read by hand. The gate reads no release, so `node scripts/check-branding.mjs --file` was run over the notes file before publication: `files_scanned=1 hits=0`, exit 0. |
| Deploy | `Deploy to Pages` run 31423327490 on the merge commit, success |

### The live site, checked after the tag

Every URL below was **read out of the returned bytes** and never guessed. `index.html` names four.
The manifest names its two icons. `registerSW.js` names the worker. `sw.js` names the workbox
runtime and the lazy 3D chunk. A wrong base path answers 200 with a blank screen, which is why Unit
0.6 made this rule.

| URL | Status | Bytes | Named by |
|---|---|---|---|
| `https://wilderself.github.io/clatter/` | 200 | 544 | the request |
| `/clatter/assets/index-BAu952uK.css` | 200 | 18,620 | `index.html` |
| `/clatter/assets/index-DFU4cuyh.js` | 200 | 129,474 | `index.html` |
| `/clatter/manifest.webmanifest` | 200 | 425 | `index.html` |
| `/clatter/registerSW.js` | 200 | 150 | `index.html` |
| `/clatter/icons/icon-192.png` | 200 | 1,173 | the manifest |
| `/clatter/icons/icon-512.png` | 200 | 3,674 | the manifest |
| `/clatter/sw.js` | 200 | 1,287 | `registerSW.js` |
| `/clatter/workbox-9c191d2f.js` | 200 | 15,112 | `sw.js` |
| `/clatter/assets/dice-tray-Cz13SOUC.js` | 200 | 596,587 | `sw.js` |

**The hashes match the build the tag points at.** `main` was confirmed to be at
`495f0e1c46962367f5d8331cd3e855fd306d69bf` with a clean tree, `npm run build` ran, and each live
file was compared to its built file by SHA-256. All 10 of 10 match. A status of 200 says a file
answered. The digest says it is the same file.

### The branding gate, and which surfaces it actually reads

```
branding-gate: files_scanned=160 binary_skipped=91 unreadable=0 enumerated=251 terms_loaded=24
branding-gate: binary metadata NOT scanned in 91 files (PNG tEXt, PNG iTXt, JPEG EXIF and the like): .jpg .png
branding-gate: hits=0 surfaces=tracked,dist,commits,metadata
branding-count: OK accounted=251 expected=251 scanned=160 binary_skipped=91 tracked=241 dist=10
```

Exit 0. Run as `sh scripts/check-branding-count.sh --base origin/main --metadata-file <file>`,
where the file is a real `gh api repos/WilderSelf/clatter` reading.

**The four surfaces it reads:**

1. **The tracked tree**, which carries the README. 241 tracked paths.
2. **`dist/`**, which is the built output. 10 files.
3. **The commit messages** of this pull request, over `origin/main..HEAD`.
4. **The repository description and the topics**, from the `gh api` file. The owner set a
   105-character description and 6 topics on 2026-08-09. `npm test` alone passes no metadata file,
   so it prints `metadata` in the surface list while reading nothing. **This row's figures come
   from a run that was fed the file.**

**What it does not read, stated plainly:**

- **The release title and the release notes.** A release lives in the GitHub API and in no file.
  The notes were read by hand before publication instead.
- **The tag name and the tag message.** Same reason.
- **The pull-request title and body.** The gate reads commit messages, not the pull request.
- **Text inside a binary file.** 91 files were skipped as binary and their PNG `tEXt`, PNG `iTXt`
  and JPEG EXIF chunks were not read. The gate prints that hole on every run that skips a file.

### Validation

| Check | Result |
|---|---|
| `npm run lint` | exit 0 |
| `npm run typecheck` | exit 0 |
| `npm test` | exit 0. Vitest 466 tests over 44 files, plus 23 `node:test` cases with 1 skipped by design |
| `npm run build` | exit 0, `precache coverage: 7 of 7` |
| `node scripts/check-bundle-size.mjs` | exit 0, `failures=0` |
| `npm run perf` | exit 0, `steps_to_rest_fixed_seed_scene measured=203`, spread 0 over 5 runs, scene digest matched |
| Initial JavaScript | 44,828 gzip bytes. The budget is `initial_js_gzip_bytes` in `budgets.json` and the measurement is under it. |
| Lazy 3D chunk | 151,876 gzip bytes, against `lazy_3d_chunk_gzip_bytes` in the same file |
| Service worker | 5,972 gzip bytes over 2 files, reported with no budget |
| Twelve-die render counters | 841 draw calls, 842 triangles, 77 textures, each under its ceiling in `budgets.json` |
| `--offline --hardware` | `checks=8 failures=0 skipped=0` |
| `--tray --hardware` | `checks=7 failures=0 skipped=0` |

No code changed in this pull request. The three render counters and the steps to rest were measured
again anyway, because a claim that nothing moved is worth less than a reading.

### What is open

**Nothing of Unit 5.2.** It is complete.

## Phase 6 — the owner round of 2026-08-10

The approved plan runs through Unit 5.4. Phase 6 holds the five pull requests the owner reviewed
after release, outside the original unit list.

## Unit 6.1 — the tray timbre: wooden voice on a leather ground

### What landed

Pull request #25, commit `d84af9c`. The tray voice was tinny and lacked weight. The fix doubled the
filtering depth and retuned every parameter toward a lower, resonant sound with body beneath each
knock.

### The old timbre

One band-pass per voice. Die at 2400 Hz with Q 1.6 and 0.05 s decay. Surface at 780 Hz with Q 0.9
and 0.13 s decay. No energy below approximately 500 Hz and no roll-off above.

### The new timbre

Two band-passes into one low-pass, feeding from a shared noise burst. Die knock at 950 Hz with
Q 0.7, 0.045 s, and a body at 220 Hz with Q 1.1, totalling 0.075 s, the body at 45 per cent of
level. Surface knock at 330 Hz with Q 0.8, 0.075 s, and a body at 120 Hz with Q 1.1, totalling
0.17 s, the body at 75 per cent of level.

`DAMPING_HZ = 1800`, `DAMPING_Q = -3.01`. Web Audio reads Q in decibels for a low-pass and linearly
for a band-pass. A value of 0.707 there adds a resonant peak at the corner.

A band-pass over white noise passes energy in proportion to `hz / q`, so each band's gain scales by
`sqrt(BAND_WIDTH_REFERENCE * q / hz)`. `VOICE_GAIN = 3`.

### The gap this closed

`scripts/browser.mjs --sound` measured peak amplitude against `> 0` only. It passed at 1.041782 on
the tinny sound. The repository held no spectrum measure and no decay profile.

New check: band energy under 1000 Hz against energy over 3000 Hz. Old sound ratio 0.6, new 42.4,
floor 8. With the low-pass removed entirely the ratio falls to 5.4. Removing the single largest cure
element turns this check red.

Proven red on the restored old timbre: `FAIL sound.the-low-band-carries-the-sound ... a ratio of 0.6
against a floor of 8`, `checks=11 failures=1`. Every other check stayed green, peak included.

This finding is about the measurement only. The sound itself stays owner judgement.

### Two defects

**Defect 1, found in review.** Swapping the two envelope durations inverted the weight. The test fake
discarded both ramp arguments and the pure record never caught it. All 467 tests and all 11 browser
checks stayed green. Fixed by recording each ramp end and finding each band by its centre frequency.
Build order would still pass the swap because exchanging two durations leaves the same two lengths in
the same graph.

**Defect 2, caught by the spectrum check.** The check proved red on the restored old timbre and could
not have been written without remeasuring the decay.

### Reported, not fixed

The sound itself stays owner judgement. A band-energy floor proves the timbre is not tinny. It does
not prove the sound is good.

### Validation

| Check | Result |
|---|---|
| `npm run lint` | exit 0 |
| `npm run typecheck` | exit 0 |
| `npm test` | 467 vitest tests, exit 0 |
| `npm run build` | exit 0 |
| Branding gate | `files_scanned=160 hits=0` exit 0 |
| `--sound` | `checks=11 failures=0` |

### What is open

Nothing of Unit 6.1. It is complete.

## Unit 6.2 — marks timing: hold the readout until the tray settles

### What landed

Pull request #26, commit `3d9c1d6`. Bane and success marks appeared before the dice stopped rolling
on a push, because every mark surface read `state.result`, which the reducer set in the same call
that started the throw.

### The root cause

The first roll had the identical defect and was merely invisible because the table stayed hidden
behind the pool builder. The fix went in the shared path, not the push path.

### The fix

Added `AppState.settledOrdinal`, a `withSettled` action carrying the ordinal, and a `stillTumbling`
predicate. The flat renderer waits zero frames because the predicate reads the renderer state.

### First wall-clock readings the project holds

Cold profile, three runs each:

| Measurement | Hardware | Software |
|---|---|---|
| Press to mounted tray | 565 / 596 / 638 ms | 582 / 790 / 960 ms |
| Press to rest | 3903 / 3985 / 4083 ms | 4206 / 4269 / 5508 ms |

These numbers are not in `budgets.json` and nothing gates them. The original five-second bound
started at the press and fired before the dice stopped on the slowest run. The fix changed what the
bound covers rather than the number. A mounted tray reports rest on every path, so the bound now
covers the mount alone and clears when the tray mounts.

A second guard was needed and the ordinal alone did not supply it. A table that has left the document
now reports nothing.

### The six red-proofs

Each injection landed and every file was restored by editing the injection back. The SHA-256 of each
restored file matches the reading taken before its injection.

1. Settle dispatch deleted — `expected 0 to be 1`
2. Result arm deleted — marks appeared at press
3. Live guard deleted — marks appeared at press on a push
4. Mount gate deleted — marks appeared before mount
5. Ordinal ignored — marks appeared at press
6. Label gate deleted — marks appeared at press

The `--a11y` harness reads the live region two frames after the press. The harness moved to rest. The
announcement did not move, so the eye and the screen reader receive the result in the same render.

### Reported, not fixed

The roll-log write still fires at commit. A log is a record rather than a live readout. The share
card can still print a final result over a frame of tumbling dice. That belongs to the card's own
unit.

### Validation

| Check | Result |
|---|---|
| `npm run lint` | exit 0 |
| `npm run typecheck` | exit 0 |
| `npm test` | exit 0 |
| `npm run build` | exit 0 |
| Branding gate | `files_scanned=160 hits=0` exit 0 |
| `--a11y` | `checks=14 failures=0` |

### What is open

Nothing of Unit 6.2. It is complete.

## Unit 6.3 — theme consolidation: one colour, weathered mood

### What landed

Pull request #27, commit `7daebd1`. The owner asked to simplify themes from three independent axes
to one colour choice that drives the dice, the tray and the interface together.

### The palette

Three axes and 216 combinations collapsed to one id. Six ids: `leather` (default), `ash`, `moss`,
`bone`, `iron`, `oxblood`. Every row retuned toward a weathered, low-fantasy mood with muted
saturation and limited lightness spread.

Rows were generated offline through the existing colour builder from one seed pair each, then pasted
as literals. This keeps the file's own rule that every colour is a literal.

`SETTINGS_VERSION` 8 to 9. The stored interface palette id wins because it is the id the player saw
on every pixel of the page.

### Two tests deleted rather than rewritten

"Text contrast does not move when the dice or tray axis moves" and "follows each axis on its own".
One axis makes both true by construction. Neither can fail again. A rewritten shell would be worse
than nothing.

### Contrast floor check

No contrast floor moved. Measured margins on the new rows: tightest text pair 5.01 against 4.5,
tightest die on tray 3.42 against 3, tightest ink 4.52 against 4, tightest ladder step 8.59 against 8.

### Two defects caught by rendering

The panel printed the legend "Theme" twice. Each row swatch drew the accent colour alone, so the one
light theme read as dark. The fix splits page and accent on the diagonal. Both now carry checks proven
red.

### The tray surface band

Measured, not stated: the six surfaces span 0.55 CIE L\*, from 12.71 to 13.26.

### Governing decisions

The approved plan at `~/.claude/plans/clatter.md` and the repository `CLAUDE.md` both carry a dated
amendment. `docs/design/0002-screen-design.md` carries one too.

### Validation

| Check | Result |
|---|---|
| `npm run lint` | exit 0 |
| `npm run typecheck` | exit 0 |
| `npm test` | exit 0 |
| `npm run build` | exit 0 |
| Branding gate | `files_scanned=160 hits=0` exit 0 |
| `--theme` | `checks=10 failures=0` |

### What is open

Nothing of Unit 6.3. It is complete.

## Unit 6.4 — options sheet layout: five categories, desktop width

### What landed

Pull request #28, commit `7ed7493`. The desktop options menu was too narrow and its controls were
badly grouped. The redesign splits them into five logical categories and opens the dialog to desktop
width.

### Before and after

Before: `width: min(520px, 100%)` with no media query, holding twelve top-level children including
three ungrouped controls.

After: five categories — Rules, Saved pools, Look, Sound, Session and data. At 760 px and up, a
centred dialog at `min(880px, 92vw)` in a two-column grid. The phone bottom sheet is unchanged.

### The nav rail case

A nav rail was rejected for a measured reason. The browser harness pins the tab traversal between
the renderer switch and the sound controls. Separate panes make that traversal impossible. Tab-stop
counts are unchanged at 1 press each and no bound was widened.

### The scroll trap

The sheet opened scrolled to its own bottom because focusing the close button scrolled it into view.
Measured at 969 px of scroll at 1440 and 2824 px at 360, with the first category at -889 px. Fixed
with `preventScroll`.

### Two correct fixes composed into a defect

Pull request #27 renamed an inner legend so "Theme" would not sit inside "Theme". This unit then
wrapped that panel in a category called "Look". Three headings stacked over one set of six radios.
The existing check could not see it because it only compared an inner legend against its outer one.

The replacement rule carries no depth number: a group earns its heading by holding a control of its
own. Only the five categories may hold nothing but groups. The redundant level is exactly the level
with no member.

### Four checks replaced

Four checks could not fail and were replaced before merge: a positive-count arm that stayed green
while a category jumped column and broke reading order, an inert arm comparing 1440 against 360, a
failure message whose conclusion contradicted its own numbers, and two floors of 13 and 20 against
real counts of 46 and 19.

The equality that replaced those floors went red on its own first run because a heading count had
been retyped from a red-proof run. A floor of `> 10` would have passed it.

### Validation

| Check | Result |
|---|---|
| `npm run lint` | exit 0 |
| `npm run typecheck` | exit 0 |
| `npm test` | exit 0 |
| `npm run build` | exit 0 |
| Branding gate | `files_scanned=160 hits=0` exit 0 |
| `--sheet` | `checks=11 failures=0` |

### What is open

Nothing of Unit 6.4. It is complete.

## Unit 6.5 — material grain: light texture everywhere

### What landed

Pull request #29, commit `f900464`. The owner asked for no flat colours. A light texture now sits on
every surface, slight but noticeable.

### The implementation

One SVG turbulence noise as a data URI, varied per surface by tile size, blended with `soft-light`.
The 3D dice take the wood material and a procedurally generated grain composited into the face canvas
the library already builds. No patch to the vendored library.

### Budget impact

The twelve-die texture counter did not move. Initial JavaScript rose by approximately 400 gzip bytes.
Both measurements sit under their ceilings in `budgets.json`.

### The tray surface is not a 3D material

This is load-bearing for later readers: the tray surface is the CSS background of the container
element. The three.js desk is a shadow catcher that paints no colour.

### A drift gate that failed

An invented gate said average brightness must not move. It failed on 16 of 18 readings because
`soft-light` is not symmetric and lifts a dark ground 7 to 9 levels out of 255. The gate was
abandoned rather than loosened. It was replaced by a rendered-pixel ink contrast claim: tightest
9.97 against 4.5.

### Probe measurement refinement

A first dice probe sampled a 24 px window against a 36 px coarse octave and read 8 levels of a
promised 44. The probe was smaller than the feature it measured. Widened, then re-derived rather
than nudged. A probe that settles before measuring is blind to the movement cost by construction.

### Marker colour binding

The lock markers now follow the theme. The success and bane pair read 1.00 to 1 against each other in
every row. Hue carries their whole separation and they must stay fixed. The lock pair read 2.69 to 1,
separated by lightness. Their hue was free. `rule` takes `line`, `choice` takes `onTray`. Worst over
36 marker and surface pairings: rule 3.53 to 1, choice 12.91 to 1, pair 3.63.

### A gate widened by director instruction

A gate widened by director instruction was reverted before merge. A reviewer proved the original check
passed against the new stylesheet. The widening bought nothing and would have admitted a
near-opaque white wash over every palette.

### The noise data URI

The noise data URI could carry a hue the literal gate could not read. Closed by percent-decoding
before the scan.

### Two findings that remain open

Both live on branch `feat/grain-covers-every-ground`, in progress.

**Finding 1: The grain coverage check counts its own fixture.** The stylesheet holds 48 selectors
that paint a ground. The check named three. Of those 48, the grain covers 18 and 31 stay flat. The
check stays green while a selector that grains is deleted.

**Finding 2: The 90 rendered contrast claims resolve their ground through computed style**, which no
longer equals the painted pixels. One reading needs confirming: a filled control in one row measured
2.797 on its worst pixel against a floor of 3, with a mean of 3.456.

### Validation

| Check | Result |
|---|---|
| `npm run lint` | exit 0 |
| `npm run typecheck` | exit 0 |
| `npm test` | exit 0 |
| `npm run build` | exit 0 |
| Branding gate | `files_scanned=160 hits=0` exit 0 |
| `--theme` | `checks=10 failures=0` |

### What is open

Two findings remain open on a follow-up branch. Unit 6.5 is otherwise complete.

## Unit 6.6 — ground coverage gate: every painted surface holds its grain

### What landed

Pull request #31, commit `TBD`. Unit 6.5 left the grain coverage check naming only three selectors out of 48 that paint a ground. Deleting a grained selector left the check green. A denominator drawn from the set under test cannot find a missing member.

This unit replaces that check with a gate that reads 48 named selectors, classifies each one on three arms, and fails when any go uncovered.

### The population and the arms

The stylesheet holds 48 rules in `src/shell.css` that paint a background colour. The gate examines every one.

Each rule passes on one of three arms. The rule is grained. The painted box is under the feature size of the grain that would apply to it, so the grain cannot be seen. The rule marks meaning, such as a success or bane mark, and texture there would obscure shape.

One declared exception exists: `.die`. Final reading across all 48: 42 grained, 1 excused by size, 4 meaning marks, 1 declared exception, 0 uncovered.

### The octave arithmetic and the size arm

`baseFrequency 0.16` gives a wavelength of 6.25 user units over a 180 unit tile. Each rule's own `background-size` stretches it.

On the page it reads 10.42 px. On a panel it reads 3.13 px. On the table it reads 15.97 by 3.19 px. Both numbers come out of the `--texture-noise` declaration and neither is retyped. The wavelength is `(zoom * baseFrequency * tile) / baseFrequency`, which simplifies to `zoom * tile`. A tile of 180 gives a wavelength of 180 * zoom.

`GRAIN_OCTAVES` describes the die grain in a different generator. This gate does not read it. That choice stays declared.

### Five injections proved red

Each landed and every file was restored by editing the injection back. The SHA-256 of each restored file matches the reading taken before its injection.

1. A grained selector loses its grain — cut `.chart`, the population stays 48, the gate names `.chart`, exit 1
2. A new ground matches no arm — the population rises 48 to 49, the gate names it, exit 1
3. The exception goes stale — grain `.die`, all 48 are covered, the gate fires on staleness alone with `uncovered=0`, exit 1
4. A second exception appears — the count arm fires at `exceptions=2 of 1`, exit 1
5. A zero box no longer excuses a member — delete the grain from `.table` and the gate reads `uncovered=1 [.table at 0.0x0.0 px]`, exit 1

Red proof 5 closed a live hole. The size arm decided "was this drawn" by asking whether any state produced a reading, rather than whether the box had a size. Zero is under every feature size. `.table` lays out at 0 by 0 whenever a run refuses WebGL. This is how the gate runs in CI. The largest surface in the product could lose its grain while the gate stayed green. A reviewer found it and measured it twice.

### A fourth arm was built, measured and deleted

An arm would have excused an element already carrying its own background image. The measurement returned `own_image=0`. No member claimed it. An arm nothing claims reads as coverage it does not give.

### The size arm is declared, not derived

The gate samples states after a throw. The pool draws from `crypto.getRandomValues` under Constraint 7. A tray seed cannot pin it. The arm therefore names its one member, `.st-rule`, one pixel wide in the status line, and asserts both directions. Five runs of the CI command read identically.

### Source and built stylesheets now agree as a subset

The built file holds 54 rules to the source's 48. The minifier drops attribute-selector quotes and rewrites `transparent`. A count would have raised a false alarm forever. The gate reads by name and stays immune.

### A new browser mode and a CI step

`--grounds` runs the gate with no graphics card. It judges no renderer and skips nothing. It asserts that its own refusal of WebGL landed. CI gained one step beside the accessibility walk. Before this, CI ran the accessibility walk and nothing else from the harness, so `--theme` had never gated a merge. CI has since run the gate green on a hosted runner. Cutting one grained selector under the exact CI command gives exit 1.

### A probe constant re-derived across three units

The keyboard walk required the theme panel to hold at least three inner groups. Unit 4.8 set it at 5. The theme collapse re-derived it to 3. The options sheet then removed a legend so the panel holds 2. It is now a named list of the two groups it requires. A group that disappears is named in the failure rather than turning a number by one.

### Twenty-nine more grounds carry the grain

`.die` does not. Graining it deleted every pip because the six face rules own `background-image` and `.pips` sizes every layer. The render caught it and the change was reverted. The reason already sat in a `ponytail:` comment above that rule.

### Reported, not fixed

**Six of the ninety rendered contrast claims paint no pixel at all.** A readout drawn inside a table that carries `hidden` still answers `getComputedStyle`. A check that shipped earlier reports 13.0 to 1 in all six themes for something no player sees. The pixel reading exposed it. This is a defect in that earlier check.

**Eleven of the ninety fall under their floor on the worst pixel.** Four roles account for all eleven: the edge of a die, the edge of a card, the filled button itself, and the edge of a button. Worst reading 2.212 to 1 against a floor of 3. Every resolved colour pair clears its floor. The gate reports and does not judge because the accessibility standard pairs two colours and names no floor for the worst pixel of a texture. Inventing one would be a number this repository chose.

**An owner decision is open.** A filled control in one row measures 2.761 on its worst pixel against a floor of 3, with a resolved pair of 3.890. Three options are priced: accept and state the number, lift that row's accent by about five points of CIE lightness, or exempt filled controls from the grain. The third contradicts the owner's own instruction that no colour stays flat. Do not pick one.

**A flake now has a name.** `shell.the-keyboard-order-after-the-throw` fails about twice in twelve runs. A browser gives a scrollable region its own tab stop. The check classifies zero such stops so it counts one as an authored visit. The middle region only overflows on a large pool. It predates this unit and two agents independently confirmed this unit cannot reach it.

### Validation

| Check | Result |
|---|---|
| `npm run lint` | exit 0 |
| `npm run typecheck` | exit 0 |
| `npm test` | exit 0 over 44 files and 487 tests, branding gate at `hits=0` |
| `npm run build` | exit 0 |
| Branding gate | `files_scanned=160 hits=0` exit 0 |
| `--grounds --no-webgl` | `checks=4 failures=0 skipped=0`, stable over five runs |
| `--theme --hardware` | `checks=12 failures=0` |
| `--table --hardware` | `checks=10 failures=0` |
| `--shell --hardware` | exit 1 on the named pre-existing flake |

### What is open

Nothing of Unit 6.6. It is complete.

## What the owner still owes, across the whole project

Every unit an agent can close is closed. Six items remain and no agent can take one.

1. **Unit 5.3 — the owner gate.** Judge the feel of the finished application on a phone and on a
   tablet. This is one of the two owner judgements the plan allows.
2. **The phone performance reading.** Open the application on a phone, turn `sheet-overlay` on,
   roll, and paste the four figures into this file. CI cannot measure a real frame rate.
3. **The screen-reader run.** One roll and one push with a screen reader. Unit 4.11 gated the
   keyboard half in CI. The screen-reader half was deferred to Unit 5.3 by the plan.
4. **The spreadsheet pivot.** Export a campaign-sized log, open the CSV in a spreadsheet, pivot it
   by dice type and by push count, and re-import it.
5. **The import cap decision — `BLOCKED:budget`.** Raised at Units 4.5 and 4.6. A full-buffer
   export leaves very little room a row under the import cap. The arithmetic and three priced
   options sit under the heading that names this token in this file. Do not pick one for the owner.
6. **Unit 5.4 — the custom subdomain.** Optional. It needs one DNS record.

`docs/release-checklist.md` carries the same list, beside the commands.
