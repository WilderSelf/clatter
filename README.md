# Clatter

Clatter is a dice roller for pools of dice. A face of 6 or more is a
success. A face of 1 is a bane. The player may then **push**: throw again every die that is neither a
success nor a bane, at a cost.

Clatter is a static web page. It has no server, no account and no back end. It keeps everything in
the browser. The randomness comes from `crypto.getRandomValues`.

## The push

Every existing 3D dice integration hides the kept dice inside the application. Clatter shows them
instead. A player sees what they hold while they decide whether to push and risk their successes.
This visibility is the reason for the project.

The application prices the push before the player commits to it. The cost row states what the push
costs and what unit that cost is paid in. It reads the answer from the rules core.

## What the application does

**Build a pool.** The pool builder holds six dice types: attribute, skill, gear, artifact, bonus and
stress. It runs in two modes. Pool mode counts dice of each type. Step mode rates the attribute and
the skill on two independent ladders of die size. A mode switch clears the built pool, because the
two modes hold different things.

**Roll and push.** One press throws the pool. One press pushes it. A push re-throws only the loose
dice. The kept dice stay where they landed.

**See the dice on a table.** Clatter draws the roll in 3D on a dice tray. A startup probe reads the
platform first. A browser that cannot draw the table gets flat dice instead, and every rule and
every control still works on them. A fall to flat dice is recorded and stays until the player asks
for the table again. A platform below the bar keeps its flat dice, because the switch cannot give
that platform a table.

**Read the push state off the dice.** Each die carries one of three marks. A closed frame means the
rules hold the die and a press does nothing. Four corner blocks mean the player holds the die and a
press releases it. No mark means the die goes back in the cup. Shape carries the state, not colour.

**Hear the dice.** The tray synthesises every sound with the Web Audio API. This repository holds no
audio file and fetches none. The player turns the sound on and sets the level.

**Choose a theme.** Each of three axes takes one choice: the dice colours, the tray surface and the
interface palette. A colour builder makes a dice colour and a page colour of the player's own.

**Keep a log.** Every roll and every push writes an entry to IndexedDB. The history holds three
views: a summary, the record of each roll as a matrix of one row per die, and three statistics with
charts. The statistics are the success rate by pool size, what became of each push, and how often a
push paid off. The log is a ring buffer: it keeps the newest rolls and drops the oldest. The
capacity is `RING_CAPACITY` in `src/log/store.ts`.

**Export and import the log.** The export writes CSV in long format, one row per die per generation,
which pivots in a spreadsheet by dice type and by push count. The import reads that file back. An
import replaces the whole log and refuses a repeated roll identifier.

**Share a roll.** The share card draws the result as an image. The player downloads that image. Where
the browser offers a share target, the player sends the image to it.

**Read the performance.** An overlay reports four figures: frame duration at the 95th and the 99th
percentile, the total of the long tasks, and the time from the throw to the first motion. The
overlay reports and never gates.

**Work offline.** A service worker precaches the application on the first visit. The application then
loads with the network disabled. A web manifest and two icons make it installable.

**Say what went wrong.** One surface tells the player what failed, what it cost and what to do next.
It prints no column name and no identifier.

**Reach every control from the keyboard.** One journey from an empty pool to a pushed result needs no
pointer. Each roll result reaches a live region. Success and bane are marked by shape as well as by
colour.

## How to run it

Run `npm ci` to install the dependencies. Then run `npm run dev` to start the development server.

`base` in `vite.config.ts` is `/clatter/`, so the development server answers at
`http://localhost:5173/clatter/`. A URL without that path returns a blank page.

## How to build it

Run `npm run build`. The build writes `dist/`. Run `npm run preview` to serve that output.

## How to check it

Run these four commands:

- `npm run lint` checks the code style.
- `npm run typecheck` checks the types.
- `npm test` runs the unit tests, the branding gate and the gate's own tests.
- `npm run build` builds the application and checks the precache coverage.

`npm test` drives no browser. It runs Vitest over the source, then the `node --test` suites for the
branding gate and for the harness matchers, then the branding gate itself.

Two more checks run outside that list:

- `node scripts/check-bundle-size.mjs` measures the built bundles against `budgets.json`.
- `npm run perf` runs the tray physics with no renderer and counts the steps to rest against
  `budgets.json`.

Every budget lives in `budgets.json`. Read the numbers there. This file states none of them.

## The browser harness

`node scripts/browser.mjs` drives the application in a real browser. It is a separate harness and it
is not part of `npm test`. One flag names each mode. Read the header of that file for the list.

The 3D tray needs a graphics card. Name `--hardware` for a machine that has one, or `--no-webgl` for
a machine that does not. The `--a11y` mode refuses to run until one of those two flags declares what
the machine can draw.

## Licence

Clatter is licensed under the MIT License. See `LICENSE`.

The tray code under `src/tray/vendor/` is third-party MIT software. It is a copy, not a dependency.
See `src/tray/vendor/LICENSE` for the vendor's own notice.
