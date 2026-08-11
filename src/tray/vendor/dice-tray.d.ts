// Typings for the vendored tray bundle. See README.md in this directory for the
// source package, its version and the edits applied to it.
//
// The published typings import `three` and `cannon-es`. Both libraries are
// inlined in the bundle and neither is a dependency of this repository, so
// those imports are gone and the handles they typed are opaque here. A unit
// that needs one narrows it at the point of use.
/* eslint-disable @typescript-eslint/no-explicit-any */

/** A three.js Scene. Opaque, because three.js is inlined and not a dependency. */
export type ThreeScene = any;
/** A three.js PerspectiveCamera. Opaque, for the same reason. */
export type ThreeCamera = any;
/** A three.js WebGLRenderer. Opaque, for the same reason. */
export type ThreeRenderer = any;
/** A three.js Vector2. Opaque, for the same reason. */
export type ThreeVector2 = any;
/** A cannon-es World. Opaque, because cannon-es is inlined and not a dependency. */
export type CannonWorld = any;
/** A cannon-es Body. Opaque, for the same reason. */
export type CannonBody = any;
/** A three.js Raycaster. Opaque, for the same reason. */
export type ThreeRaycaster = any;
/** A three.js Object3D. Opaque, for the same reason. */
export type ThreeObject3D = any;

/**
 * One die on the tray: a three.js mesh the library adds fields to. Only the
 * fields Clatter reads are declared.
 */
export interface TrayDie {
  /** One material per face, plus the edge material at index 0. */
  material: { color: { set(colour: string): void } }[];
  /** The physics body. Its quaternion is what `getFaceValue` reads. */
  body: CannonBody;
  /** Where the mesh sits, in tray units. The body drives it. */
  position: DicePosition;
  /** The uniform scale the factory gave it. `scale.x` is that number. */
  scale: { x: number };
  /** The die geometry. `boundingSphere` is null until it is computed. */
  geometry: { boundingSphere: { radius: number } | null; computeBoundingSphere(): void };
  /** Walks the mesh and every child of it. A raycast may name a child. */
  traverse(visit: (node: ThreeObject3D) => void): void;
  /**
   * The face pointing up, read from the current geometry and the body
   * quaternion. It is a live read of what a player sees, not a stored value.
   */
  getFaceValue(): { value: number; label: string; reason: string };
}

/**
 * One collision, as the patched `eventCollide` reports it.
 *
 * `kind` says what the die met: another die, or a tray wall or the desk, which
 * carry no mass. `speed` is the closing speed along the contact normal, in tray
 * units a second, so a heavy landing and a glancing touch differ. `self` and
 * `other` are the two body ids, and cannon reports a die meeting a die on both
 * bodies, so a reader that wants one report per contact keeps the report where
 * `self` is the lower id.
 */
export interface TrayImpact {
  kind: 'die' | 'surface';
  speed: number;
  self: number;
  other: number;
}

export interface DiceConfig {
  assetPath?: string;
  framerate?: number;
  /**
   * Called for every collision on a die body, in the pass the player watches.
   * The published build had `sounds`, `volume` and `sound_dieMaterial` here and
   * played one of 43 bundled mp3 files. Those files are deleted.
   */
  onImpact?: ((impact: TrayImpact) => void) | null;
  color_spotlight?: number;
  shadows?: boolean;
  theme_surface?: string;
  theme_customColorset?: unknown;
  /** One of the six colour sets this repository owns. They are named in README.md. */
  theme_colorset?: string;
  theme_texture?: string;
  theme_material?: string;
  gravity_multiplier?: number;
  light_intensity?: number;
  baseScale?: number;
  strength?: number;
  iterationLimit?: number;
  /**
   * Keeps the drawing buffer after a frame, so a caller can read the canvas
   * back as an image. The published build hard-codes the renderer options and
   * offers no way to set this.
   */
  preserveDrawingBuffer?: boolean;
  onRollComplete?: (results: DiceResults) => void;
  onRerollComplete?: (results: DiceResult[]) => void;
  onAddDiceComplete?: (results: DiceResult[]) => void;
  onRemoveDiceComplete?: (results: DiceResult[]) => void;
  enableDiceSelection?: boolean;
  onDiceHover?: (diceInfo: DiceEventData | null) => void;
  onDiceClick?: (diceInfo: DiceEventData) => void;
}

export interface DicePosition {
  x: number;
  y: number;
  z: number;
}

export interface DiceScreenPosition {
  x: number;
  y: number;
}

export interface DiceEventData extends DiceResult {
  position: DicePosition;
  screenPosition: DiceScreenPosition;
  scale: number;
}

export interface DiceResult {
  type: string;
  sides: number;
  id: number;
  value: number;
  reason?: string;
  position: DicePosition;
  screenPosition: DiceScreenPosition;
  scale: number;
}

export interface DiceSet {
  num: number;
  type: string;
  sides: number;
  rolls: DiceResult[];
  total: number;
}

export interface DiceResults {
  notation: string;
  sets: DiceSet[];
  modifier: number;
  total: number;
}

/**
 * The colour set the factory paints a die from.
 *
 * `texture` is the entry `createTextMaterial` composites into the face canvas.
 * The published build fetches it through an image loader; Clatter hands the
 * resolved entry over instead, because the texture files went at Unit 3.1.
 * `material` on that entry names a row of the factory's own material table and
 * is what decides whether a die takes the standard branch or the Phong one.
 */
export interface TrayColorSet {
  name: string;
  background: string;
  foreground: string;
  outline: string;
  texture: string | { name: string; composite: string; texture?: unknown; material?: string };
}

/**
 * The dice factory. Only the two members Clatter reads are declared.
 *
 * `applyColorSet` is the seam Unit 4.12 puts the grain through, and
 * `dice_material` is the field `createMaterials` branches on.
 */
export interface TrayDiceFactory {
  applyColorSet(set: TrayColorSet): void;
  dice_material: string;
}

export declare class DiceBox {
  constructor(element_container: string | HTMLElement, options?: Partial<DiceConfig>);

  initialized: boolean;
  container: HTMLElement;
  dimensions: ThreeVector2;
  scene: ThreeScene;
  world: CannonWorld;
  camera: ThreeCamera;
  /**
   * The renderer. The published build builds it inside `initialize()` and
   * keeps it off the public surface, which leaves a share card no way to draw
   * a fresh frame.
   */
  renderer: ThreeRenderer;
  /** The library's own raycaster. Unit 3.5 hit-tests a click through it. */
  raycaster: ThreeRaycaster;
  /** The factory that builds a die. Unit 4.12 puts the grain on through it. */
  DiceFactory: TrayDiceFactory;
  /** Every die on the tray, in spawn order. `roll` clears it and refills it. */
  diceList: TrayDie[];
  /** The collision report. It is read at the moment of the collision, so a caller may swap it between throws. */
  onImpact: ((impact: TrayImpact) => void) | null;

  initialize(): Promise<void>;
  enableShadows(): void;
  disableShadows(): void;
  setDimensions(dimensions: ThreeVector2): void;
  clearDice(): void;

  roll(notationString: string): Promise<DiceResults>;
  /**
   * Throws the named dice again and lands each one on the value the caller
   * names. `forced` carries one value per entry of `diceIdArray`, in the same
   * order. Dice that are not named do not move.
   */
  reroll(diceIdArray: number[], forced: number[]): Promise<DiceResult[]>;
  add(notationString: string): Promise<DiceResult[]>;
  remove(diceIdArray: number[]): Promise<DiceResult[]>;

  getDiceResults(id: number): DiceResult;
  getDiceResults(): DiceResults;

  /** Projects any `{x, y, z}` through the camera, so a physics body works too. */
  getScreenPosition(position: DicePosition): DiceScreenPosition | undefined;

  updateConfig(options: Partial<DiceConfig>): Promise<void>;
}

/**
 * The physics half of the bundle, exported for the steps-to-rest gate.
 *
 * `scripts/perf.mjs` builds the tray world in node with no renderer, so it needs
 * the inlined cannon-es classes, the dice factory and the default configuration.
 * Every one of them is opaque here, for the reason given at the top of this
 * file. Nothing in `src/` imports them, and nothing should: the tray is reached
 * through `DiceBox`.
 */
export declare const PhysicsWorld: any;
export declare const PhysicsBody: any;
export declare const PhysicsMaterial: any;
export declare const DiceFactory: any;
export declare const trayDefaults: any;

/**
 * Four three.js primitives, exported for the lock-state markers of Unit 3.5.
 *
 * The bundle inlines three.js and exports none of it, so a module outside this
 * directory cannot build a mesh of its own. These four are the smallest set
 * that draws a flat unlit shape: a geometry, an attribute to fill it, an unlit
 * material and the mesh that carries both. They are opaque here for the reason
 * given at the top of this file.
 */
export declare const ThreeMesh: any;
export declare const ThreeBufferGeometry: any;
export declare const ThreeBufferAttribute: any;
export declare const ThreeMeshBasicMaterial: any;

export { DiceBox as default };
