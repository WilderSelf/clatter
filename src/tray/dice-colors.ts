// One colour per dice type, so a player tells an attribute die from a gear die
// without reading it.
//
// The tray draws every die face on one neutral base — a white body, black ink
// and a grey outline — and then multiplies the whole die by the colour of its
// type. Three.js multiplies `material.color` into the face texture, so the
// colour below is exactly the body colour a player sees, and the ink stays
// black whatever the colour is. Nothing here is baked into a texture, so the
// six colours cost no extra texture and a theme re-tints by replacing this
// table.
//
// Accessibility, Constraint 6. Colour is not the only carrier. The six colours
// form a lightness ladder: sorted by CIE L*, no two are closer than 8 L*, which
// is about five times the difference an eye reads on a large area. A player who
// cannot separate two of the hues still reads six shades, and a greyscale copy
// of the tray still separates them. `dice-colors.test.ts` measures the ladder,
// the ink contrast and the contrast against the tray surface, and it computes
// every one of those numbers from the hex values below rather than reading them
// from here.
//
// Themes are three independent axes and they arrive at Unit 4.8. This is the
// per-type axis only.

import type { DieType } from '../rules/die';

/**
 * The neutral base every die face is drawn on, passed to the library as a
 * custom colour set.
 *
 * The body must stay white. The library bakes the body colour into the face
 * texture and the renderer multiplies the type colour into it, and a multiply
 * can only darken. A tinted base would therefore cap the gamut: against the
 * `bone` set this repository shipped at Unit 3.1, a cool colour loses its blue
 * and comes out as bone again.
 */
export const TRAY_BASE_COLOR_SET = {
  name: 'blank',
  background: '#FFFFFF',
  foreground: '#000000',
  outline: '#B4B4B4',
  texture: 'none',
} as const;

/**
 * The colour of each dice type. Sorted by lightness: stress is the darkest and
 * attribute the lightest.
 *
 * The hues are picked for the ladder, not from any published set. A reproduced
 * dice colour convention is closer to trade dress than to rules, so Constraint 1
 * forbids one.
 */
export const DIE_TYPE_COLOR: Record<DieType, string> = {
  stress: '#C64E3D', // red, L* 49
  artifact: '#A977CF', // violet, L* 58
  gear: '#68AAE2', // steel blue, L* 67
  skill: '#91CA83', // green, L* 76
  bonus: '#F3D183', // amber, L* 85
  attribute: '#EFEFEA', // ivory, L* 94
};
