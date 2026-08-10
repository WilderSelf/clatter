// The two ways a file leaves the application — Units 4.5 and 4.9.
//
// The anchor download is measured in a real browser by
// `node scripts/browser.mjs --history`, byte for byte. What is measured here is
// the share target: whether this browser offers one at all, and what each of
// the three answers a share can give turns into.
//
// **A share target is the browser's and never a service of ours.** Constraint 4
// keeps this a static site, so nothing here fetches or uploads.

import { describe, expect, it } from 'vitest';
import type { ShareTarget } from './download';
import { canShareFile, cardFileName, exportFileName, shareFile } from './download';

const CARD = new File([new Uint8Array([0xff, 0xd8, 0xff, 0xd9])], 'card.jpg', {
  type: 'image/jpeg',
});

describe('the file names', () => {
  it('stamp the same moment the same way, so a folder of both reads in order', () => {
    const at = new Date(2026, 7, 10, 6, 5);
    expect(exportFileName(at)).toBe('clatter-log-2026-08-10-0605.csv');
    expect(cardFileName(at)).toBe('clatter-card-2026-08-10-0605.jpg');
  });
});

describe('canShareFile', () => {
  it('answers no where the browser holds neither call', () => {
    expect(canShareFile(undefined, CARD)).toBe(false);
    expect(canShareFile({}, CARD)).toBe(false);
  });

  it('answers no where the browser shares text but refuses a file', () => {
    const target: ShareTarget = { share: async () => undefined, canShare: () => false };
    expect(canShareFile(target, CARD)).toBe(false);
  });

  it('answers no where the browser holds share and no canShare', () => {
    // A share taken on trust would raise at the call and lose the card.
    expect(canShareFile({ share: async () => undefined }, CARD)).toBe(false);
  });

  it('asks about this very file, and not about the feature', () => {
    const asked: File[] = [];
    const target: ShareTarget = {
      share: async () => undefined,
      canShare: (data) => {
        asked.push(...(data.files ?? []));
        return true;
      },
    };
    expect(canShareFile(target, CARD)).toBe(true);
    expect(asked).toEqual([CARD]);
  });

  it('answers no where the browser throws on a shape it does not know', () => {
    const target: ShareTarget = {
      share: async () => undefined,
      canShare: () => {
        throw new TypeError('files is not a member of ShareData');
      },
    };
    expect(canShareFile(target, CARD)).toBe(false);
  });
});

describe('shareFile', () => {
  it('hands the browser the file and the words that carry the same readings', async () => {
    const given: { files?: File[]; text?: string }[] = [];
    const target: ShareTarget = {
      canShare: () => true,
      share: async (data) => {
        given.push(data);
      },
    };
    expect(await shareFile(target, CARD, 'Two successes.')).toBe('shared');
    expect(given).toEqual([{ files: [CARD], text: 'Two successes.' }]);
  });

  it('calls nothing where the browser offers no target', async () => {
    let calls = 0;
    const target: ShareTarget = {
      canShare: () => false,
      share: async () => {
        calls += 1;
      },
    };
    expect(await shareFile(target, CARD, 'x')).toBe('refused');
    expect(calls, 'a refusal never reaches the share call').toBe(0);
  });

  it('tells a player who closed the sheet from a browser that would not take it', async () => {
    const abort = new Error('the share was cancelled');
    abort.name = 'AbortError';
    const cancelled: ShareTarget = {
      canShare: () => true,
      share: async () => {
        throw abort;
      },
    };
    expect(await shareFile(cancelled, CARD, 'x')).toBe('cancelled');

    const broken: ShareTarget = {
      canShare: () => true,
      share: async () => {
        throw new Error('NotAllowedError');
      },
    };
    expect(await shareFile(broken, CARD, 'x')).toBe('refused');
  });
});
