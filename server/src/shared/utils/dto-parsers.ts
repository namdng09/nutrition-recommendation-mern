import { RefinementCtx, z } from 'zod';

export const parseJSON = (val: unknown, ctx: RefinementCtx) => {
  if (val === undefined || val === null) return undefined;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      ctx.addIssue({ code: 'custom', message: 'Định dạng JSON không hợp lệ' });
      return z.NEVER;
    }
  }
  return val;
};

export const booleanSchema = z.union(
  [z.boolean(), z.enum(['true', 'false']).transform(v => v === 'true')],
  { error: () => 'Giá trị phải là true hoặc false' }
);
