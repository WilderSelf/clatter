---
name: run-clatter
description: Drive Clatter in a real browser. Use it to run the dev server, to run the browser harness, to capture the canvas, and to read a die centroid or a die up-face from the tray. Also use it before any timing claim or any renderer claim, because a sandboxed run is software-rendered.
---

# Run Clatter in a browser

One entrypoint drives the browser: `scripts/browser.mjs`. It is the single command the owner
allow-lists. Do not add a second script.

```sh
npm run browser -- [options]        # same as: node scripts/browser.mjs [options]
```

## The dev server

The harness needs no server for its own self-test. It builds a synthetic page in memory.

To drive the real application, start the server first and pass its address:

```sh
npm run dev                                     # Vite, http://localhost:5173/clatter/
npm run browser -- --url http://localhost:5173/clatter/
```

`base` in `vite.config.ts` is `/clatter/`, so the path carries the repository name. A URL without
that path returns a blank page.

To drive the built output instead:

```sh
npm run build && npm run preview
```

## Run modes

| Mode | Command | What it judges |
|---|---|---|
| ordinary | `npm run browser` | It reports the renderer and does not judge it. Correctness work. |
| hardware | `npm run browser -- --hardware` | It fails when the renderer names a software rasteriser, and it fails when the renderer cannot be read. |

Every timing number and every renderer claim needs a hardware run. An ordinary run proves
correctness only.

The harness reads `UNMASKED_RENDERER_WEBGL` and matches it against known software rasterisers:
llvmpipe, softpipe, swrast, lavapipe, Mesa OffScreen, SwiftShader, Microsoft Basic Render Driver,
and the generic "software renderer" names. An empty or unreadable name fails a hardware run.
Unknown is not the same as good.

## Sandbox realities

Bash runs in a bubblewrap sandbox. The sandbox hides `/dev/dri` and the display sockets.

- **A sandboxed run gets no WebGL context at all.** Firefox reports
  `FEATURE_FAILURE_WEBGL_EXHAUSTED_DRIVERS`. The renderer reads as unreadable, so a hardware run
  inside the sandbox fails by design. This is correct behaviour, not a fault of the harness.
- **A hardware run needs the sandbox exclusion.** The owner adds `node scripts/browser.mjs*` to
  `sandbox.excludedCommands` in `~/.claude/settings.json`. An agent cannot edit that file.
- **A sandboxed run is fine for correctness work.** The helpers, the canvas capture and the frame
  sample all work inside the sandbox. Only the renderer claim and the timing claims do not.
- **Start the dev server in the same Bash call as the harness.** The sandbox gives each Bash call
  its own network namespace, so a server started in an earlier call answers
  `NS_ERROR_CONNECTION_REFUSED`. Measured on this host on 2026-08-09.
- **The driver turns the proxy off** through `network.proxy.type`. Firefox reads the system proxy
  by default, and the sandbox proxy asks for a user name and a password, so a sandboxed run used to
  stop at a modal prompt instead of loading the page.

Measured on this host on 2026-08-09:

| Run | Renderer | Exit |
|---|---|---|
| Hardware, sandbox on | unreadable, no WebGL context | 1 |
| Hardware, sandbox off | `AMD Radeon RX 6700 XT (radeonsi, navi22, ACO, ...)` | 0 |
| Hardware, sandbox off, `--force-software` | `llvmpipe (LLVM 22.1.8, 256 bits)` | 1 |

## Options

| Option | Default | Purpose |
|---|---|---|
| `--hardware` | off | Judge the renderer. Fail on software and on unreadable. |
| `--force-software` | off | Launch with the Mesa software rasteriser. Red-proves the renderer check. |
| `--url <url>` | none | Drive a served page instead of the synthetic scene. |
| `--sample-ms <n>` | 1000 | The frame-sample window. |
| `--min-frames <n>` | 30 | The frame-count floor. |
| `--capture <path>` | none | Write the canvas PNG to a file. |
| `--browser <path>` | `/usr/bin/firefox` | The browser binary. |
| `--tray` | off | Build the fixed twelve-die scene and judge the render counters. Needs `--url`. |
| `--pool` | off | Throw a `RollResult` and read every up-face. Needs `--url`. |
| `--push` | off | Throw a fixture, push it, and judge the kept dice. Needs `--url`. |
| `--probe` | off | Run the startup capability probe and report the decision. Needs `--url`. |
| `--context-loss` | off | Force a lost WebGL context and judge the permanent fall. Needs `--url`. |
| `--reduced-motion` | off | Throw one pool twice, tumbling and skipped, and compare the faces. Needs `--url`. |
| `--sound` | off | Throw twice, silent then sounded, and judge the sound engine. Needs `--url`. |
| `--shell` | off | Walk the screen with real Tab and arrow presses, and capture the three widths. Needs `--url`, and the url must be a preview server over `dist/`. |
| `--capture-shell <dir>` | none | `--shell` only. One PNG per width, named `shell-builder-<w>x<h>.png`. |
| `--blocked-chunk` | off | Block the lazy 3D chunk at the network layer and judge the fall to flat dice. Needs `--url`, and the url must be a preview server over `dist/`. |
| `--capture-before <path>` | none | `--push` only. The frame before the push. |
| `--offset-kept <n>` | none | `--push` only. Move kept die `n` by 3 px, to red-prove the kept-die check. |
| `--viewport <w>x<h>[@dpr]` | `800x600` | The window the scene is built in. |

The three scenes are separate runs. `--pool` asks the rules core for one die of every type and every
face count, acts the result out through `src/tray/throw.ts`, and reads the face pointing up off each
body quaternion. It prints the compared count beside the pool size.

`--pool` judges the picture with two separate checks, and they answer two different questions.
`pool.every-die-shows-its-own-surface` counts how many dice show a pixel the camera meets first,
against the whole pool. A die buried under the heap fails it, and that is a tray finding.
`pool.colour-separates-the-types` asks whether each visible die reads as its own type. It compares
in chromaticity, so a die in shadow keeps its hue. It reports the compared count against the visible
count, and it fails when the two part or when nothing is visible.

```sh
npm run browser -- --hardware --url http://localhost:5173/clatter/ --pool \
  --viewport 1440x900 --capture /tmp/pool.png
```

`--push` throws a fixture of eight dice, four of which lock by rule, pushes it through
`src/rules/push.ts`, and acts the answer out through `pushPool`. It projects every kept die to a
screen-space centroid before and after, and it asserts that each delta is under 1 px against the
count the core reports as locked. It reports how far the pushed dice travelled and never gates on
that distance, because a die 328,000 units off the table still moves a plausible number of pixels.
The gate is that every body is asleep and inside the tray walls.

```sh
npm run browser -- --hardware --url http://localhost:5173/clatter/ --push \
  --viewport 1440x900 --capture-before /tmp/before.png --capture /tmp/after.png
```

`--probe`, `--context-loss` and `--reduced-motion` come from Unit 3.7. `--probe` reads WebGL2,
device memory, core count and `canvas.toBlob`, then reports the decision. Run it inside the sandbox
as well: there is no WebGL context there, and the probe must answer with a fall to flat rather than
throw. `--context-loss` forces a loss through `WEBGL_lose_context` and asserts that the stored flag
moved from false to true. `--reduced-motion` throws one pool twice from one seed and asserts the
faces match, with the frame count of each throw as the evidence that the skip landed.

```sh
npm run browser -- --hardware --url http://localhost:5173/clatter/ --context-loss
```

`--sound` comes from Unit 3.6. It throws the fixed twelve-die scene twice, once with sound off and
once with it on, and counts the collisions itself off the tray's `onImpact` hook and off the
world's own `beginContact` event. It asserts that no `AudioContext` is built until the player turns
sound on, that the engine starts no voice while collisions are still arriving, that the outcomes the
engine reports add up to the collisions it was handed, that a user gesture starts the audio clock,
and that a level of zero renders a peak of exactly zero. The plan words this unit as "no audio file
loads", which is true of any build here, because every sound is synthesised and the repository holds
no audio file.

```sh
npm run browser -- --hardware --url http://localhost:5173/clatter/ --sound --throw-seed 5
```

`--shell` comes from Unit 2.1. It is the browser half of the keyboard order. It reads the
before-throw list out of section 6 of `docs/design/0002-screen-design.md`, walks the screen with
real Tab and arrow presses, and compares the two. `src/app.test.tsx` asserts the same list under
jsdom, which runs no sequential focus navigation and enumerates the tab stops itself, so this mode
is the half that presses the key. It builds the drawn pool by pressing the plus ends and it reads
the live region back. It starts and stops its own preview server, so build first and run it alone.

```sh
npm run build
npm run browser -- --shell --url http://localhost:4173/clatter/ --capture-shell /tmp
```

A browser gives a scrollable box a tab stop of its own, so a keyboard can scroll a region that
holds no control. The run reports such a stop by name and does not count it against the authored
list. The drawn screen earns the same stop.

`--blocked-chunk` comes from Unit 3.7 and is that unit's acceptance. It refuses the lazy 3D chunk at
the network layer and then asserts that every rule and every affordance still works on the flat
dice. It starts and stops its own preview server, so build first and run it alone.

```sh
npm run build
npm run browser -- --blocked-chunk --url http://localhost:4173/clatter/
```

Two stores can answer a blocked request and the run closes both by measurement. Unit 5.1 precaches
the chunk, so the run unregisters the service worker and deletes Cache Storage, and it reads both
counts before and after. Firefox refuses `request.abort()` once a worker owns the request, so every
refused abort is counted and a refusal fails the run. The service worker and its registration
script are blocked with the chunk, so no worker can install again during the run.

**Run it outside the sandbox.** The screen asks for the chunk only where the startup probe clears
the bar, and there is no WebGL context inside the sandbox. The run still exercises the rules and the
affordances there, and it prints `blocked-chunk.the-chunk-was-refused` as `NOT JUDGED`, counted in
the `skipped=` figure of the summary line.

Exit 0 when every check passed, 1 when a check failed, 2 on a usage error.

## The frame-count floor

The harness counts animation frames over the sample window and asserts the count against
`--min-frames`. A run that captured four frames cannot report a statistic. A short sample goes red
and the failure names the floor and the count:

```
browser: FAIL frame-count-floor sampled 3 frames over 30 ms against a floor of 30.
```

## Canvas capture

```sh
npm run browser -- --url http://localhost:5173/clatter/ --capture /tmp/tray.png
```

`captureCanvas(page, selector)` returns the PNG bytes of one element. The default selector is
`canvas`.

## The three shared helpers

Units 3.3, 3.4 and 4.9 read the tray through these. Import them from `scripts/browser.mjs`.

```js
import { installHelpers, readDieCentroid, readUpFace, captureCanvas } from './browser.mjs';
```

`installHelpers(page)` copies the two page-side helpers into the page as `window.__clatter`. Call it
once per page, then call the helpers inside `page.evaluate`, where the physics bodies live.

| Helper | Input | Output |
|---|---|---|
| `readDieCentroid` | `{ position, viewProjection, viewport }` | `{ x, y }` in CSS pixels, y down |
| `readUpFace` | `{ quaternion, faceNormals }` | `{ value, up }` for the face nearest to +y |
| `captureCanvas` | `page`, `selector` | PNG bytes |

`viewProjection` is 16 numbers, column-major, as three.js stores a matrix:
`camera.projectionMatrix * camera.matrixWorldInverse`. `viewport` is the canvas bounding rectangle.
`quaternion` is `[x, y, z, w]`, as cannon-es stores one. `faceNormals` pairs each face value with
its body-space outward normal.

There is no 3D tray yet, so an ordinary run proves the helpers against a synthetic scene: four known
positions with screen positions derived by hand from the pinhole relation, and five known
quaternions with up-faces derived by hand from the rotation each one names. Each self-test prints
its own denominator.

## The driver

`scripts/browser-driver.mjs` is the only file that names a browser automation library. It runs
`puppeteer-core` against `/usr/bin/firefox` over WebDriver BiDi. Change that one file to swap the
driver. Every caller uses `page.setContent`, `page.goto`, `page.evaluate` and `page.$`, which
Playwright spells the same way.

The driver allows a software WebGL context on purpose. A browser that refuses one reports no
renderer name at all, and the harness needs to read the name to fail on it.
