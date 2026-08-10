// Making one card — Unit 4.9.
//
// One call, one card. It reads the roll on the table, draws one fresh frame
// through the tray, lays the summary over that frame **in the same task**, and
// answers the bytes. Nothing here decides a rule and nothing here is
// asynchronous: `captureTrayJpeg` is synchronous on purpose, and the overlay it
// is given must be too.
//
// It lives beside the panel rather than inside `src/app.tsx`, so the whole act
// can be driven from a test with a tray of its own.

import type { DiceBox } from '../tray/vendor/dice-tray.js';
import { captureTrayJpeg } from '../tray/capture';
import type { InterfacePalette } from '../theme/themes';
import { cardFileName } from './download';
import type { ShareCard } from './share-card';
import {
  bytesOfDataUrl,
  drawShareCard,
  layoutShareCard,
  mediaTypeOfDataUrl,
  shareCard,
} from './share-card';
import type { AppState } from './state';

/** Why no card was made. Both are states the player can leave. */
export type ShareRefusal = 'noRoll' | 'flatDice';

/** The card the last press made. */
export interface MadeCard {
  /** The JPEG, as the data URL the encode answered. */
  readonly url: string;
  /** The same readings in words, for a reader who meets no picture. */
  readonly alt: string;
  readonly filename: string;
  /** The bytes, as the download and the share target both take them. */
  readonly file: File;
  /** What the card says, so a check reads the summary back off the roll. */
  readonly summary: ShareCard;
}

export type MakeCardOutcome =
  | { readonly kind: 'made'; readonly card: MadeCard }
  | { readonly kind: 'refused'; readonly reason: ShareRefusal };

/**
 * Make one card.
 *
 * `box` is the tray the application mounted, or `null` where the dice are drawn
 * flat. A card is a picture of the table, so the flat renderer is refused by
 * name rather than answered with a card of nothing.
 */
export function makeShareCard({
  state,
  box,
  palette,
  traySurface,
  at,
}: {
  state: AppState;
  box: DiceBox | null;
  palette: InterfacePalette;
  /** The tray surface in force. The renderer clears to transparent. */
  traySurface: string;
  at: Date;
}): MakeCardOutcome {
  const summary = shareCard(state);
  if (summary === null) return { kind: 'refused', reason: 'noRoll' };
  if (box === null) return { kind: 'refused', reason: 'flatDice' };
  const url = captureTrayJpeg(box, {
    surface: traySurface,
    // Synchronous, and inside the task that drew the frame and copied it.
    overlay: (context, size) =>
      drawShareCard(context, layoutShareCard(summary, size.width, size.height), palette),
  });
  const filename = cardFileName(at);
  const file = new File([bytesOfDataUrl(url)], filename, { type: mediaTypeOfDataUrl(url) });
  return { kind: 'made', card: { url, alt: summary.alt, filename, file, summary } };
}
