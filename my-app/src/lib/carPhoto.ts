import type { Car } from '../data/cars';
import { photoFor } from './photos';

/**
 * Finds the photograph for one vehicle.
 *
 * Every car card had a picture slot and nothing ever filled it: the public
 * endpoint returns no image column, so `car.image` was always undefined and
 * every card in the fleet rendered the brand's first letter in grey. A letter
 * is not a photograph of a car, and a rental listing without a picture of the
 * car is the one thing a customer will not forgive.
 *
 * Until the panel can hold an uploaded photo per vehicle, the filename is the
 * link. Drop a file into my-app/public/photos and the next build finds it --
 * there is nothing to register, which is the point, because a list someone has
 * to remember to update is a list that goes stale.
 *
 *   car-maruti-suzuki-swift.webp   this exact car, brand and model
 *   car-swift.webp                 this model, whoever makes it
 *   car-suv.webp                   any SUV with no picture of its own
 *
 * Most specific wins. A business with one photo of a hatchback and one of an
 * SUV gets a sensible picture on every card from two files; photographing the
 * actual cars then replaces them one at a time, without touching any code.
 */

/** `Maruti Suzuki Swift` -> `maruti-suzuki-swift`, so a name can be a filename. */
function slug(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function carPhoto(car: Car): string | undefined {
  // car.image first: it costs nothing now and is where a photo uploaded in the
  // panel will arrive, so that change will not need this file reopened.
  return (
    car.image ??
    photoFor(`car-${slug(`${car.brand} ${car.name}`)}`) ??
    photoFor(`car-${slug(car.name)}`) ??
    photoFor(`car-${slug(car.bodyType)}`)
  );
}
