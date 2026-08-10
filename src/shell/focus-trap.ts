// The Tab key inside a modal dialog.
//
// `aria-modal="true"` is a promise made to a screen reader alone: it tells the
// reader to ignore everything outside the dialog. It tells the Tab key nothing.
// A dialog that carries the attribute and lets Tab walk out behind it is
// therefore a dialog whose reader and whose keyboard disagree, which is worse
// than either one alone. The disclosure sheet carried that disagreement from
// Unit 2.1 to Unit 4.10, and seven units added controls behind it in that time.
//
// This module answers one question — which elements inside a container the Tab
// key reaches, in order — and `wrapFocus` moves the focus when a press would
// leave. It names `Element` and `HTMLElement`, so it is screen code and never
// rules code: Constraint 3 binds `src/rules/`, and nothing here is imported
// from there.
//
// **The enumeration is a claim about the browser, and the browser checks it.**
// `node scripts/browser.mjs --a11y` walks the open sheet with real Tab presses
// and compares the browser's own order against `focusStops`, so a rule stated
// here that the browser does not follow turns that run red rather than sitting
// as a comment.

/**
 * The selector of every element that may hold a tab stop.
 *
 * `tabindex="-1"` is excluded by the filter below rather than by the selector,
 * because the attribute selector cannot read a computed value.
 */
const CANDIDATES =
  'a[href], button, input, select, textarea, summary, [tabindex], audio[controls], video[controls]';

/**
 * True when a radio button is the one its group hands the tab stop to.
 *
 * Sequential focus navigation treats a radio group as one stop: the checked
 * radio takes it, and where the group holds no checked radio the first one
 * does. A trap that walked every radio would put stops where the browser puts
 * none, and the two orders would then disagree at the ends, which is where a
 * trap is decided.
 */
function radioTakesTheStop(radio: HTMLInputElement, root: Element): boolean {
  if (radio.name === '') return true;
  const group = [...root.querySelectorAll<HTMLInputElement>('input[type="radio"]')].filter(
    (each) => each.name === radio.name && !each.disabled,
  );
  const checked = group.find((each) => each.checked);
  return checked === undefined ? group[0] === radio : checked === radio;
}

/**
 * Every element inside `root` that the Tab key reaches, in document order.
 *
 * A hidden element takes no stop. `offsetParent` is the reading a browser
 * gives, and jsdom lays nothing out, so `hidden` and `display: none` are read
 * off the attribute and the inline style instead. The sheet hides nothing by
 * stylesheet, which is why that is enough here and is stated rather than
 * assumed.
 */
export function focusStops(root: Element): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(CANDIDATES)].filter((element) => {
    if (element.tabIndex < 0) return false;
    if (element.closest('[hidden]') !== null) return false;
    if (element.hasAttribute('disabled')) return false;
    if (element.getAttribute('aria-hidden') === 'true') return false;
    if (element instanceof HTMLInputElement && element.type === 'radio') {
      return radioTakesTheStop(element, root);
    }
    return true;
  });
}

/**
 * Where a Tab press inside a modal must send the focus, or null to let the
 * browser do what it would have done.
 *
 * The answer is a wrap at each end and nothing anywhere else, so a press in the
 * middle of the dialog costs nothing and behaves exactly as the browser does.
 * A focus that is not inside the dialog at all is sent back in, which is the
 * case a click on the scrim and a stray programmatic focus both produce.
 */
export function wrapFocus(
  root: Element,
  active: Element | null,
  shiftKey: boolean,
): HTMLElement | null {
  const stops = focusStops(root);
  if (stops.length === 0) return null;
  const first = stops[0] ?? null;
  const last = stops[stops.length - 1] ?? null;
  if (active === null || !root.contains(active)) return shiftKey ? last : first;
  if (shiftKey && active === first) return last;
  if (!shiftKey && active === last) return first;
  return null;
}
