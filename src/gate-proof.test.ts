import { expect, it } from 'vitest';

/**
 * Gate proof. This test fails on purpose. It exists to make one CI run red, so
 * the branch protection on the default branch can be observed to refuse the
 * merge. It is deleted with the branch that carries it, and it must never reach
 * the default branch.
 */
it('gate proof: fails on purpose so the merge gate is seen to block a red run', () => {
  expect(1).toBe(2);
});
