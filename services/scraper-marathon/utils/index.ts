/**
 * Compares two sanitized strings.
 * Sanitization removes all non alfanumeric characters.
 * @param a The string to be sanitized and compared against `b`
 * @param b The string to be sanitized and compared against `a`
 * @returns `true` if the sanitized strings are equal to each other. `false` otherwise
 */
export function sanitizedEquals(a: string, b: string): boolean {
  const sanitizer = /[^\w]+/i;
  return a.replace(sanitizer, '') === b.replace(sanitizer, '');
}