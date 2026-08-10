// The roll log store: IndexedDB, a 5,000-roll ring buffer, and the four ways a
// browser refuses to keep data.
//
// This module names browser APIs, so it is not the rules core and nothing in
// the core may import it. It imports `LogEntry` as a type only, because
// `src/log/entry.ts` reaches for `node:crypto` and a value import would pull
// that into the browser bundle.
//
// Two decisions carry the unit, and both come straight from the plan.
//
// 1. **Insert and trim run in ONE readwrite transaction.** The trim reads the
//    count the insert produced and deletes the excess inside the same
//    transaction. IndexedDB serialises readwrite transactions over the same
//    object store across every connection to the database, so no other tab can
//    add or delete between the count and the deletions. Split the two apart and
//    two tabs both trim from a count that was already stale, each deletes the
//    same excess from a different starting point, and entries that belong in the
//    newest 5,000 are gone.
// 2. **Every refusal gets its own answer.** A caller must be able to tell a full
//    disk from a database the browser would not open at all, because the two
//    need different words on the screen. So nothing here throws and nothing
//    here returns a bare null: an open answers `open`, `refused`, `blocked` or
//    `error`, and an append answers `written`, `full` or `error`.

import type { LogEntry } from './entry';

export const DB_NAME = 'clatter-log';
export const DB_VERSION = 1;
export const STORE_NAME = 'rolls';

/** The ring buffer holds this many rolls. The oldest go first. */
export const RING_CAPACITY = 5000;

/** A name for an error a browser threw, without assuming it is an `Error`. */
function reasonOf(error: unknown): string {
  if (error === null || error === undefined) return 'the browser gave no reason';
  if (error instanceof DOMException || error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }
  return String(error);
}

/** Which store an operation runs against. A run of the harness uses its own. */
export interface StoreNames {
  readonly name?: string;
  readonly storeName?: string;
  readonly version?: number;
}

export type OpenResult =
  /** A live connection. Close it when the page is finished with it. */
  | { readonly kind: 'open'; readonly db: IDBDatabase }
  /**
   * The browser refuses to give a database at all. Safari in private mode
   * throws from `open`, and a browser with storage turned off exposes no
   * `indexedDB`. The application keeps the log in memory for the session and
   * says so.
   */
  | { readonly kind: 'refused'; readonly reason: string }
  /**
   * Another tab holds an older version open, so the upgrade cannot run. The
   * application asks the player to close the other tab. It is not an error and
   * it is not a full disk.
   */
  | { readonly kind: 'blocked'; readonly reason: string }
  | { readonly kind: 'error'; readonly reason: string };

export interface OpenOptions extends StoreNames {
  /**
   * Another tab asked for a newer version. This connection closes at once, or
   * the other tab hangs on `blocked` for ever.
   */
  readonly onVersionChange?: () => void;
}

/** Open the log. It answers rather than throws, whatever the browser does. */
export function openLog(options: OpenOptions = {}): Promise<OpenResult> {
  return new Promise<OpenResult>((resolve) => {
    const storeName = options.storeName ?? STORE_NAME;
    let settled = false;
    /**
     * A `blocked` open can still succeed later, once the other tab closes. The
     * caller already has its answer by then, so the late connection is closed
     * rather than leaked.
     */
    const settle = (result: OpenResult): void => {
      if (settled) {
        if (result.kind === 'open') result.db.close();
        return;
      }
      settled = true;
      resolve(result);
    };

    let request: IDBOpenDBRequest;
    try {
      // Reading the property can throw as well, not only calling `open`.
      const factory: IDBFactory | undefined = globalThis.indexedDB;
      if (!factory) {
        settle({ kind: 'refused', reason: 'this browser exposes no indexedDB' });
        return;
      }
      request = factory.open(options.name ?? DB_NAME, options.version ?? DB_VERSION);
    } catch (error) {
      settle({ kind: 'refused', reason: reasonOf(error) });
      return;
    }

    request.onupgradeneeded = (): void => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        // Out-of-line keys from the store's own generator. The key is therefore
        // the insertion order, it is monotone across every connection, and the
        // oldest roll is always the smallest key.
        db.createObjectStore(storeName, { autoIncrement: true });
      }
    };
    request.onblocked = (): void => {
      settle({
        kind: 'blocked',
        reason: `another connection holds ${options.name ?? DB_NAME} open at an older version`,
      });
    };
    request.onerror = (): void => settle({ kind: 'error', reason: reasonOf(request.error) });
    request.onsuccess = (): void => {
      const db = request.result;
      db.onversionchange = (): void => {
        db.close();
        options.onVersionChange?.();
      };
      settle({ kind: 'open', db });
    };
  });
}

export type AppendResult =
  | {
      readonly kind: 'written';
      readonly written: number;
      readonly dropped: number;
      /** How many rolls the buffer holds after the trim. Never over capacity. */
      readonly held: number;
      /**
       * The key the store gave the newest roll of this batch. It is the
       * acknowledgement of the insert, and the batch runs in one transaction,
       * so the keys of the batch are the `written` values ending here. A caller
       * that must know the order two connections wrote in reads it from this,
       * not from the buffer afterwards, where a trim has already been.
       */
      readonly newestKey: number;
    }
  /** `QuotaExceededError`. The disk or the origin quota is full. */
  | { readonly kind: 'full'; readonly reason: string }
  | { readonly kind: 'error'; readonly reason: string };

export interface AppendOptions extends StoreNames {
  readonly capacity?: number;
  /**
   * Empty the log first, inside the same transaction. An import REPLACES the
   * log, and that is the whole of the difference between the two.
   *
   * The clear belongs in the transaction of the insert for the reason the trim
   * does. Split apart, another connection reads the log between the two and
   * sees it empty, and the end state cannot tell the two orders apart: the
   * insert refills the log either way.
   */
  readonly replace?: boolean;
}

/**
 * Write rolls and trim the buffer, in one transaction.
 *
 * The caller decides the batch size. One roll per call is the application's own
 * path. A caller with thousands to write splits them, because every `add` of one
 * batch is issued in one synchronous loop.
 */
export function appendRolls(
  db: IDBDatabase,
  entries: readonly LogEntry[],
  options: AppendOptions = {},
): Promise<AppendResult> {
  const capacity = options.capacity ?? RING_CAPACITY;
  const storeName = options.storeName ?? STORE_NAME;
  return new Promise<AppendResult>((resolve) => {
    let transaction: IDBTransaction;
    try {
      transaction = db.transaction(storeName, 'readwrite');
    } catch (error) {
      // A connection closed by `versionchange` refuses a new transaction.
      resolve({ kind: 'error', reason: reasonOf(error) });
      return;
    }
    const store = transaction.objectStore(storeName);

    let newestKey = -1;
    try {
      if (options.replace) store.clear();
      for (const entry of entries) {
        const added = store.add(entry);
        added.onsuccess = (): void => {
          newestKey = Number(added.result);
        };
      }
    } catch (error) {
      // `add` throws at once on a value the browser cannot clone. The
      // transaction is dropped, so a half-written batch cannot survive.
      transaction.abort();
      resolve({ kind: 'error', reason: reasonOf(error) });
      return;
    }

    // The count comes from inside the transaction, so it is the count this
    // insert produced. The deletions follow in the same transaction, so no
    // other connection can add or delete between the two.
    let dropped = 0;
    let held = 0;
    const counted = store.count();
    counted.onsuccess = (): void => {
      held = counted.result;
      const excess = held - capacity;
      if (excess <= 0) return;
      const cursored = store.openKeyCursor();
      cursored.onsuccess = (): void => {
        const cursor = cursored.result;
        if (!cursor || dropped >= excess) return;
        store.delete(cursor.key);
        dropped += 1;
        cursor.continue();
      };
    };

    transaction.oncomplete = (): void => {
      resolve({
        kind: 'written',
        written: entries.length,
        dropped,
        held: held - dropped,
        newestKey,
      });
    };
    transaction.onabort = (): void => {
      const error = transaction.error;
      resolve(
        error?.name === 'QuotaExceededError'
          ? { kind: 'full', reason: reasonOf(error) }
          : { kind: 'error', reason: reasonOf(error) },
      );
    };
  });
}

/**
 * Every roll the buffer holds, oldest first, in one transaction.
 *
 * The browser rebuilds every roll in the task that answers the request.
 * Measured at 86 ms for a full 5,000-roll buffer, which is five dropped frames.
 * Use `readRollsInPages` where the page is on the screen.
 */
export function readRolls(db: IDBDatabase, options: StoreNames = {}): Promise<readonly LogEntry[]> {
  const storeName = options.storeName ?? STORE_NAME;
  return new Promise<readonly LogEntry[]>((resolve, reject) => {
    const request = db.transaction(storeName, 'readonly').objectStore(storeName).getAll();
    request.onsuccess = (): void => resolve(request.result as LogEntry[]);
    request.onerror = (): void => reject(new Error(reasonOf(request.error)));
  });
}

/** How many rolls one page of `readRollsInPages` holds. */
export const ROLLS_PER_PAGE = 250;

/**
 * Every roll the buffer holds, oldest first, a page at a time.
 *
 * Each page is its own transaction, so the browser rebuilds a page of rolls per
 * task and may draw a frame between two of them. No timer is needed for that:
 * the answer to a request arrives in a task of its own.
 *
 * The pages are read newest-key-last through the key of the page before, so a
 * trim between two pages can drop rolls but can never repeat one.
 */
export async function readRollsInPages(
  db: IDBDatabase,
  options: StoreNames = {},
  rollsPerPage: number = ROLLS_PER_PAGE,
): Promise<readonly LogEntry[]> {
  const storeName = options.storeName ?? STORE_NAME;
  const all: LogEntry[] = [];
  let after: number | null = null;
  for (;;) {
    const range = after === null ? null : IDBKeyRange.lowerBound(after, true);
    const page = await new Promise<{ values: LogEntry[]; keys: IDBValidKey[] }>(
      (resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const rolls = transaction.objectStore(storeName);
        const values = rolls.getAll(range, rollsPerPage);
        const keys = rolls.getAllKeys(range, rollsPerPage);
        transaction.oncomplete = (): void =>
          resolve({ values: values.result as LogEntry[], keys: keys.result });
        transaction.onabort = (): void => reject(new Error(reasonOf(transaction.error)));
      },
    );
    all.push(...page.values);
    const last = page.keys[page.keys.length - 1];
    if (last === undefined || page.values.length < rollsPerPage) return all;
    after = Number(last);
  }
}

// ---------------------------------------------------------------------------
// The writer
//
// A roll is queued in memory and written on the next flush. The plan asks for a
// flush on `visibilitychange`, because it is the only point a mobile browser
// guarantees: a phone kills a backgrounded tab without ever firing `unload`.
// ---------------------------------------------------------------------------

export interface LogWriter {
  /** Hold a roll for the next flush. */
  queue(entry: LogEntry): void;
  /** How many rolls are waiting. A failed flush leaves them here. */
  pending(): number;
  /** Write everything waiting. Answers null when nothing was waiting. */
  flush(): Promise<AppendResult | null>;
}

export function createLogWriter(db: IDBDatabase, options: AppendOptions = {}): LogWriter {
  const waiting: LogEntry[] = [];
  return {
    queue(entry) {
      waiting.push(entry);
    },
    pending() {
      return waiting.length;
    },
    async flush() {
      if (waiting.length === 0) return null;
      const batch = waiting.splice(0, waiting.length);
      const result = await appendRolls(db, batch, options);
      // A refused write keeps its rolls. Dropping them here would lose a
      // campaign to one full disk, and the caller can see `pending`.
      if (result.kind !== 'written') waiting.unshift(...batch);
      return result;
    },
  };
}

/** Flush when the page goes to the background. Returns a stop function. */
export function flushOnHide(writer: LogWriter, doc: Document = document): () => void {
  const onChange = (): void => {
    if (doc.visibilityState === 'hidden') void writer.flush();
  };
  doc.addEventListener('visibilitychange', onChange);
  return () => doc.removeEventListener('visibilitychange', onChange);
}

// ---------------------------------------------------------------------------
// Storage permission and pressure
// ---------------------------------------------------------------------------

let persistAsked: Promise<boolean | null> | null = null;

/**
 * Ask once for storage that eviction leaves alone.
 *
 * Once per page, not once per call: a browser may show a prompt, and a prompt
 * per roll would be intolerable. Answers null where the browser has no such
 * API. It does not fix the seven-day rule on iOS, which the interface must say.
 */
export function persistOnce(): Promise<boolean | null> {
  persistAsked ??= (async (): Promise<boolean | null> => {
    try {
      const storage = globalThis.navigator?.storage;
      if (!storage?.persist) return null;
      return await storage.persist();
    } catch (error) {
      void error;
      return null;
    }
  })();
  return persistAsked;
}

/** What the origin uses and what it may use. Null where the browser has no estimate. */
export async function estimateStorage(): Promise<{
  usage: number | null;
  quota: number | null;
} | null> {
  try {
    const storage = globalThis.navigator?.storage;
    if (!storage?.estimate) return null;
    const { usage, quota } = await storage.estimate();
    return { usage: usage ?? null, quota: quota ?? null };
  } catch (error) {
    void error;
    return null;
  }
}
