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

const VIETNAMESE_CHAR_GROUPS: Record<string, string> = {
  a: 'aàáảãạăắằẳẵặâấầẩẫậ',
  d: 'dđ',
  e: 'eèéẻẽẹêếềểễệ',
  i: 'iìíỉĩị',
  o: 'oòóỏõọôốồổỗộơớờởỡợ',
  u: 'uùúủũụưứừửữự',
  y: 'yỳýỷỹỵ'
};

const REGEX_META_CHAR_PATTERN = /[\\^$.*+?()[\]{}|]/;

function escapeRegexChar(char: string): string {
  if (REGEX_META_CHAR_PATTERN.test(char)) {
    return `\\${char}`;
  }
  return char;
}

/**
 * Builds a regex source string that matches Vietnamese characters with or
 * without diacritics.
 *
 * Example: "ca rot" =>
 * "[c][aàáảãạăắằẳẵặâấầẩẫậ] r[oòóỏõọôốồổỗộơớờởỡợ]t"
 */
export function buildVietnameseInsensitivePattern(text: string): string {
  const normalized = removeVietnameseDiacritics(text);

  return Array.from(normalized)
    .map(char => {
      const variants = VIETNAMESE_CHAR_GROUPS[char];
      if (variants) {
        return `[${variants}]`;
      }
      return escapeRegexChar(char);
    })
    .join('');
}

/**
 * Builds a case-insensitive regex for Vietnamese diacritic-insensitive search.
 */
export function buildVietnameseInsensitiveRegex(
  text: string,
  flags = 'i'
): RegExp {
  const normalizedFlags = flags.includes('i') ? flags : `${flags}i`;
  return new RegExp(buildVietnameseInsensitivePattern(text), normalizedFlags);
}
