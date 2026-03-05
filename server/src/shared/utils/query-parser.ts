import {
  MongooseQueryParser,
  type QueryOptions
} from '@quarks/mongoose-query-parser';
import type { ParsedQs } from 'qs';

import {
  buildMongoNormalizationExpr,
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
 * Post-processes a parsed MongoDB filter to replace any RegExp field conditions
 * with diacritic-insensitive equivalents using $expr + $regexMatch +
 * $replaceAll normalization chain.
 *
 * This allows queries like name=/ca rot/i to match documents storing "Cà Rốt"
 * without requiring any schema changes or pre-normalized fields.
 */
function transformVietnameseSearchFilter(
  filter: Record<string, any>
): Record<string, any> {
  const transformed = { ...filter };
  const exprConditions: object[] = [];

  for (const [key, value] of Object.entries(filter)) {
    // Skip MongoDB operator keys like $or, $and, $expr, etc.
    if (key.startsWith('$')) continue;

    if (value instanceof RegExp) {
      const normalizedPattern = removeVietnameseDiacritics(value.source);
      exprConditions.push({
        $regexMatch: {
          input: buildMongoNormalizationExpr(`$${key}`),
          regex: normalizedPattern,
          options: value.flags
        }
      });
      delete transformed[key];
    } else if (typeof value === 'string') {
      const normalizedPattern = removeVietnameseDiacritics(value);
      exprConditions.push({
        $regexMatch: {
          input: buildMongoNormalizationExpr(`$${key}`),
          regex: normalizedPattern,
          options: 'i'
        }
      });
      delete transformed[key];
    }
  }

  if (exprConditions.length === 1) {
    if (transformed.$expr) {
      transformed.$expr = { $and: [transformed.$expr, exprConditions[0]] };
    } else {
      transformed.$expr = exprConditions[0];
    }
  } else if (exprConditions.length > 1) {
    if (transformed.$expr) {
      transformed.$expr = {
        $and: [transformed.$expr, ...exprConditions]
      };
    } else {
      transformed.$expr = { $and: exprConditions };
    }
  }

  return transformed;
}
