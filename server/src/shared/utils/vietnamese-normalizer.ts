/**
 * Removes Vietnamese diacritics from a string (Node.js side).
 * Used to normalize the search term before passing it to MongoDB.
 *
 * Example: "Cà Rốt" → "ca rot"
 */
export function removeVietnameseDiacritics(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}

/**
 * Builds a MongoDB aggregation expression that normalizes a stored string
 * field at query time by replacing all Vietnamese diacritic characters with
 * their ASCII base equivalents.
 *
 * Starts with $toLower then chains 67 $replaceAll calls — one per lowercase
 * Vietnamese character. This allows diacritic-insensitive partial matching
 * via $regexMatch inside $expr without any schema changes.
 *
 * Example: stored "Cà Rốt" → expression evaluates to "ca rot" at query time.
 *
 * @param fieldPath - MongoDB field path with $ prefix, e.g. "$name"
 */
export function buildMongoNormalizationExpr(fieldPath: string): object {
  const replacements: Array<[string, string]> = [
    ['à', 'a'],
    ['á', 'a'],
    ['ả', 'a'],
    ['ã', 'a'],
    ['ạ', 'a'],
    ['ă', 'a'],
    ['ắ', 'a'],
    ['ằ', 'a'],
    ['ẳ', 'a'],
    ['ẵ', 'a'],
    ['ặ', 'a'],
    ['â', 'a'],
    ['ấ', 'a'],
    ['ầ', 'a'],
    ['ẩ', 'a'],
    ['ẫ', 'a'],
    ['ậ', 'a'],
    ['đ', 'd'],
    ['è', 'e'],
    ['é', 'e'],
    ['ẻ', 'e'],
    ['ẽ', 'e'],
    ['ẹ', 'e'],
    ['ê', 'e'],
    ['ế', 'e'],
    ['ề', 'e'],
    ['ể', 'e'],
    ['ễ', 'e'],
    ['ệ', 'e'],
    ['ì', 'i'],
    ['í', 'i'],
    ['ỉ', 'i'],
    ['ĩ', 'i'],
    ['ị', 'i'],
    ['ò', 'o'],
    ['ó', 'o'],
    ['ỏ', 'o'],
    ['õ', 'o'],
    ['ọ', 'o'],
    ['ô', 'o'],
    ['ố', 'o'],
    ['ồ', 'o'],
    ['ổ', 'o'],
    ['ỗ', 'o'],
    ['ộ', 'o'],
    ['ơ', 'o'],
    ['ớ', 'o'],
    ['ờ', 'o'],
    ['ở', 'o'],
    ['ỡ', 'o'],
    ['ợ', 'o'],
    ['ù', 'u'],
    ['ú', 'u'],
    ['ủ', 'u'],
    ['ũ', 'u'],
    ['ụ', 'u'],
    ['ư', 'u'],
    ['ứ', 'u'],
    ['ừ', 'u'],
    ['ử', 'u'],
    ['ữ', 'u'],
    ['ự', 'u'],
    ['ỳ', 'y'],
    ['ý', 'y'],
    ['ỷ', 'y'],
    ['ỹ', 'y'],
    ['ỵ', 'y']
  ];

  return replacements.reduce(
    (expr, [find, replacement]) => ({
      $replaceAll: { input: expr, find, replacement }
    }),
    { $toLower: fieldPath } as object
  );
}
