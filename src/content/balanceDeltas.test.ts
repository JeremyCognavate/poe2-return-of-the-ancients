import { describe, it, expect } from 'vitest';
import { extractDeltas } from './balanceDeltas.js';

describe('extractDeltas', () => {
  it('parses arrow form, stripping quotes', () => {
    const d = extractDeltas(['"10% increased Projectile Damage" → "10% increased Attack Damage"']);
    expect(d).toEqual([{ before: '10% increased Projectile Damage', after: '10% increased Attack Damage' }]);
  });

  it('keeps trailing context on the after side', () => {
    const d = extractDeltas(['"8% Proj" → "8% Attack" (multiple nodes)']);
    expect(d[0].after).toBe('8% Attack (multiple nodes)');
  });

  it('parses previously form', () => {
    const d = extractDeltas(['The Culling Strike Threshold for Normal enemies is now 35% of their Maximum Life (previously 30%).']);
    expect(d).toHaveLength(1);
    expect(d[0].before).toBe('30%');
    expect(d[0].after).toBe('The Culling Strike Threshold for Normal enemies is now 35% of their Maximum Life');
  });

  it('ignores lines with no before/after pattern', () => {
    expect(extractDeltas(['Essence Monster Packs are now affected by modifiers to Pack Size.'])).toEqual([]);
  });

  it('handles a mixed list', () => {
    const d = extractDeltas([
      'A plain bullet.',
      '"old" → "new"',
      'Value is now 5 (previously 3).',
    ]);
    expect(d).toHaveLength(2);
  });
});
