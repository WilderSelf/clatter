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
  return (
    `clatter-log-${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}-` +
    `${pad(at.getHours())}${pad(at.getMinutes())}.csv`
  );
}
