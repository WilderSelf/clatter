// The share card on the screen — Unit 4.9.
//
// `sheet-share` sits behind the one disclosure. Decision 16 of
// `docs/design/0012-settled-decisions.md` settles that and section 4 of
// `docs/design/0002-screen-design.md` lists it, so the control budget of
// section 3 and both keyboard walks of section 6 are untouched.
//
// The panel decides nothing and captures nothing. `src/app.tsx` holds the tray,
// the state and the palette, and it answers this panel with a made card or a
// sentence naming why there is none.
//
// **A refusal is a sentence, never a control that went dim.** The same rule the
// saved pools obey: a control that is disabled names nothing. Both refusals
// this panel can meet — an empty table and the flat dice — are reachable, and
// both name the thing the player has to change.

import type { MadeCard, ShareRefusal } from './share-state';

/** One sentence per refusal. The record is total, so a third needs words. */
export const SHARE_REFUSAL_TEXT: Readonly<Record<ShareRefusal, string>> = {
  noRoll: 'No dice are on the table. Throw the dice, then make a card.',
  flatDice:
    'The dice are drawn flat. A card is a picture of the table. ' +
    'Turn the table on above, then make a card.',
};

/** What the panel says while a card waits to be saved or sent. */
export const CARD_READY_TEXT = 'The card is ready. Save it, or send it to another application.';

/** The browser holds no object URL, so no page of it can write a file. */
export const NO_DOWNLOAD_TEXT =
  'This browser cannot save a file from a page. Open the application in another browser.';

export const CARD_SENT_TEXT = 'The card went to the application you chose.';
export const SHARE_CANCELLED_TEXT = 'You closed the share sheet. The card is still here.';
export const SHARE_REFUSED_TEXT = 'This browser did not take the card. Save it instead.';

/**
 * The whole panel.
 *
 * `made` is the card the last press produced, or `null` before the first one.
 * The two ways out appear with it, because there is nothing to save until a
 * card exists. `canSend` is the browser's own answer about this very file, so
 * the send control is absent where the browser offers no share target, and
 * that absence is not a failure.
 */
export function SharePanel({
  made,
  canSend,
  note,
  busy,
  onMake,
  onDownload,
  onSend,
}: {
  made: MadeCard | null;
  canSend: boolean;
  note: string;
  busy: boolean;
  onMake: () => void;
  onDownload: () => void;
  onSend: () => void;
}): preact.JSX.Element {
  return (
    <fieldset class="field" data-el="sheet-share">
      <legend>Share card</legend>
      <button
        class="btn"
        type="button"
        data-el="share-card-button"
        aria-disabled={busy ? 'true' : 'false'}
        onClick={onMake}
      >
        Make a card
        <small>a picture of the dice on the table</small>
      </button>
      {made === null ? null : (
        <>
          {/* The picture the player is about to post, and the same readings in
              words for a reader who meets no picture. The alternative text is
              built from the roll by `shareCard`, so the two cannot differ. */}
          <img class="share-shot" data-el="share-preview" src={made.url} alt={made.alt} />
          <button
            class="btn"
            type="button"
            data-el="share-download-button"
            aria-disabled={busy ? 'true' : 'false'}
            onClick={onDownload}
          >
            Save the card
            <small>{made.filename}</small>
          </button>
          {canSend ? (
            <button
              class="btn"
              type="button"
              data-el="share-send-button"
              aria-disabled={busy ? 'true' : 'false'}
              onClick={onSend}
            >
              Send the card
              <small>to another application</small>
            </button>
          ) : null}
        </>
      )}
      <p class="sheet-note" data-el="share-note" role="status">
        {note}
      </p>
    </fieldset>
  );
}
