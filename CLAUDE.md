# Clatter — repository instructions

This file loads into every session. It carries the constraints an agent must hold, copied
verbatim from the approved plan at `~/.claude/plans/clatter.md`. Read `LEDGER.md` for unit
state — never this file, and never the plan.

---

## COMMANDER'S INTENT

### Purpose

Give a player at the table a dice roller that feels like real dice and is obvious to use. It must be
faster than picking up the physical dice, and it must never make the player think about the app.

The mechanic the app serves is a pool of dice where sixes are successes, and where the player may then
**push** — pick up the dice that are neither a success nor a bane and throw them again, at a cost. The
push is the interesting decision in the system. Every existing tool renders it badly, and the standard
3D integration hides the kept dice entirely, so a player cannot see what they kept. Clatter shows the
kept dice sitting on the table while the rest go back in the cup.

Clean and physical are the goals. The push is where they matter most.

### Method

Build a static web page. Own the randomness in plain code, then hand the already-decided result to a
3D physics layer that acts it out. This keeps the rules correct when the 3D layer is absent, slow or
broken, and it lets the rules be tested without a browser.

Model the rules as data, not as branching code. Each dice type carries two tables — which face values
lock, and how a face converts to successes. Each ruleset carries a push profile. A new variant is a
new row, never an edit to a resolver.

Settle the layout with the owner before building the interface. Ship a usable flat-dice app early, so
the owner reacts to a real thing in week one. Replace the dice underneath afterwards.

Copy the 3D library into the repository and patch it. Do not depend on it. Three separate reasons
force this and they are all measured — see Unit 3.0.

**This is the intended approach, not a fixed instruction.** If it fails, keep the purpose, the end
state and the constraints. Change this.

### Key tasks

1. An approved screen design, then a deployed app the owner can roll and push on, before any 3D work.
2. A rules core with no browser dependency: both engine forks, six dice types, configurable push
   profiles, testable from the command line.
3. A dice tray that shows a predetermined result and re-throws a named subset while the rest stay put.
4. A push affordance on the dice themselves, with three visible states.
5. A cost readout visible **before** the player commits to the push.
6. Themes across three independent axes, plus a colour builder.
7. A roll log that survives a campaign, exports to a spreadsheet, and shows its own statistics.

### End state

Every item is checked by something that runs. Owner judgement appears exactly twice and is labelled.

- **Rules.** For each shipped profile, a property test over 20 seeds × 10,000 rolls holds the measured
  success and bane rates inside a binomial bound computed in the test, with no hard-coded epsilon. The
  set of dice a push re-rolls equals an independently computed set, asserted by counting draws from an
  instrumented random source. A logged roll replays exactly from its seed and its stored profile.
- **Performance — deterministic gates, no timing.** Initial JavaScript ≤ 60 KB gzipped. The lazy 3D
  chunk ≤ 200 KB gzipped. Steps-to-rest for a fixed seed and scene stays under a recorded bound. Draw
  calls, triangles and texture count after one frame of a twelve-die scene stay under recorded bounds.
  All four numbers live in `budgets.json` and are read by the checks, never retyped in prose.
- **Performance — reported, on real hardware.** p95 frame duration ≤ 20 ms and throw-to-first-motion
  ≤ 150 ms, measured by an in-app overlay on the owner's own phone, once per phase, pasted into the
  ledger. This is the only honest measurement of a mid-range phone this project will ever have.
- **Fallback.** With the 3D chunk blocked at the network layer, every rule and every affordance still
  works. Asserted by a driven-browser run with the chunk blocked.
- **Branding.** A gate scans every tracked file, every file in `dist/`, every commit message in the
  pull request, and the repository description and topics. It matches against **hashed** terms, so no
  trademark enters the repository. It has been proven to fail on each of those four surfaces. It
  prints the number of files scanned, and CI fails if that number is below an independent count.
- **Export.** A campaign-sized log exports to CSV without a long task over 50 ms, opens in a
  spreadsheet, pivots by dice type and push count, and re-imports to an identical log.
- **Accessibility.** A scripted keyboard-only run visits a fixed list of named elements in order, from
  empty pool to pushed result. Every roll result reaches a live region. Success and bane are marked by
  shape as well as colour.
- **Owner judgement, twice only.** The screen design at Unit 2.0. The feel of the finished app on real
  hardware at Unit 5.3.

### Constraints — these do not bend

1. **No branding, ever.** No publisher name, no game title, no engine name, no setting term, no logo,
   no reproduced dice-face art, and no reproduced dice **colour convention**, which is closer to trade
   dress than to rules. This covers code, comments, commit messages, filenames, package metadata,
   repository description and topics, and the built output. Do not add a "not affiliated with"
   disclaimer — writing one requires naming the publisher, which is the thing being avoided.
2. **Never copy from a GPL-3.0 source.** Two of the best reference implementations are GPL-3.0. Their
   data model is a design idea and gets reimplemented. No file, function or comment is copied.
3. **The rules core never imports a browser API.** No `window`, no `document`, no DOM, no module-level
   mutable state. It runs under a plain test runner.
4. **The app stays a static site.** No server, no database, no accounts, no runtime network call.
5. **Budgets live in `budgets.json`.** Checks read that file. Prose points at it. A budget number
   retyped into prose is a cache with no invalidation. If a budget cannot be met, price the options
   and hand the choice to the owner. Never widen a budget to make a check pass.
6. **Accessibility ships inside each unit**, not in a later sweep.
7. **Randomness comes from `crypto.getRandomValues`**, through a rejection-sampling mapper with no
   modulo bias. A seeded source is injected in tests only. Never `Math.random()` in shipping code.
8. **No `innerHTML` with user-supplied text.** Theme names, pool names, complication text and log
   notes are all user-editable and all rendered.

### Decision authority

**Decide alone, do not ask:** file and module layout, internal naming, test structure, CSS approach,
animation timing, interface wording, choosing a small utility over hand-rolled code, and any refactor
that keeps the end state true.

**Stop with a `BLOCKED:` token and ask the owner when:**
- `BLOCKED:arch-decision` — Unit 3.0 returns no-go, or any architectural fork the plan did not settle.
- `BLOCKED:budget` — a required feature and a budget in `budgets.json` genuinely conflict. Price both,
  hand the decision back, do not pick.
- `BLOCKED:legal` — any branding or licensing question not obviously settled by Constraint 1.
- `BLOCKED:dependency` — a new dependency over 10 KB gzipped, or unmaintained, or not MIT/BSD/Apache.
- `BLOCKED:owner-gate` — a unit needs owner judgement. Only Units 2.0 and 5.3 should ever hit this.

**Report and continue, do not ask:** a unit that shipped smaller than planned, a check that could not
be made to fail, or a measured number that misses a budget. Write it plainly in the ledger row.

### Main effort

Units 3.0 to 3.4 — vendoring the dice library and making the subset re-throw correct on the table.
This is the project's bid for success.

If effort must be traded, trade it from the statistics view, then CSV import, then the share card.
**Themes and interface quality are not tradeable.** They are owner requirements, not polish.

---

## Legal position — read before writing a line

The reference document's licence covers print, PDF and virtual-tabletop modules, and **excludes video
games**. A standalone app is at best outside that grant. Its notice clause is unconditional: a
licensee **must** name the publisher. Taking the licence and having zero branding are mutually
exclusive.

So Clatter **does not take the licence and does not use the document**. Rules and procedures are
systems of operation and are not protected by copyright. Only expression is. This is how
system-agnostic dice rollers are normally built.

- Numeric mappings are safe. "This face yields this many successes" is a fact about a procedure.
- Prose is not. Write every complication, condition and help string fresh.
- Functional vocabulary is fine: success, bane, push, pool, step die, gear die, artifact die, stress.
- Product names, publisher names, engine names and setting terms are forbidden everywhere, including
  metadata and search keywords.
- Do not write "compatible with" anything.

The residual risk is trademark and takedown, not copyright. A complaint does not have to succeed to
take a public repository dark. That is why the term list is hashed rather than stored in plaintext.

*This is a reasoned position, not legal advice. Revisit it if Clatter ever earns money.*

---

## Explicitly out of scope

Named so no agent builds them, and so adding one later is a decision rather than drift.

- Accounts, sync, shared rooms, live multiplayer.
- Character sheets. Clatter holds a stress counter and nothing else. Health, conditions, gear ratings
  and injuries are reported as numbers for the player to apply themselves.
- Initiative, combat resolution, damage, armour, ammunition, supply, injury tables.
- Opposed rolls. The rules model describes them; the interface does not implement them.
- A mobile store build. A store listing forces a publisher-identifiable category and reopens the whole
  legal question.

---

## Roster mapping

| Work | Agent | Why |
|---|---|---|
| Phase 1 rules core, Units 3.0–3.4 | `implementer`, opus/high | Correctness compounds here. |
| Table-driven test bulk, fixtures, Phase 4 form work | `assistant`, sonnet/medium | Careful but mechanical. |
| Ledger rows, README, the original complication text | `scribe`, haiku/low | Prose and bookkeeping. |
| Every pull request | `reviewer`, opus/high | Add a repository-local `.claude/agents/reviewer.md` with two named duties: no forbidden token in the diff, and no code copied from a GPL-3.0 source. |

Recovery is a normal `fix:` pull request. The ledger records the revert. Never edit a ledger row to
hide a failure.

---

## Where to find things

- The approved plan, including the unit list and settled decisions, lives at
  `~/.claude/plans/clatter.md`. It is the authorization boundary for `/advance`.
- Unit status lives in `LEDGER.md` in this repository.
- The normative rules model lives in `specs/0001-rules-model.md` in this repository.
- Deterministic performance budgets live in `budgets.json` in this repository.

---

## Sandbox realities for this repository

Bash runs in a bubblewrap sandbox. The sandbox blocks network access and the display sockets.

`npm ci` and `npm install` work inside the sandbox, because `registry.npmjs.org` is an allowed
domain.

`gh` commands and `git push` need a sandbox exception. As of 2026-08-08 the owner has not yet
added `gh *`, `git push*` or `node scripts/browser.mjs*` to `sandbox.excludedCommands` in
`~/.claude/settings.json`. Until they do, every unit from 0.5 onward fails at push or at the
browser. The agent cannot edit that file. It is deny-listed.

`Bash(gh repo edit:*)` is denied, so the repository description and topics are set by the owner,
not by an agent.

`Bash(gh api --method PUT:*)` is denied, but the workspace convention `gh api -X PUT` is a
different string and is allowed. Branch protection is therefore applicable by an agent.

`git status` inside the sandbox reports untracked files that do not exist, because deny-listed
paths are bind-mounted as `/dev/null` character devices. Never gitignore or delete such a path.
A clean-tree check means nothing unless it runs with the sandbox disabled.

---

## Writing style

Commit subjects, commit bodies, pull-request bodies, README text, error messages and every
user-facing string go through Simplified Technical English: active voice, one instruction per
sentence, no contractions, no semicolons, no marketing adjectives. This does not apply to code or
identifiers.
