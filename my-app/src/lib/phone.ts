/**
 * +916374942976 -> +91 63749 42976.
 *
 * seo.json holds the dialling form, which is what tel: needs and what nobody
 * wants to read. Derived rather than written out a second time, so the two can
 * never end up being different numbers.
 *
 * Its own module now rather than a private function in the footer: the town
 * pages print the number too, and the second copy of this is the one that goes
 * out of step.
 */
export function readablePhone(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, '');
  return digits.length === 12 && digits.startsWith('91')
    ? `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`
    : raw;
}
