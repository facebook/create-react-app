import { usePlaces } from '../lib/usePlaces';
import { PlaceCard } from '../components/PlaceCard';
import { Reveal } from '../components/Reveal';
import { PageHeader } from './PageHeader';
import { BrandPanel } from '../components/BrandPanel';

/**
 * Everywhere worth driving to, grouped.
 *
 * Grouped by the category the panel sets rather than a list fixed here, so
 * adding a group is something the owner does. Order within a group follows the
 * panel's own ordering, which the endpoint has already applied.
 */
export function Places() {
  const places = usePlaces();

  // Insertion order of a Map is the order the keys were first seen, which is
  // the panel's ordering -- so the groups come out in the same sequence the
  // owner arranged, without a second list saying what that sequence is.
  const groups = new Map<string, typeof places>();
  for (const place of places) {
    const key = place.category || 'Worth the drive';
    groups.set(key, [...(groups.get(key) ?? []), place]);
  }

  return (
    <>
      <PageHeader
        photo="places-hero"
        scene="coast"
        title="Places to visit in Kanyakumari"
        imageAlt="The Kanyakumari coastline, with the Vivekananda Rock Memorial offshore"
        intro="Everything here is within a comfortable drive of Nagercoil. Rent a car for the day and see them in your own order, without waiting on a tour bus."
      />

      <div className="mx-auto max-w-[86rem] px-5 sm:px-8 lg:px-12 py-20">
        {places.length === 0 ? (
          <BrandPanel title="The list is on its way">
            We are still writing these up. Call us and we will tell you what is
            worth seeing while you have the car, and how long each one takes
            from Nagercoil.
          </BrandPanel>
        ) : (
          [...groups].map(([category, inGroup]) => (
            <section key={category} className="mb-16 last:mb-0">
              <h2 className="text-2xl font-bold tracking-tight text-navy">{category}</h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {inGroup.map((place, i) => (
                  <Reveal key={place.id} delay={i * 60}>
                    <PlaceCard place={place} />
                  </Reveal>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </>
  );
}
