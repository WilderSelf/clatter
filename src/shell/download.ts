// Hand a file to the browser — Unit 4.5.
//
// The application is a static site with no server, so an export is a `Blob` and
// an anchor carrying `download`. There is no other route: nothing is uploaded
// and nothing is fetched.
//
// The object URL is released on a later task rather than at once. A browser
// that has not yet started the transfer cancels it when the URL goes, and the
// anchor click starts the transfer asynchronously.

/** How long the object URL is kept alive after the click, in milliseconds. */
export const RELEASE_AFTER_MS = 60_000;

/**
 * Offer a blob to the player as a file.
 *
 * It answers `false` where the browser holds no object-URL support, so a caller
 * can say so rather than appear to have written a file. Every browser this
 * application supports has it, and jsdom has none.
 */
export function downloadBlob(blob: Blob, filename: string, doc: Document): boolean {
  const maker = globalThis.URL;
  if (typeof maker?.createObjectURL !== 'function') return false;
  const url = maker.createObjectURL(blob);
  const anchor = doc.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  anchor.style.display = 'none';
  doc.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  globalThis.setTimeout(() => maker.revokeObjectURL(url), RELEASE_AFTER_MS);
  return true;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/**
 * What the exported file is called.
 *
 * The date is in the reader's own time zone and the pattern sorts, so a folder
 * of exports reads in the order the campaign ran.
 */
export function exportFileName(at: Date): string {
  return `clatter-log-${stamp(at)}.csv`;
}

/**
 * What the share card is called.
 *
 * The same stamp as the export, so a folder holding both reads in the order the
 * campaign ran. One formatter, so the two names cannot drift.
 */
export function cardFileName(at: Date): string {
  return `clatter-card-${stamp(at)}.jpg`;
}

function stamp(at: Date): string {
  return (
    `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}-` +
    `${pad(at.getHours())}${pad(at.getMinutes())}`
  );
}

// ---------------------------------------------------------------------------
// The share target — Unit 4.9
//
// A share target belongs to the BROWSER and is never a service of ours.
// Constraint 4 keeps this a static site: `navigator.share` hands the file to
// whatever the platform offers and this application makes no network call.
//
// **Its absence is not a failure.** A desktop browser that shares no file
// simply does not draw the control, and the download is the route there.
// ---------------------------------------------------------------------------

/** The part of `navigator` a share needs. A test hands over its own. */
export interface ShareTarget {
  share?: (data: { files?: File[]; title?: string; text?: string }) => Promise<void>;
  canShare?: (data: { files?: File[] }) => boolean;
}

/**
 * True while this browser offers to share this very file.
 *
 * Both calls are asked for, because a browser may hold `share` for text and
 * refuse a file. The file itself is handed to `canShare`, so the answer is
 * about the bytes on offer rather than about the feature in general.
 */
export function canShareFile(target: ShareTarget | undefined, file: File): boolean {
  if (typeof target?.share !== 'function' || typeof target.canShare !== 'function') return false;
  try {
    return target.canShare({ files: [file] }) === true;
  } catch {
    // A browser that throws on a shape it does not know offers nothing here.
    return false;
  }
}

/** What a share attempt answered. A cancelled share is not an error. */
export type ShareOutcome = 'shared' | 'cancelled' | 'refused';

/**
 * Hand the card to the browser's own share target.
 *
 * A player who closes the share sheet raises `AbortError`, which is a choice
 * and not a fault, so it is answered apart from a refusal.
 */
export async function shareFile(
  target: ShareTarget | undefined,
  file: File,
  text: string,
): Promise<ShareOutcome> {
  if (!canShareFile(target, file) || target?.share === undefined) return 'refused';
  try {
    await target.share({ files: [file], text });
    return 'shared';
  } catch (error) {
    return error instanceof Error && error.name === 'AbortError' ? 'cancelled' : 'refused';
  }
}
