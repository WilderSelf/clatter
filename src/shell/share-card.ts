// The share card — Unit 4.9, the composition half.
//
// The capture is `src/tray/capture.ts` and it is done. This file says what is
// drawn over that frame, where every mark of it goes, and what a reader hears
// in place of the picture.
//
// **The card decides no rule and derives no reading.** Every number on it comes
// from `readout` and `zonesOf` in `src/shell/state.ts`, which ask the rules
// core. `shareCard` reads them and turns them into words.
//
// **Constraint 1 lands hardest here.** A card is the one artifact of this
// project that leaves the machine and is posted in public. It names the
// application and nothing else: no publisher, no game, no engine, no setting
// term, and no "compatible with". It carries no "not affiliated with" line
// either, because writing one names the publisher. `share-card.test.ts` scans
// every string this file can produce through the branding gate's own tokeniser
// and hash, over a card built from a real roll.
//
// **The panel is opaque, and that is the contrast claim.** Text over a
// photograph answers to whatever the photograph happens to be, and a
// photograph of dice is not a colour anybody chose. So the summary sits on a
// filled panel of the interface palette, and the claim is then the same one the
// stylesheet makes: 4.5 to 1 for text, over all six palettes.
//
// **The layout is data.** `layoutShareCard` returns every run it will draw,
// with the box the run lands in. `drawShareCard` walks that list and draws
// nothing the list does not hold, so an instrument can read the drawn pixels
// back against the run that claims to have made them.

import type { InterfacePalette } from '../theme/themes';
import type { AppState } from './state';
import { readout, zonesOf } from './state';
import { APP_NAME, plural } from './words';

/** One reading of the roll, in the words the card prints. */
export interface CardReading {
  /** The name of the reading. The check enumerates these, so it has a count. */
  readonly key: 'dice' | 'kept' | 'inTheCup' | 'stress' | 'pushes';
  readonly text: string;
}

/**
 * Every reading the card can hold, in the order it draws them.
 *
 * The list is written out here so a reading dropped from `shareCard` is a
 * missing row against a denominator, and never a cell nobody read.
 */
export const CARD_READING_KEYS: readonly CardReading['key'][] = [
  'dice',
  'kept',
  'inTheCup',
  'stress',
  'pushes',
];

/** What the card says. */
export interface ShareCard {
  /** The application, and nothing else about where the card came from. */
  readonly title: string;
  /**
   * The successes and the banes, which are what the roll was for.
   *
   * **They are two lines and not one.** One line of both readings ran past the
   * side of the panel and its last word landed on the photograph, where it was
   * unreadable. Every check was green: the run's BOX fitted the panel, and the
   * text inside the box did not. The card now draws the two apart, and
   * `drawShareCard` measures every run against its box and fits it.
   */
  readonly successLine: string;
  readonly baneLine: string;
  readonly readings: readonly CardReading[];
  /** The same readings in one sentence, for a reader who meets no picture. */
  readonly alt: string;
}

/**
 * The card a roll makes, or `null` while the table is empty.
 *
 * `null` is not a failure. A card is a picture of the dice on the table, so a
 * table with no dice on it makes no card, and the panel says so in words.
 */
export function shareCard(state: AppState): ShareCard | null {
  if (state.result === null) return null;
  const { successes, banes, dice, stress, pushes } = readout(state);
  const zones = zonesOf(state);
  const readings: readonly CardReading[] = [
    { key: 'dice', text: plural(dice, 'die', 'dice') },
    { key: 'kept', text: `${zones.kept.length} kept` },
    { key: 'inTheCup', text: `${zones.loose.length} in the cup` },
    { key: 'stress', text: `stress ${stress}` },
    { key: 'pushes', text: plural(pushes, 'push', 'pushes') },
  ];
  const successLine = plural(successes, 'success', 'successes');
  const baneLine = plural(banes, 'bane', 'banes');
  return {
    title: APP_NAME,
    successLine,
    baneLine,
    readings,
    alt:
      `A picture of the dice on the table. ${sentence(successLine)}. ${sentence(baneLine)}. ` +
      `${readings.map((reading) => sentence(reading.text)).join('. ')}.`,
  };
}

/**
 * One reading as a sentence.
 *
 * The card draws a reading as a tally — `stress 10` — and the alternative text
 * reads it aloud, where a sentence starts with a capital. The words are the
 * same words, so the two cannot say different things.
 */
export function sentence(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Which palette token a run of text is drawn in. */
export type CardInk = 'text' | 'textMuted';

/** One run of text the card draws, and the box it lands in. */
export interface CardRun {
  readonly id: string;
  readonly text: string;
  /** The left edge and the baseline, in device pixels of the card. */
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly weight: number;
  readonly ink: CardInk;
  /**
   * The pixels the run may mark.
   *
   * An instrument reads this box off the drawn card and looks for the ink
   * inside it, so a run the draw loop skipped leaves an empty box and fails.
   * It is the line box and not the glyph box, so it holds every descender.
   */
  readonly box: { readonly x: number; readonly y: number; readonly w: number; readonly h: number };
}

export interface CardLayout {
  readonly width: number;
  readonly height: number;
  /** The opaque ground the runs are drawn on. It is filled with `surface`. */
  readonly panel: {
    readonly x: number;
    readonly y: number;
    readonly w: number;
    readonly h: number;
  };
  readonly runs: readonly CardRun[];
}

/**
 * The font the card draws in.
 *
 * It is the stack `src/shell.css` gives the page, so the card reads as the
 * application does. A canvas takes a font shorthand and never a class.
 */
export const CARD_FONT_STACK = `system-ui, -apple-system, 'Segoe UI', Roboto, Cantarell, sans-serif`;

/** The panel sits in the upper left, which is the part of the frame the dice leave empty. */
const PANEL_MARGIN = 28;
const PANEL_PADDING = 26;
const PANEL_WIDTH = 420;
const TITLE_SIZE = 20;
const HEADLINE_SIZE = 46;
const READING_SIZE = 26;
const READING_LEADING = 36;
const TITLE_GAP = 16;
const HEADLINE_GAP = 22;
/** The boundary of the panel, in device pixels at scale 1. */
export const PANEL_BORDER = 3;

/**
 * Where every mark of the card goes.
 *
 * Every length is scaled by the height of the frame against the 900 device
 * pixels the sizes above were chosen at, so a card off a phone carries the same
 * proportions rather than the same pixels.
 */
export function layoutShareCard(card: ShareCard, width: number, height: number): CardLayout {
  if (width < 1 || height < 1) {
    throw new Error(`layoutShareCard: the card measures ${width} by ${height}`);
  }
  const scale = height / 900;
  const at = (value: number): number => value * scale;
  const panelX = at(PANEL_MARGIN);
  const panelY = at(PANEL_MARGIN);
  const panelW = Math.min(at(PANEL_WIDTH), width - 2 * panelX);
  const pad = at(PANEL_PADDING);
  const titleSize = at(TITLE_SIZE);
  const headlineSize = at(HEADLINE_SIZE);
  const readingSize = at(READING_SIZE);
  const leading = at(READING_LEADING);

  const runs: CardRun[] = [];
  const left = panelX + pad;
  const boxWidth = panelW - 2 * pad;
  let cursor = panelY + pad;

  const line = (id: string, text: string, size: number, weight: number, ink: CardInk): void => {
    // The line box is the size and a quarter, so the descenders of the run sit
    // inside the box an instrument reads.
    const boxHeight = size * 1.25;
    runs.push({
      id,
      text,
      x: left,
      y: cursor + size,
      size,
      weight,
      ink,
      box: { x: left, y: cursor, w: boxWidth, h: boxHeight },
    });
    cursor += boxHeight;
  };

  line('title', card.title, titleSize, 600, 'textMuted');
  cursor += at(TITLE_GAP);
  line('successes', card.successLine, headlineSize, 700, 'text');
  line('banes', card.baneLine, headlineSize, 700, 'text');
  cursor += at(HEADLINE_GAP);
  for (const reading of card.readings) {
    const before = cursor;
    line(`reading-${reading.key}`, reading.text, readingSize, 400, 'text');
    // One reading per line of the leading, so five readings and five gaps read
    // evenly whatever the size of the frame.
    cursor = before + leading;
  }

  return {
    width,
    height,
    panel: { x: panelX, y: panelY, w: panelW, h: cursor + pad - panelY },
    runs,
  };
}

/** The 2d calls the card needs. It is written out so the drawing is testable. */
export interface CardContext {
  // The two paint properties take the same union a real 2d context takes, so a
  // `CanvasRenderingContext2D` satisfies this interface without a cast. Nothing
  // here ever writes anything but a colour into them.
  fillStyle: string | CanvasGradient | CanvasPattern;
  strokeStyle: string | CanvasGradient | CanvasPattern;
  lineWidth: number;
  font: string;
  textBaseline: string;
  fillRect(x: number, y: number, width: number, height: number): void;
  strokeRect(x: number, y: number, width: number, height: number): void;
  fillText(text: string, x: number, y: number): void;
  measureText(text: string): { readonly width: number };
}

/** What one run really came out as, after it was fitted to its box. */
export interface DrawnRun {
  readonly id: string;
  /** The size it was drawn at. It is below `CardRun.size` only after a fit. */
  readonly size: number;
  /** The width the text really took, in device pixels. */
  readonly width: number;
  /** The width it had to fit inside. */
  readonly boxWidth: number;
}

/**
 * Draw the summary over the frame, and report what came out.
 *
 * **This runs inside the task that drew the frame and copied it.** It is
 * handed to `captureTrayJpeg` as an overlay and it may not await, because an
 * await between the render and the copy is the black-frame defect the capture
 * half of this unit was written against. Nothing here is asynchronous.
 *
 * **Every run is measured against its box and fitted before it is drawn.** A
 * layout cannot know how wide a string will be: it has no font. The first draft
 * put the successes and the banes on one line, the line ran off the side of the
 * panel, and the last word landed on the photograph where nothing could read
 * it. The box fitted and the text did not, so every check stayed green. The
 * report below is what an instrument reads to see that each run really fitted.
 */
export function drawShareCard(
  context: CardContext,
  layout: CardLayout,
  palette: InterfacePalette,
): readonly DrawnRun[] {
  const scale = layout.height / 900;
  const { panel } = layout;
  context.fillStyle = palette.surface;
  context.fillRect(panel.x, panel.y, panel.w, panel.h);
  // The boundary tells the panel from whatever the photograph holds behind it.
  // It is a graphical object under WCAG 2.2 SC 1.4.11 and `line` is the token
  // the palette proves at 3 to 1 against its own grounds.
  context.strokeStyle = palette.line;
  context.lineWidth = PANEL_BORDER * scale;
  const inset = (PANEL_BORDER * scale) / 2;
  context.strokeRect(panel.x + inset, panel.y + inset, panel.w - 2 * inset, panel.h - 2 * inset);
  context.textBaseline = 'alphabetic';
  const drawn: DrawnRun[] = [];
  for (const run of layout.runs) {
    context.font = `${run.weight} ${run.size}px ${CARD_FONT_STACK}`;
    let size = run.size;
    let width = context.measureText(run.text).width;
    if (width > run.box.w) {
      // One proportional step. Type is not exactly linear in the size, so the
      // width is read again and the report carries what really came out.
      size = Math.floor((run.size * run.box.w) / width);
      context.font = `${run.weight} ${size}px ${CARD_FONT_STACK}`;
      width = context.measureText(run.text).width;
    }
    context.fillStyle = palette[run.ink];
    context.fillText(run.text, run.x, run.y);
    drawn.push({ id: run.id, size, width, boxWidth: run.box.w });
  }
  return drawn;
}

/**
 * A data URL back to the bytes it carries.
 *
 * The capture answers a data URL, because `toDataURL` is the one synchronous
 * encode a canvas offers and the copy may not fall into a later task. A
 * download and a share both take a `Blob`, so the bytes are decoded once here
 * and both routes hand over the same ones.
 */
export function bytesOfDataUrl(url: string): Uint8Array<ArrayBuffer> {
  const comma = url.indexOf(',');
  if (!url.startsWith('data:') || comma < 0) {
    throw new Error('bytesOfDataUrl: this is not a data URL');
  }
  const binary = atob(url.slice(comma + 1));
  // The buffer is made here rather than left to the view, so the bytes are a
  // plain `ArrayBuffer` and a `Blob` takes them without a copy.
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let at = 0; at < binary.length; at += 1) bytes[at] = binary.charCodeAt(at);
  return bytes;
}

/** The media type a data URL declares, as a `Blob` takes it. */
export function mediaTypeOfDataUrl(url: string): string {
  const head = url.slice('data:'.length, url.indexOf(','));
  const type = head.split(';')[0] ?? '';
  return type === '' ? 'application/octet-stream' : type;
}
