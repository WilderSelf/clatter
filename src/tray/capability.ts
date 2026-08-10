// The startup capability probe, and the decision it feeds.
//
// Two halves, and the split between them is the point. `probeCapability` reads
// the platform and answers with plain data. `decideTray` reads that data and
// decides. The decision names no browser API and holds no state, so every
// combination of readings is testable without a browser, and the readings that
// matter are the ones a phone actually gives.
//
// The probe never throws. A platform that refuses a reading gives `false` or
// `null`, and `decideTray` reads that as it reads any other value. The plan
// requires a probe failure to fall to flat dice, and a probe that threw would
// take the application down instead.
//
// `prefers-reduced-motion` sits here for the same reason: it is a read of the
// platform, and `src/tray/throw.ts` takes the answer as an argument.

/** One reading of the platform. Every field is data, so a test can build one. */
export interface CapabilityProbe {
  /** Did a WebGL2 context come back? */
  readonly webgl2: boolean;
  /** `navigator.deviceMemory`, in gigabytes. `null` when the browser hides it. */
  readonly deviceMemoryGb: number | null;
  /** `navigator.hardwareConcurrency`. `null` when the browser hides it. */
  readonly cores: number | null;
  /** Did `canvas.toBlob` hand back a blob? */
  readonly toBlob: boolean;
}

/**
 * The bar. Below either number the tray falls to flat dice.
 *
 * A browser that hides a reading reads as `null`, and `null` never fails the
 * bar. Safari reports no `deviceMemory` at all, so a missing reading treated as
 * a failure would take the tray away from every iPhone.
 */
export const MIN_DEVICE_MEMORY_GB = 1;
export const MIN_CORES = 2;

/** Why the tray fell. One id per reading, so a caller can name the cause. */
export const FALL_REASONS = [
  'no-webgl2',
  'low-device-memory',
  'low-core-count',
  'no-canvas-readback',
] as const;

export type FallReason = (typeof FALL_REASONS)[number];

export interface TrayDecision {
  /** True when the 3D tray runs. False when the application falls to flat dice. */
  readonly tray: boolean;
  /** Empty when `tray` is true. One id per reading below the bar otherwise. */
  readonly reasons: readonly FallReason[];
}

/**
 * Above the bar, or fall to flat.
 *
 * Pure. It reads its argument and nothing else.
 *
 * `toBlob` counts against the bar, and that is a decision this unit made rather
 * than one the plan settled. A canvas that cannot hand back a blob is a canvas
 * the platform has crippled, and the tray is drawn on a canvas. The share card
 * of Unit 4.9 is the visible cost, not the reason.
 */
export function decideTray(probe: CapabilityProbe): TrayDecision {
  const reasons: FallReason[] = [];
  if (!probe.webgl2) {
    reasons.push('no-webgl2');
  }
  if (probe.deviceMemoryGb !== null && probe.deviceMemoryGb < MIN_DEVICE_MEMORY_GB) {
    reasons.push('low-device-memory');
  }
  if (probe.cores !== null && probe.cores < MIN_CORES) {
    reasons.push('low-core-count');
  }
  if (!probe.toBlob) {
    reasons.push('no-canvas-readback');
  }
  return { tray: reasons.length === 0, reasons };
}

/** A browser reading is usable only when it is a finite number above zero. */
function positiveNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
}

/**
 * Ask for a WebGL2 context, then give it straight back.
 *
 * A context left open costs memory on the device the probe is worried about,
 * and the tray asks for its own context a moment later.
 */
function readWebgl2(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (gl === null) {
      return false;
    }
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/** A `toBlob` that never calls back would hold up the whole startup. */
export const TO_BLOB_TIMEOUT_MS = 1000;

function readToBlob(): Promise<boolean> {
  return new Promise((resolve) => {
    let answered = false;
    const answer = (value: boolean): void => {
      if (answered) return;
      answered = true;
      resolve(value);
    };
    setTimeout(() => answer(false), TO_BLOB_TIMEOUT_MS);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      canvas.toBlob((blob) => answer(blob !== null && blob.size > 0));
    } catch {
      answer(false);
    }
  });
}

/** `navigator.deviceMemory` is not in the standard typings. */
type MemoryNavigator = Navigator & { readonly deviceMemory?: unknown };

/** Read the platform. It never throws and it never leaves a context open. */
export async function probeCapability(): Promise<CapabilityProbe> {
  const readings = {
    webgl2: readWebgl2(),
    deviceMemoryGb: positiveNumber((navigator as MemoryNavigator).deviceMemory),
    cores: positiveNumber(navigator.hardwareConcurrency),
  };
  return { ...readings, toBlob: await readToBlob() };
}

/** Does the player ask for less movement? A platform that refuses says no. */
export function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}
