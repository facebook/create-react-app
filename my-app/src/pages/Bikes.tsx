import { ServicePage } from './ServicePage';

export function Bikes() {
  return (
    <ServicePage
      photo="bikes-hero"
      imageAlt="Scooters and motorcycles for rent in Nagercoil and Kanyakumari"
      scene="/bikes"
      title="Bike rental in Nagercoil & Kanyakumari"
      intro="Two-wheelers for rent by the hour, the day or the week, across Kanyakumari district."
      cta="Need a bike?"
      sections={[
        {
          heading: 'Scooters and motorcycles',
          body: 'A two-wheeler is the easiest way to get around Nagercoil and the coast road, and to reach places a car cannot park. We rent scooters for everyday running and motorcycles for longer rides.',
        },
        {
          heading: 'What it costs',
          body: 'Rates are quoted by the hour, the day or the week, and come down the longer you keep the bike. A refundable deposit applies, returned when the bike comes back. Fuel is on you.',
        },
        {
          heading: 'What to bring',
          body: 'A valid two-wheeler driving licence and a government photo ID. Helmets are provided with every rental.',
        },
      ]}
      points={[
        'Hourly, daily and weekly rates',
        'Helmets included',
        'Pickup across Kanyakumari district',
        'Refundable deposit, returned on return',
      ]}
    />
  );
}
