import { describe, expect, it } from 'vitest';

import { parseQuery } from '~/shared/utils/query-parser';

describe('parseQuery', () => {
  it('builds regex filter for string search without using $expr', () => {
    const parsed = parseQuery({ name: 'ca' });
    const regex = parsed.filter.name as RegExp;

    expect(regex).toBeInstanceOf(RegExp);
    expect(regex.test('Cà chua')).toBe(true);
    expect(regex.test('Ca rot')).toBe(true);
    expect(parsed.filter.$expr).toBeUndefined();
  });

  it('keeps regex query syntax and applies normalized pattern', () => {
    const parsed = parseQuery({ name: '/ca/i' });
    const regex = parsed.filter.name as RegExp;

    expect(regex).toBeInstanceOf(RegExp);
    expect(regex.flags.includes('i')).toBe(true);
    expect(regex.test('ca')).toBe(true);
  });
});
