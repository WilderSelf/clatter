# Vendored tray bundle

This directory holds a copy of a third-party 3D dice library, not a dependency. The copy is
patched. Do not add the package to `package.json` and do not update this copy from the registry
without repeating the whole procedure below.

`docs/design/0003-vendor-patch-list.md` records why the library is copied rather than depended
on, with the measurement behind each reason.

## Source

- Package `@drdreo/dice-box-threejs`, version 1.1.0, MIT.
- Tarball integrity
  `sha512-BKQlSKLnNVlqvUQ9GUPah7QXoRiu+NkU75OG6Y4IuyLd1dd00pxjcz20mBbIXA9WITXIc1Y/zHuQ661hugXCdQ==`.
- `dice-tray.js` comes from `dist/dice-box-threejs.es.js`. `dice-tray.d.ts` comes from
  `types/index.d.ts`. The MIT notice is beside them in `LICENSE` and stays there.

## What was removed

- The published colour-set table. Every entry went. None was carried across under a new name,
  because a reproduced dice colour convention is closer to trade dress than to rules. Six sets
  this repository owns replace it: `ember`, `ash`, `verdigris`, `bone`, `void` and `cobalt`.
  `bone` is the default and is the base a custom set copies.
- Every dice-type definition that carried a forbidden term. The selection was made by the hashes
  in `scripts/forbidden-hashes.json`, so the term itself is written nowhere.
- The sound files, 540,987 bytes of them. Unit 3.6 supplies its own, synthesised in code.
- The peer dependencies. three.js and cannon-es are inlined in the bundle and nothing imports
  them by name, so the typings name no external module and the handles they typed are opaque.
- The texture files. Nothing here fetches one, because the six colour sets all use the `none`
  texture. A unit that wants a surface texture adds the files it needs and says so.

## What was changed

- `swapDiceFace` and `swapDiceFace_D4` carry `cannon_shape` across the geometry clone. Without
  this a re-spawned die has no collision shape and falls through the tray.
- `reroll` takes one predetermined value per named die and honours it. The published method
  applied a vertical velocity and let the physics decide the face.
- `initialize` passes `preserveDrawingBuffer` to the renderer, the default configuration carries
  the flag, and the typings expose `renderer`. A share card needs both.
- `getScreenPosition` projects any `{x, y, z}`. The published method called `clone()` and
  `project()` on its argument, so a physics body threw.

- The theme table, at Unit 3.2. One entry is left, and it names a surface material only. Nothing
  read the other fields of an entry. `src/tray/scene.ts` owns the colour a player sees, because
  the renderer clears to transparent and the desk is a shadow catcher.

## What Unit 3.2 changed

- The tray walls stand one `baseScale` inside the frame, not at a fixed 93 per cent of it. The
  camera frames exactly `containerWidth` by `containerHeight` world units and a die is a fixed
  world size, so the published fraction leaves a margin of 3.5 per cent of the canvas width. On a
  360 pixel canvas that margin is smaller than a die, and a die at rest against a wall hangs over
  the edge of the screen. A die enters the tray inside its own walls for the same reason.
- The ambient light is neutral. The published sky and ground colours are a pale yellow over an
  olive green, which suits the green table of a theme this repository deleted. The ground colour
  is now the surface colour, which is what a hemisphere light means.
- A die face texture declares the sRGB colour space. The published build leaves it unset, so the
  renderer reads a colour authored in sRGB as if it were linear and every colour set comes out
  pale and grey.

## What Unit 3.8 changed

- The export list carries five more names: `PhysicsWorld`, `PhysicsBody`, `PhysicsMaterial`,
  `DiceFactory` and `trayDefaults`. Nothing else moved. The steps-to-rest gate at
  `scripts/perf.mjs` builds the tray world in node with no renderer, and the published bundle
  exports only `DiceBox`, which builds a renderer in its constructor and cannot run there. The
  five names are the physics half plus the numbers that size it, so the gate measures the code
  the application ships instead of a copy of it. `loadTray` imports the whole module namespace,
  so the five names reach the lazy chunk and it grows a little. The Unit 3.8 row in `LEDGER.md`
  records by how much.

## What Unit 3.6 changed

- `eventCollide` reports the collision and plays nothing. The published method chose one of 43
  bundled mp3 files and played it through an `Audio` element. Those files went at Unit 3.1. The
  method now calls `onImpact` with the kind of body the die met, the closing speed along the
  contact normal, and the two body ids. It reports nothing while `animstate` is `simulate`, as
  the published method did, because that pass is replayed for the player and every collision
  would otherwise sound twice.
- `loadSounds` and `loadAudio` are deleted, with the `await this.loadSounds()` clause in
  `initialize` and the six instance fields the two of them used. Both were a path to a run of
  404s against the deleted files.
- The default configuration carries `onImpact: null` in place of `sounds`, `volume` and
  `sound_dieMaterial`. A tray that names no `onImpact` reports nothing, which is what a tray with
  the sound turned off does.
- The typings carry `TrayImpact` and the `onImpact` field, on the configuration and on `DiceBox`.

## What Unit 3.5 changed

- The export list carries four more names: `ThreeMesh`, `ThreeBufferGeometry`,
  `ThreeBufferAttribute` and `ThreeMeshBasicMaterial`. Nothing else moved. The bundle inlines
  three.js and exports none of it, so a module outside this directory cannot build a mesh of its
  own, and the lock-state marks of Unit 3.5 are meshes. The four names are the smallest set that
  draws a flat unlit shape: a geometry, an attribute to fill it, an unlit material and the mesh
  that carries both. `src/tray/affordance.ts` imports them and nothing else does. The typings
  declare all four and they stay opaque, for the reason at the top of `dice-tray.d.ts`. The Unit
  3.5 row in `LEDGER.md` records what the lazy chunk grew by.
- The typings also declare `raycaster` on `DiceBox`, and `position`, `scale`, `geometry` and
  `traverse` on `TrayDie`. The published build already has every one of them. Only the
  declarations are new.
- **`enableDiceSelection`, `onDiceHover` and `onDiceClick` are left alone and unused.** The
  published click path fires only when `onMouseMove` has already set `hoveredDice`, so a click
  with no pointer move before it reports nothing. `src/tray/affordance.ts` hit-tests the click
  event itself, through the same `raycaster`, and needs no hover state.

## What the up-face fix changed

- `simulateThrow` puts the world clock back where it found it. The library decides every face in
  a first pass, then puts the bodies back at the spawn state and replays the same fixed-step
  sequence for the player to watch. A body sleeps when `world.time` minus `timeLastSleepy` passes
  `sleepTimeLimit`, and 0.9 seconds is exactly 54 steps of the 1/60 second timestep, so that test
  lands on a step boundary. The published code let the clock run on into the replay, where
  `world.time` is larger and carries different accumulated rounding, so a die slept one step
  earlier there. From that step the two passes took different paths and came to rest in different
  poses. The face labels are swapped against the first pass, so a die could show a face the rules
  core never chose. One line saved and one line restored make the replay read the same clock
  values the first pass read, and the two passes are then identical step for step.
