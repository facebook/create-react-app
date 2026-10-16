/**
 * Applies the panel's edits over the shipped copy.
 *
 * This runs in two completely different places and has to behave identically
 * in both, which is why it lives in its own file rather than being written
 * twice. The build calls it (scripts/fetch-content.mjs) to bake the current
 * copy into the HTML, and the browser calls it to pick up anything edited
 * since that build. Two copies of these rules would eventually disagree, and
 * the disagreement would be the site showing something the panel never
 * sanctioned.
 *
 * Only sections the site knows about, and only when the shape still matches.
 * An override is written by a form, but it arrives over the network from a
 * server that could be mid-deploy or mid-migration. Anything that does not
 * look like the default it replaces is dropped in favour of that default, so
 * one malformed row cannot empty a section of the live site.
 *
 * @template T
 * @param {T} base      the shipped defaults, and the shape everything is judged against
 * @param {unknown} incoming  whatever the panel returned
 * @param {(message: string) => void} [onSkip]  told about each section dropped, and why
 * @returns {T}
 */
export function mergeContent(base, incoming, onSkip) {
  if (!incoming || typeof incoming !== 'object') return base;

  const out = structuredClone(base);

  for (const [page, sections] of Object.entries(base)) {
    for (const section of Object.keys(sections)) {
      const candidate = incoming?.[page]?.[section];
      if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
        continue;
      }

      const expected = Object.keys(sections[section]);
      const missing = expected.filter((key) => !Object.keys(candidate).includes(key));
      if (missing.length > 0) {
        onSkip?.(`${page}.${section} is missing ${missing.join(', ')} — keeping the shipped copy`);
        continue;
      }

      out[page][section] = candidate;
    }
  }

  return out;
}
