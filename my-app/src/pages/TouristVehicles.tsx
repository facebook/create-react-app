import { ServicePage } from './ServicePage';

export function TouristVehicles() {
  return (
    <ServicePage
      photo="tourist-hero"
      imageAlt="A tourist vehicle with a driver for sightseeing around Kanyakumari"
      scene="/tourist-vehicles"
      title="Tourist vehicle rental with driver"
      intro="Cars and vans with an experienced driver, for sightseeing around Kanyakumari and beyond."
      cta="Planning a trip?"
      sections={[
        {
          heading: 'A driver who knows the roads',
          body: 'For sightseeing, a local driver is worth more than a map. Ours know the district, the temple timings and where it is worth stopping — so the day works out rather than being spent looking for parking.',
        },
        {
          heading: 'Kanyakumari and around',
          body: 'The usual circuit takes in Kanyakumari, Suchindram, Padmanabhapuram Palace, Thirparappu falls and the coast. We will plan the day around what you want to see and how long you have.',
        },
        {
          heading: 'Longer tours',
          body: 'Temple tours and trips further into Tamil Nadu and Kerala are arranged on a per-day basis. Tell us the route and the number of days, and we will quote for it.',
        },
        {
          heading: 'Vehicles for groups',
          body: 'Cars for a family, larger vehicles for a group. Give us the number of people and the luggage, and we will suggest what fits comfortably rather than what merely fits.',
        },
      ]}
      points={[
        'Experienced local drivers',
        'Per-day and per-trip rates',
        'Vehicles sized for families or groups',
        'Temple tours and outstation trips arranged',
      ]}
    />
  );
}
