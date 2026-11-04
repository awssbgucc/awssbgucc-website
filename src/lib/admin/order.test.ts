import { describe, expect, it } from 'vitest';
import { moveInList } from './order';

describe('moveInList', () => {
  it('moves up and down', () => {
    expect(moveInList(['a', 'b', 'c'], 'b', 'up')).toEqual(['b', 'a', 'c']);
    expect(moveInList(['a', 'b', 'c'], 'b', 'down')).toEqual(['a', 'c', 'b']);
  });

  it('leaves the ends and unknown ids alone', () => {
    expect(moveInList(['a', 'b'], 'a', 'up')).toEqual(['a', 'b']);
    expect(moveInList(['a', 'b'], 'b', 'down')).toEqual(['a', 'b']);
    expect(moveInList(['a', 'b'], 'x', 'up')).toEqual(['a', 'b']);
  });
});
