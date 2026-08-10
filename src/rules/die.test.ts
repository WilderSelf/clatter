import { describe, expect, it } from 'vitest';
import { appendValue, createDie, keepValue, latestValue } from './die';

describe('the history matrix', () => {
  it('carries null for every generation before a die appears', () => {
    const late = createDie('stress-1', 'stress', 6, 2);
    expect(late.values, 'a die added at generation 2 holds two nulls').toEqual([null, null]);
    expect(latestValue(late), 'a die that has not rolled has no value').toBeNull();
    expect(appendValue(late, 4).values).toEqual([null, null, 4]);
  });

  it('repeats the previous value for a locked die', () => {
    const locked = keepValue(appendValue(createDie('attribute-1', 'attribute', 6), 6));
    expect(locked.values, 'a locked die repeats its previous value').toEqual([6, 6]);
  });

  it('stays rectangular over three generations', () => {
    // Generation 0: the skill die rolls 3. The stress die does not exist yet.
    const early = appendValue(createDie('skill-1', 'skill', 8), 3);
    const late = createDie('stress-1', 'stress', 6, 1);
    // Generation 1: the skill die is locked. The stress die joins and rolls 1.
    const second = [keepValue(early), appendValue(late, 1)];
    // Generation 2: both dice roll 2.
    const generations = second.map((die) => appendValue(die, 2));

    expect(
      generations.map((die) => die.values.length),
      'every row holds one entry per generation',
    ).toEqual([3, 3]);
    expect(generations.map((die) => die.values)).toEqual([
      [3, 3, 2],
      [null, 1, 2],
    ]);
  });

  it('does not change the die it is given', () => {
    const die = createDie('gear-1', 'gear', 6);
    appendValue(die, 5);
    expect(die.values, 'append is not a mutation').toEqual([]);
  });
});
