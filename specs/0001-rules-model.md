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

## The step ladder — enumerated, not procedural

Prose rules about stepping the lower die up and the higher die down are path-dependent, and `+2` then
`−1` would not reliably equal `+1`. Replace them with an ordered list of eight states:

```
0: d6            4: d10 + d8
1: d6 + d6       5: d10 + d10
2: d8 + d6       6: d12 + d10
3: d8 + d8       7: d12 + d12
```

A modifier is an index offset clamped to `[0,7]`. The ceiling and the floor become the ends of the
list. Reversibility is true by construction. The test is the full table: 8 states × 7 offsets from −3
to +3 = **56 cases**, a counted denominator, plus a round-trip assertion.

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
