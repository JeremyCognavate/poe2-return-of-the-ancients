// scripts/__tests__/diff.test.mjs
import { describe, it, expect } from 'vitest';
import { diffDatasets } from '../diff.mjs';

describe('diffDatasets', () => {
  it('reports added keys', () => {
    const oldArr = [{ slug: 'a', name: 'A' }];
    const newArr = [{ slug: 'a', name: 'A' }, { slug: 'b', name: 'B' }];
    const r = diffDatasets(oldArr, newArr, 'slug');
    expect(r.added).toEqual(['b']);
    expect(r.changed).toEqual([]);
  });

  it('reports changed top-level fields', () => {
    const oldArr = [{ slug: 'a', name: 'A', reqLevel: 60 }];
    const newArr = [{ slug: 'a', name: 'A', reqLevel: 65 }];
    const r = diffDatasets(oldArr, newArr, 'slug');
    expect(r.added).toEqual([]);
    expect(r.changed).toEqual([{ key: 'a', fields: ['reqLevel'] }]);
  });

  it('ignores array reordering (no phantom change)', () => {
    const oldArr = [{ slug: 'a', mods: ['x', 'y'] }];
    const newArr = [{ slug: 'a', mods: ['y', 'x'] }];
    const r = diffDatasets(oldArr, newArr, 'slug');
    expect(r.changed).toEqual([]);
  });

  it('treats null old as all-added', () => {
    const r = diffDatasets(null, [{ id: '1' }, { id: '2' }], 'id');
    expect(r.added).toEqual(['1', '2']);
    expect(r.changed).toEqual([]);
  });
});
