#!/usr/bin/env node
// Steps-to-rest gate. Runs the tray physics in node, with no renderer, and
// compares the number of steps against budgets.json.
//
// Exit 0 clean, 1 over budget or a scene mismatch, 2 on a usage or data error.
//
// Why node and not a browser. The physics is cannon-es on the CPU. It needs no
// WebGL, no canvas and no display, so this gate cannot flake on a GPU or on a
// shared runner. The count is an integer over a fixed scene, which is the only
// kind of performance number CI is allowed to judge.
//
// What it measures. The library simulates the whole throw synchronously before
// it draws the first frame, in `simulateThrow`, and that loop is the frozen tab
// a player feels. Its length is the number counted here: steps until every die
// body is asleep.
//
// How the scene stays honest. `perf-scene.json` holds every starting vector, so
// the scene is pinned in the repository rather than implied. The gate hashes
// the resolved scene — the pinned vectors plus the wall positions, the collision
// shapes, the body parameters and the contact materials the library builds from
// them — and compares that digest against budgets.json. A changed scene fails by
// name, because a bound recorded against one scene says nothing about another.
//
// Constraint 5: every number comes out of budgets.json, and a null budget fails
// loudly rather than skipping.
//
// Usage:
//   node scripts/perf.mjs [--runs <n>] [--quick] [--budgets <path>] [--scene <path>]
//   node scripts/perf.mjs --slow <factor>     test only, see below
//   node scripts/perf.mjs --emit-scene [--seed <n>]

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { readBudget } from './check-bundle-size.mjs';
import {
  DiceBox,
  DiceFactory,
  PhysicsBody,
  PhysicsMaterial,
  PhysicsWorld,
  trayDefaults,
} from '../src/tray/vendor/dice-tray.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const STEPS_KEY = 'steps_to_rest_fixed_seed_scene';
const DIGEST_KEY = 'steps_to_rest_scene_sha256';

/** The scene the browser harness renders, so both gates judge the same pool. */
const DEFAULT_NOTATION = '3d6+3d8+3d10+3d12@6,1,3,8,2,5,10,4,7,12,6,9';
/** The default viewport of the browser harness, in CSS pixels. */
const DEFAULT_CONTAINER = { width: 800, height: 600 };
/** How many runs prove the count repeats. One run cannot show a spread. */
const DEFAULT_RUNS = 5;

/** A small seeded generator. It stands in for `Math.random` while a scene is emitted. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Where the tray walls stand, in world units.
 *
 * The arithmetic is the library's own, from `setDimensions`: a wall stands one
 * `baseScale` inside the frame, and never closer than 40 per cent of it. The
 * result goes into the scene digest, so a wall that moves fails by name.
 */
export function trayWalls(container) {
  return {
    wallX: Math.max(container.width - trayDefaults.baseScale, container.width * 0.4),
    wallY: Math.max(container.height - trayDefaults.baseScale, container.height * 0.4),
  };
}

/**
 * Build the throw vectors for one seed, through the library's own recipe.
 *
 * `startClickThrow` reads `Math.random` four times per die and once for the
 * throw direction, so the seeded generator replaces it for the length of the
 * call and is put back afterwards. The vectors it returns are written to
 * `perf-scene.json` and never generated again, so the gate itself calls no
 * random source at all.
 */
export function emitScene(seed, container = DEFAULT_CONTAINER, notation = DEFAULT_NOTATION) {
  const context = Object.assign(Object.create(DiceBox.prototype), {
    DiceFactory: new DiceFactory({ baseScale: trayDefaults.baseScale }),
    dieIndex: 0,
    rolling: false,
    strength: trayDefaults.strength,
    display: {
      currentWidth: container.width / 2,
      currentHeight: container.height / 2,
      ...trayWalls(container),
    },
  });
  const saved = Math.random;
  Math.random = mulberry32(seed);
  let vectors;
  try {
    vectors = context.startClickThrow(notation).vectors;
  } finally {
    Math.random = saved;
  }
  return {
    seed,
    notation,
    container,
    dice: vectors.map(({ type, pos, axis, angle, velocity }) => ({
      type,
      pos,
      axis,
      angle,
      velocity,
    })),
  };
}

/**
 * Build the physics world for a pinned scene.
 *
 * The tray walls and every die body come from the library's own methods, called
 * against a plain object rather than a `DiceBox`, because a `DiceBox` builds a
 * renderer and there is none here. Only the physics half of the library runs.
 *
 * Returns the world, the die bodies, and the resolved scene the digest covers.
 */
export function buildWorld(scene) {
  const factory = new DiceFactory({ baseScale: trayDefaults.baseScale });
  const world = new PhysicsWorld();
  world.gravity.set(0, 0, -9.8 * trayDefaults.gravity_multiplier);
  world.solver.iterations = 14;
  world.allowSleep = true;

  const context = Object.assign(Object.create(DiceBox.prototype), {
    world,
    box_body: {},
    dice_body_material: new PhysicsMaterial(),
    display: trayWalls(scene.container),
    // `spawnDice` binds this for the collide event, which only plays a sound.
    eventCollide() {},
  });
  context.makeWorldBox();

  const bodies = [];
  const resolvedDice = [];
  for (const entry of scene.dice) {
    const definition = factory.get(entry.type);
    if (!definition)
      throw new Error(
        `perf-scene names die type ${entry.type}, which the tray has no definition for`,
      );
    const shape = factory.createGeometry(
      definition.shape,
      definition.scale * trayDefaults.baseScale,
      true,
    );
    const die = {
      mass: definition.mass,
      shape: definition.shape,
      geometry: { cannon_shape: shape },
      body: {},
    };
    context.spawnDice(entry, die);
    bodies.push(die.body);
    resolvedDice.push({
      spawn: entry,
      mass: die.body.mass,
      linearDamping: die.body.linearDamping,
      angularDamping: die.body.angularDamping,
      sleepSpeedLimit: die.body.sleepSpeedLimit,
      sleepTimeLimit: die.body.sleepTimeLimit,
      vertices: shape.vertices.map((v) => [v.x, v.y, v.z]),
    });
  }

  const resolved = {
    walls: context.display,
    gravity: [world.gravity.x, world.gravity.y, world.gravity.z],
    solverIterations: world.solver.iterations,
    contacts: world.contactmaterials.map((c) => [c.friction, c.restitution]),
    dice: resolvedDice,
  };
  return { world, bodies, resolved };
}

/** The fingerprint of the scene a step count was recorded against. */
export function sceneDigest(resolved) {
  return createHash('sha256').update(JSON.stringify(resolved)).digest('hex');
}

/**
 * Step the world until every die sleeps, and count the steps.
 *
 * `limit` is the library's own iteration limit, held in simulated seconds, so a
 * smaller timestep gets proportionally more steps and a scene that never settles
 * still stops. A run that hits the limit is reported as such and never compared
 * against the budget, because it did not measure a rest.
 */
export function stepsToRest(world, bodies, timestep, limit) {
  const asleep = () => bodies.every((body) => body.sleepState === PhysicsBody.SLEEPING);
  let steps = 0;
  while (steps < limit && !asleep()) {
    world.step(timestep);
    steps += 1;
  }
  return { steps, settled: asleep() };
}

/** One whole measurement: build the scene fresh, then step it to rest. */
function measure(scene, timestep, limit) {
  const { world, bodies, resolved } = buildWorld(scene);
  return { ...stepsToRest(world, bodies, timestep, limit), resolved };
}

function parseArgs(argv) {
  const options = {
    runs: DEFAULT_RUNS,
    slow: 1,
    seed: 20260808,
    emitScene: false,
    budgets: join(HERE, '..', 'budgets.json'),
    scene: join(HERE, 'perf-scene.json'),
  };
  const number = (raw, name) => {
    const value = Number(raw);
    if (!Number.isFinite(value) || value <= 0) throw new Error(`${name} needs a positive number`);
    return value;
  };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--quick') options.runs = 1;
    else if (argv[i] === '--emit-scene') options.emitScene = true;
    else if (argv[i] === '--runs') options.runs = number(argv[(i += 1)], '--runs');
    else if (argv[i] === '--slow') options.slow = number(argv[(i += 1)], '--slow');
    else if (argv[i] === '--seed') options.seed = number(argv[(i += 1)], '--seed');
    else if (argv[i] === '--budgets') options.budgets = argv[(i += 1)];
    else if (argv[i] === '--scene') options.scene = argv[(i += 1)];
    else throw new Error(`unknown argument: ${argv[i]}`);
  }
  if (options.budgets === undefined || options.scene === undefined) {
    throw new Error('an option needs a value');
  }
  return options;
}

function main(argv) {
  let options;
  try {
    options = parseArgs(argv);
  } catch (err) {
    console.error(`perf: ${err.message}`);
    return 2;
  }

  if (options.emitScene) {
    console.log(JSON.stringify(emitScene(options.seed), null, 2));
    return 0;
  }

  const scene = JSON.parse(readFileSync(options.scene, 'utf8'));
  // --slow is a test-only flag. It shrinks the timestep, so the same throw takes
  // proportionally more steps to reach rest. It exists to prove this gate can go
  // red. Nothing on the shipping path reads it, and CI never passes it.
  const timestep = trayDefaults.framerate / options.slow;
  const limit = Math.ceil(trayDefaults.iterationLimit * options.slow);
  if (options.slow !== 1) {
    console.log(
      `perf: TEST-ONLY --slow=${options.slow}. The timestep is ${timestep} against a ` +
        `normal ${trayDefaults.framerate}. This run is not a measurement.`,
    );
  }

  // The vendored narrowphase prints a `clamped:` line whenever it clips a deep
  // overlap, which the first steps of a throw always produce. Fourteen lines a
  // run would bury the report, so they are held back and counted. A line the
  // library has never printed here is passed through rather than swallowed.
  const runs = [];
  const held = [];
  const write = console.log;
  console.log = (...parts) => held.push(parts.join(' '));
  try {
    for (let i = 0; i < options.runs; i += 1) runs.push(measure(scene, timestep, limit));
  } finally {
    console.log = write;
  }
  const unexpected = held.filter((line) => !line.startsWith('clamped:'));
  for (const line of unexpected) console.log(`perf: tray said: ${line}`);
  console.log(`perf: tray warnings held=${held.length} clamped=${held.length - unexpected.length}`);

  const counts = runs.map((run) => run.steps);
  const spread = Math.max(...counts) - Math.min(...counts);
  console.log(
    `perf: scene=${scene.notation} dice=${scene.dice.length} seed=${scene.seed} ` +
      `container=${scene.container.width}x${scene.container.height} timestep=${timestep}`,
  );
  console.log(`perf: steps runs=${counts.length} counts=${counts.join(',')} spread=${spread}`);

  const failures = [];

  if (spread !== 0) {
    console.log(
      `perf: FAIL ${STEPS_KEY} is not deterministic. ${counts.length} runs of one scene ` +
        `gave ${counts.join(',')}, a spread of ${spread}. A bound over a wandering number is worthless.`,
    );
    failures.push(`${STEPS_KEY} spread=${spread}`);
  }

  const first = runs[0];
  const digest = sceneDigest(first.resolved);
  const budgets = JSON.parse(readFileSync(options.budgets, 'utf8'));
  // The digest is a fingerprint, not a bound, so it does not go through
  // readBudget. It fails the same way a null budget does: loudly, never skipped.
  const recordedDigest = budgets[DIGEST_KEY];
  if (typeof recordedDigest !== 'string' || !/^[0-9a-f]{64}$/.test(recordedDigest)) {
    console.error(
      `perf: budgets.json holds no scene digest at ${DIGEST_KEY}. The scene a step count was ` +
        `recorded against is unknown, so the count cannot be judged. Record it in the unit that ` +
        `owns it. Do not invent one and do not skip the check.`,
    );
    return 2;
  }
  if (digest !== recordedDigest) {
    console.log(
      `perf: FAIL ${DIGEST_KEY} measured=${digest} recorded=${recordedDigest}. ` +
        `The scene changed, so the recorded ${STEPS_KEY} was measured against a different scene ` +
        `and means nothing. Re-measure it in the unit that changed the scene.`,
    );
    failures.push(`${DIGEST_KEY} measured=${digest} recorded=${recordedDigest}`);
  } else {
    console.log(`perf: OK ${DIGEST_KEY} ${digest}`);
  }

  let budget;
  try {
    budget = readBudget(budgets, STEPS_KEY);
  } catch (err) {
    console.error(`perf: ${err.message}`);
    return 2;
  }

  if (!first.settled) {
    console.log(
      `perf: FAIL ${STEPS_KEY} measured=none budget=${budget}. The scene did not come to rest ` +
        `inside ${limit} steps, so it has no steps-to-rest. This is not a budget failure.`,
    );
    failures.push(`${STEPS_KEY} measured=none budget=${budget}`);
  } else {
    const measured = Math.max(...counts);
    const verdict = measured <= budget ? 'OK' : 'FAIL';
    console.log(`perf: ${verdict} ${STEPS_KEY} measured=${measured} budget=${budget}`);
    if (measured > budget) failures.push(`${STEPS_KEY} measured=${measured} budget=${budget}`);
  }

  console.log(`perf: failures=${failures.length}`);
  return failures.length > 0 ? 1 : 0;
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main(process.argv.slice(2)));
}
