import {
  MongooseQueryParser,
  type QueryOptions
} from '@quarks/mongoose-query-parser';
import type { ParsedQs } from 'qs';

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
  return parser.parse(query);
};
