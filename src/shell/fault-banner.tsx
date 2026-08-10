// The one error surface — Unit 4.10.
//
// Decision 19 of `docs/design/0012-settled-decisions.md` settles the shape: a
// banner at the head of the middle region, on the roll flow and in the history
// destination, holding one row per slot and no control.
//
// Three properties the code has to keep, and each one is measured:
//
//   1. **Every row is in the document from the first paint, with no text.** A
//      live region built at the moment it fills is announced by some readers
//      and not by others. Unit 3.7 measured that with the flat-dice notice, and
//      this file keeps its element and its name.
//   2. **The banner holds no tab stop.** Both keyboard walks of section 6 of
//      `docs/design/0002-screen-design.md` are fixed at eleven visits and
//      thirty-five. A control that appeared with a fault would move them. Every
//      recovery route is therefore a control that already exists, and the row
//      names it.
//   3. **A refusal quotes nothing the player did not write, and it is drawn as
//      text.** Constraint 8. A malformed import can carry hostile text, and
//      Preact sets a JSX child through `textContent`, so no parser sees it.
//      Nothing in this file names `innerHTML` or `dangerouslySetInnerHTML`.

import type { Fault, FaultSlot } from './faults';
import { FAULT_SLOT_ELEMENT, FAULT_SLOTS } from './faults';

/**
 * One row of the banner.
 *
 * An empty row holds no child at all, so it matches `:empty` and the stylesheet
 * takes its height away. A row holding two spans would not.
 */
function FaultRow({ slot, fault }: { slot: FaultSlot; fault: Fault | null }) {
  return (
    <p
      class="fault"
      data-el={FAULT_SLOT_ELEMENT[slot]}
      data-fault={fault === null ? '' : fault.kind}
    >
      {fault === null ? (
        ''
      ) : (
        <>
          {fault.what}
          {fault.next === null ? null : <span class="fault-n"> {fault.next}</span>}
        </>
      )}
    </p>
  );
}

/**
 * The banner.
 *
 * `drawn` is one entry per slot, in slot order, which `faultsOf` builds. The
 * row count on the screen is therefore the slot count and never the fault
 * count, which is what bounds the surface on a phone.
 */
export function FaultBanner({ drawn }: { drawn: readonly (Fault | null)[] }) {
  return (
    <section class="faults" data-el="fault-banner" role="alert" aria-label="Problems">
      {FAULT_SLOTS.map((slot, at) => (
        <FaultRow key={slot} slot={slot} fault={drawn[at] ?? null} />
      ))}
    </section>
  );
}
