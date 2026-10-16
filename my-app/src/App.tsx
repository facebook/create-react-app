import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useSeo } from './lib/useSeo';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SceneDefs } from './components/art/SectionArt';
import { FloatingActions } from './components/FloatingActions';
import { Home } from './pages/Home';

/**
 * Every page but the home page is fetched when it is asked for.
 *
 * One bundle held all fourteen, so a visitor landing on the home page
 * downloaded and parsed the tariff table, the blog, the places list and the
 * enquiry form before the first word appeared -- on a phone, on a rural
 * connection, which is most of this site's traffic. None of it is needed to
 * paint the page they asked for.
 *
 * Home is imported normally rather than lazily. It is the page most people
 * arrive on, and splitting it would only add a second round trip before the
 * thing they came for.
 *
 * The chunks are named so that what a browser fetches is legible in the
 * network panel, which is the difference between diagnosing a slow page and
 * guessing at it.
 */
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const Cars = lazy(() => import('./pages/Cars').then(m => ({ default: m.Cars })));
const Bikes = lazy(() => import('./pages/Bikes').then(m => ({ default: m.Bikes })));
const WeddingCars = lazy(() => import('./pages/WeddingCars').then(m => ({ default: m.WeddingCars })));
const TouristVehicles = lazy(() => import('./pages/TouristVehicles').then(m => ({ default: m.TouristVehicles })));
const Nri = lazy(() => import('./pages/Nri').then(m => ({ default: m.Nri })));
const Monthly = lazy(() => import('./pages/Monthly').then(m => ({ default: m.Monthly })));
const Tariff = lazy(() => import('./pages/Tariff').then(m => ({ default: m.Tariff })));
const Blog = lazy(() => import('./pages/Blog').then(m => ({ default: m.Blog })));
const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const Places = lazy(() => import('./pages/Places').then(m => ({ default: m.Places })));
const Services = lazy(() => import('./pages/Services').then(m => ({ default: m.Services })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));
const CarRentalAreas = lazy(() => import('./pages/CarRentalAreas').then(m => ({ default: m.CarRentalAreas })));
const Town = lazy(() => import('./pages/Town').then(m => ({ default: m.Town })));
const CarModel = lazy(() => import('./pages/CarModel').then(m => ({ default: m.CarModel })));
const ServiceArea = lazy(() => import('./pages/ServiceArea').then(m => ({ default: m.ServiceArea })));
const Post = lazy(() => import('./pages/Post').then(m => ({ default: m.Post })));

/**
 * A browser restores scroll position on navigation, which on a client-side
 * router means a new page can open halfway down. Reset on every path change.
 *
 * A #hash is honoured by the browser only on a real page load, so a link like
 * /contact#enquire used to land at the top of Contact rather than on the form
 * it named. <main> is keyed on the path and remounts, so the target does not
 * exist yet when this runs -- hence waiting for the frame it paints in.
 */
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    const frame = requestAnimationFrame(() => {
      document
        .getElementById(hash.slice(1))
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);
  return null;
}

function App() {
  useSeo();
  const { pathname } = useLocation();

  return (
    <>
      <ScrollToTop />
      {/* The gradients the illustrated cards paint with, once for the page
          rather than once per drawing. See SectionArt. */}
      <SceneDefs />
      <Header />
      {/* Keyed on the path so React remounts on navigation and the entrance
          animation replays; without the key the DOM is reused and nothing
          animates. */}
      <main key={pathname} data-page="">
        {/* A plain navy band rather than a spinner. The chunk for a page on
            this site is a few kilobytes and arrives in well under the time a
            spinner takes to stop looking like a fault; what matters is that
            the header does not jump, so the fallback holds the height. */}
        <Suspense fallback={<div aria-hidden="true" className="min-h-[70vh] bg-navy" />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/cars" element={<Cars />} />
          {/* One page per vehicle people ask for by name, under the listing
              they all appear on. Matched inside CarModel, which renders the
              404 page for a slug nobody has written -- a route that matched
              anything would turn every typo into a thin page with a name on
              it. */}
          <Route path="/cars/:slug" element={<CarModel />} />
          <Route path="/bikes" element={<Bikes />} />
          {/* One service in one town, where that pair has something of its
              own to say. Matched on the whole path inside ServiceArea, which
              renders the 404 page for a combination nobody has written --
              there is no matrix here on purpose. */}
          <Route path="/bikes/:slug" element={<ServiceArea />} />
          <Route path="/wedding-cars" element={<WeddingCars />} />
          <Route path="/wedding-cars/:slug" element={<ServiceArea />} />
          <Route path="/tourist-vehicles" element={<TouristVehicles />} />
          <Route path="/tourist-vehicles/:slug" element={<ServiceArea />} />
          <Route path="/monthly" element={<Monthly />} />
          <Route path="/monthly/:slug" element={<ServiceArea />} />
          <Route path="/nri" element={<Nri />} />
          <Route path="/tariff" element={<Tariff />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<Post />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/places" element={<Places />} />
          <Route path="/services" element={<Services />} />
          {/* One page per town we deliver to, and the hub above them. The
              slug is matched inside Town, which renders the 404 page for one
              nobody has written -- a route that matches anything would
              otherwise turn every typo into a thin page with a name in it. */}
          <Route path="/car-rental" element={<CarRentalAreas />} />
          <Route path="/car-rental/:slug" element={<Town />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </main>
      <Footer />
      <FloatingActions />
    </>
  );
}

export default App;
