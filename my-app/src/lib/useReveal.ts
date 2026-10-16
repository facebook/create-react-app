import { useEffect, useRef } from 'react';

/**
 * Reveals an element the first time it scrolls into view.
 *
 * An IntersectionObserver rather than a scroll listener: the browser reports
 * intersections off the main thread, so this costs nothing while scrolling,
 * where a scroll handler would run on every frame.
 *
 * It unobserves after firing -- an element should animate in once, not
 * re-animate every time it passes the viewport, which is distracting when
 * someone scrolls back up.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Anyone who has asked for reduced motion just gets the content.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('is-visible');
      return;
    }

    // Something already on screen at load should not wait for a scroll.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }
      },
      // Fire a little before the element's top edge arrives, so the animation
      // is already underway by the time it is properly in view.
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}
