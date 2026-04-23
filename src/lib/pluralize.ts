/**
 * Russian noun pluralization helper.
 *
 * Russian has three word-forms for quantities:
 *   1, 21, 31…   → singular nominative   ("1 тема")
 *   2-4, 22-24…  → singular genitive     ("2 темы")
 *   0, 5-20, 25… → plural genitive       ("5 тем")
 *
 * Forms are supplied as a tuple `[one, few, many]`. Example:
 *   plural(count, ["тема", "темы", "тем"])
 *   plural(count, ["час",  "часа", "часов"])
 *   plural(count, ["трек", "трека", "треков"])
 */
export function plural(n: number, forms: [string, string, string]): string {
  const abs = Math.abs(n);
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
}
