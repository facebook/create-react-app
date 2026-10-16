import { ServicePage } from './ServicePage';

export function WeddingCars() {
  return (
    <ServicePage
      photo="wedding-hero"
      imageAlt="A decorated wedding car for rent in Kanyakumari district"
      scene="/wedding-cars"
      title="Wedding car rental in Nagercoil & Kanyakumari"
      intro="Decorated cars and premium vehicles for marriages across Kanyakumari district."
      cta="Booking a wedding date?"
      sections={[
        {
          heading: 'Cars for the wedding day',
          body: 'A wedding car is not an ordinary rental. We set aside the vehicle for your date, prepare it properly, and make sure it arrives on time at the mandapam, church or hall.',
        },
        {
          heading: 'Decoration',
          body: 'Cars can be decorated to suit the wedding — tell us the colours or the style you have in mind and we will arrange it. If you have your own decorator, that is no problem either.',
        },
        {
          heading: 'Book early in season',
          body: 'Wedding season fills up. Muhurtham dates get taken weeks ahead, so the earlier you tell us the date, the better the choice of vehicle. We can hold a car once the date is fixed.',
        },
        {
          heading: 'More than one vehicle',
          body: 'Families usually need more than the one car — vehicles for relatives, and something larger for the group. Tell us the numbers and we will put together what is needed.',
        },
      ]}
      points={[
        'Decorated to your colours',
        'Vehicle reserved for your date',
        'Multiple cars for the family',
        'Serving Nagercoil, Marthandam, Colachel and Thuckalay',
      ]}
    />
  );
}
