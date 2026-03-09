import {
  MongooseQueryParser,
  type QueryOptions
} from '@quarks/mongoose-query-parser';
import type { ParsedQs } from 'qs';

import {
  buildVietnameseInsensitiveRegex,
  removeVietnameseDiacritics
} from './vietnamese-normalizer';

/**
 * Parse URL query parameters into MongoDB-friendly query options
 *
 * Filtering:
 * - ?name=John                 // Exact match
 * - ?name=/john/i              // Partial match (case-insensitive)
 * - ?name=/john/               // Partial match
 * - ?age[gte]=25               // Greater than or equal
 * - ?age[gt]=25                // Greater than
 * - ?age[lte]=50               // Less than or equal
 * - ?age[lt]=50                // Less than
 * - ?role=admin                // Exact match
 * - ?isActive=true             // Boolean
 *
 * Nested Filtering (with populate):
 * - ?favorites.name=/alice/i&populate=favorites
 *
 * Pagination:
 * - ?page=2                    // Page number (default: 1)
 * - ?limit=10                  // Items per page (default: 10)
 *
 * Sorting:
 * - ?sort=name                 // Ascending by name
 * - ?sort=-createdAt           // Descending by createdAt
 * - ?sort=name,-age            // Multiple sorts
 *
 * Field Selection:
 * - ?select=name,email,avatar  // Only return specified fields
 * - ?select=-password          // Exclude password field
 *
 * Population:
 * - ?populate=favorites        // Populate favorites field
 *
 * Combined Examples:
 * - ?name=/john/i&age[gte]=25&page=2&limit=10&sort=-createdAt
 * - ?role=admin&select=name,email&populate=favorites
 * - ?favorites.name=/alice/i&populate=favorites&sort=name
 */
export const parseQuery = (
  query: ParsedQs | Record<string, any>
): QueryOptions => {
  const parser = new MongooseQueryParser({
    skipKey: 'page',
    casters: {
      string: (val: string) => {
        // If wrapped in /.../, treat as regex
        if (val.startsWith('/') && val.endsWith('/i')) {
          return new RegExp(val.slice(1, -2), 'i');
        }
        if (val.startsWith('/') && val.endsWith('/')) {
          return new RegExp(val.slice(1, -1));
        }
        // Otherwise exact match
        return val;
      }
    }
  });
  const result = parser.parse(query);
  result.filter = transformVietnameseSearchFilter(result.filter);
  return result;
};

/**
 * Post-processes parsed filters into diacritic-insensitive RegExp conditions.
 *
 * This avoids deep nested aggregation expressions and remains compatible with
 * MongoDB Atlas BSON depth constraints.
 */
function transformVietnameseSearchFilter(
  filter: Record<string, any>
): Record<string, any> {
  const transformed = { ...filter };

  for (const [key, value] of Object.entries(filter)) {
    // Skip MongoDB operator keys like $or, $and, $expr, etc.
    if (key.startsWith('$')) continue;

    if (typeof value === 'string') {
      transformed[key] = buildVietnameseInsensitiveRegex(value, 'i');
      continue;
    }

    if (value instanceof RegExp) {
      // Preserve explicit regex syntax from caller (e.g. ?name=/beef/i).
      // Remove Vietnamese diacritics in the source to keep query behavior
      // consistent with string search where possible.
      transformed[key] = new RegExp(
        removeVietnameseDiacritics(value.source),
        value.flags
      );
    }
  }

  return transformed;
}
