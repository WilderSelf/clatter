import { describe, expect, it } from 'vitest';
import { APP_NAME } from './app';

describe('APP_NAME', () => {
  it('holds the placeholder application name', () => {
    expect(APP_NAME).toBe('Clatter');
  });
});
