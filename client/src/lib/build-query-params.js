/**
 * Builds URLSearchParams from an object of parameters
 *
 * @param {Object} params - Object containing query parameters
 * @param {string[]} [partialSearchFields=[]] - Array of field names that should use partial/regex search
 *
 * @returns {URLSearchParams} - URLSearchParams object ready to append to URL
 */
export const buildQueryParams = (params, partialSearchFields = []) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach(v => searchParams.append(key, v));
      return;
    }

    if (partialSearchFields.includes(key)) {
      searchParams.set(key, `/${value}/i`);
      return;
    }

    searchParams.set(key, value.toString());
  });

  return searchParams;
};
