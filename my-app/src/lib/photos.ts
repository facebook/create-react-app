import photos from '../data/photos.json';

/**
 * Looks up a photograph by slot.
 *
 * Slot names in the code are sometimes route paths (`/wedding-cars`), and a
 * filename cannot contain a slash -- so the leading one is dropped before the
 * lookup. Without that, every service card would quietly stay a drawing no
 * matter what you put in public/photos, which is the kind of failure nobody
 * reports as a bug because it looks like a design decision.
 */
export function photoFor(slot: string): string | undefined {
  const key = slot.replace(/^\/+/, '');
  return (photos as Record<string, string | undefined>)[key];
}

/** True when a real photograph is available for this slot. */
export function hasPhoto(slot: string): boolean {
  return photoFor(slot) !== undefined;
}
