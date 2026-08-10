# Rules model

Normative. Copied from the plan's "Rules model" section. Numbers only — every string in the app
is written fresh. A reviewer checks tests against this file.

## Dice types

| Type | Faces | Locks on push | Success table | A 1 costs |
|---|---|---|---|---|
| attribute | 6, or 6/8/10/12 in step mode | successes and 1s | per faces | yes — the primary cost |
| skill | 6, or 6/8/10/12 in step mode | successes only | per faces | no |
| gear | 6 | successes and 1s | 6 → 1 | yes — reduces that gear's rating |
| artifact | 8, 10, 12 — **always step dice, in both modes** | any success | escalating, below | no |
| bonus | 6 | successes only | 6 → 1 | no — inert by design |
| stress | 6 | successes and 1s | 6 → 1 | **yes, and on the first roll too** |

Every row is a default and is overridable in settings. The whole table is data.

`SUCCESS_TABLE` is stored as a per-face array sized to `faces`, generated from the threshold rule. A
test asserts `table.length === faces` for every type and size, which makes an impossible row — a `≥12`
entry on a d10 — unwritable.

## Success curves

- **Pool die (d6):** 6 → 1. Nothing else scores.
- **Step die:** below 6 → 0; 6 to 9 → 1; 10 and above → 2.
- **Artifact die, escalating (default):** ≥6 → 1; ≥8 → 2; ≥10 → 3; ≥12 → 4.
- **Artifact die, flat (toggle):** ≥6 → 1; ≥10 → 2.

Both artifact curves ship. On a d12 the escalating curve averages 4/3 successes against 5/6 for the
flat one, so this is a real setting. Both fractions follow from the thresholds above. The
success-table test computes them, and the model does not store them.

## Step dice — two independent scales

The attribute and the skill carry two independent ratings. Each rating names its own die size, from
6, 8, 10 or 12. Every pair of sizes is therefore expressible, a d12 attribute beside a d6 skill among
them. **No skill is independent as well.** A player with no skill rolls the attribute die alone, at
whatever size the attribute holds.

An earlier draft paired the two sizes on one eight-state list and made a modifier an index offset
into it. That list could express eight pairs of the sixteen, and it tied "no skill" to a d6
attribute. It is withdrawn.

**The reason it was written still holds.** Prose rules about stepping the lower die up and the higher
die down are path-dependent, and `+2` then `−1` would not reliably equal `+1`. This model answers
that reason a different way:

- The base pair is stored, and it never changes when the difficulty changes.
- The difficulty is stored as one integer, from −3 to +3.
- The rolled sizes are a pure function of the base pair and that integer. Nothing computes a size
  from a size it computed earlier.

Reversibility is then arithmetic. `−n` after `+n` leaves the stored integer at zero, so the base pair
comes back whether a size clamped or not. Two modifiers compose into their sum, so `+2` then `−1`
lands where `+1` lands.

### How one modifier splits across the two dice

The split is data. The row is chosen by the modifier alone. The first number is the steps the
lower-rated die takes and the second is the steps the higher-rated die takes. On a tie the attribute
counts as the lower die.

| Modifier | Lower die | Higher die |
|---|---|---|
| −3 | −1 | −2 |
| −2 | −1 | −1 |
| −1 | 0 | −1 |
| 0 | 0 | 0 |
| +1 | +1 | 0 |
| +2 | +1 | +1 |
| +3 | +2 | +1 |

A modifier therefore raises the weaker die first and lowers the stronger die first. Both scales stop
at 6 and at 12. With no skill die the whole modifier falls on the lone attribute die, and no skill
die appears.

**The rule reads the base pair.** A rule that read the sizes it last produced would be
path-dependent, which is the defect above.

### What the test asserts

The test enumerates the whole space: every attribute size, by every skill state including absence, by
every offset from −3 to +3. It counts its own denominator off that enumeration. Over the whole space
it asserts the split table, the round trip, the composition of two modifiers into their sum, and the
clamp at both ends with a count of the cases that clamp.

Gear, artifact, bonus and stress dice are added to a step-dice roll unchanged.

## Generations and the history matrix

A die holds `values: (number|null)[]`, one entry per generation, append-only.

- A locked die **repeats its previous value**, so the matrix stays rectangular.
- A die that first appears at generation *g* — a stress die added mid-roll by profile 5 — carries
  `null` for every generation before *g*. `null` renders blank and emits no CSV row.

## Push profiles

A push profile is a record, not a code path:

```
{ id, label, description,
  lockSuccesses: boolean,
  lockOnesBy: { attribute, skill, gear, artifact, bonus, stress },
  maxPushes: number,
  cost: { source, unit, perUnit },
  stressBehaviour: 'none' | 'addBeforeReroll',
  blockers: [ 'stressOneShowing' ] }
```

**Four presets ship.** They cover four distinct cost models. The override panel exposes every field
above, so any further variant is a data row the user builds — that is what an override panel is for.
Descriptive labels only, never a product name.

1. **Pool — banes damage attributes.** Lock successes and 1s. One push. Each attribute 1 costs one
   point of that attribute and grants one resource point. Each gear 1 reduces that gear by one step.
   Skill 1s inert. Artifact dice never degrade.
2. **Pool — referee gains a point.** Lock successes only. 1s carry no meaning. One push. The referee
   gains one point per push.
3. **Pool — stress dice and complications.** Lock successes only. Stress rises by one **before** the
   re-roll, so the new stress die joins that same push. A 1 on any stress die triggers a complication
   check, including on the first roll. Pushing is blocked once a stress die shows a 1.
4. **Step dice — banes cost health.** Lock successes and 1s. One push. Every 1 still showing after the
   push costs one point, physical or mental according to the attribute rolled.

## Derived values

All computed, never stored **in the live model**: success count, bane count by type, attribute cost,
gear cost, resource points gained, complication triggered, push count, push legality.

**The log is different.** A log entry stores its derived values **and** a hash of the profile that
produced them. Otherwise a later profile edit silently rewrites campaign history, and an
export/re-import equality check still passes because both sides re-derive the same wrong way.

## Other rules

- **Difficulty** is dice added or removed, or die steps. There is no target number. Range +3 to −3.
- **Removal order** for a negative modifier: skill dice first, then gear, then attribute. Zero dice is
  an automatic failure with no roll.
- **Help** adds one die per helper, three helpers maximum.
- **Mode switch.** Changing between pool and step mode discards the built pool and shows the empty
  builder for the new mode. Stated so no agent invents a conversion.
