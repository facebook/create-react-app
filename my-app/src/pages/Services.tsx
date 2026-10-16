import { ServicesInFull } from '../components/ServicesInFull';
import { PageHeader } from './PageHeader';

/**
 * Everything we hire, on one page.
 *
 * It was the home page's card grid again -- six pictures with a sentence each
 * and "See details", which is a menu of six pages rather than an answer. The
 * page now carries the services themselves: what each one covers, what comes
 * with it, and the two ways to ask, with the row of buttons at the top
 * jumping to whichever one somebody came for.
 *
 * The six pages underneath are untouched and linked from every block. They
 * are separate searches -- a wedding car is not a scooter -- and a page can
 * only rank for what it is about.
 */
export function Services() {
  return (
    <>
      <PageHeader
        photo="services-hero"
        scene="/cars"
        title="Rental cars, bikes and more"
        imageAlt="Self-drive cars, bikes and tourist vehicles for rent across Kanyakumari district"
        intro="Cars you drive yourself, bikes by the day, vehicles with a driver, and cars for a wedding. Self drive car rental is the bulk of it, and everything here is rented out across Kanyakumari district."
      />
      <ServicesInFull />
    </>
  );
}
