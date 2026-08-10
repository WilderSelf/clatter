// The types of the branding gate's exported helpers.
//
// The gate itself is plain JavaScript, because it runs under `node --test` and
// under CI without a build step. `src/shell/share-card.test.ts` scans the text
// of a share card through the gate's OWN tokeniser and its OWN hash, so the two
// cannot disagree about what a term is, and that import needs these types.

/** True when the first 8000 bytes hold a NUL byte. */
export function isBinary(buf: Uint8Array): boolean;

/** Split text into lower-case word tokens. Word boundaries, never substrings. */
export function tokenise(text: string): string[];

/** Normalise a term through the same tokeniser the scan uses. */
export function normaliseTerm(term: string): string;

/** The salted SHA-256 of one token or n-gram, as hex. */
export function digest(salt: string, text: string): string;
