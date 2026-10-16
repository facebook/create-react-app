import { useHome } from '../content';
import { Reveal } from './Reveal';
import { SectionArt } from './art/SectionArt';

/**
 * Booking, start to finish.
 *
 * The steps stand either side of one picture rather than in a row of cards
 * with a photograph each: four small photographs down one band were four
 * things to look at and nothing to read, and the numerals -- the only part
 * that carries the order -- were the smallest thing in each card. Here the
 * numeral is the largest thing in the step, and the picture is one picture,
 * big enough to be worth having.
 *
 * Still an <ol>. The order is the whole point of the section, and the two
 * columns are a layout rather than a change to what comes after what. The
 * list is laid out through its parent's grid (display: contents), so
 * role="list" is stated explicitly -- Safari drops list semantics from a list
 * that does not generate a box of its own.
 */
export function HowItWorks() {
  const home = useHome();
  const { heading, steps, noteLead, noteBody } = home.howItWorks;

  // Half on the left, the rest on the right, in reading order either way.
  const half = Math.ceil(steps.length / 2);
  const rows = Math.max(half, steps.length - half);

  return (
    <section id="how" className="bg-white py-20">
      <div className="mx-auto max-w-[86rem] px-5 sm:px-8 lg:px-12">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="section-eyebrow">Booking, start to finish</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            {heading}
          </h2>
        </Reveal>

        <div className="how-grid mt-12" style={{ ['--how-rows' as string]: String(rows) }}>
          <ol role="list" className="contents">
            {steps.map((s, i) => {
              const left = i < half;

              return (
                // The <li> is what the grid places -- placed rather than
                // flowed, so the list can run 1, 2, 3, 4 in the markup while
                // reading down one side and then the other on screen. Custom
                // properties, because the placement only applies once there
                // are two columns to place into.
                <li
                  key={s.n}
                  className="how-item"
                  style={{
                    ['--how-col' as string]: left ? '1' : '3',
                    ['--how-row' as string]: String((left ? i : i - half) + 1),
                  }}
                >
                  <Reveal delay={i * 120}>
                    <div className="flex gap-4 sm:gap-5">
                      <span aria-hidden="true" className="how-n">
                        {s.n}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold tracking-tight text-navy sm:text-xl">
                          {s.title}
                        </h3>
                        <p className="mt-2 leading-relaxed text-ink-dim">{s.body}</p>
                      </div>
                    </div>
                    <span aria-hidden="true" className="how-rule" />
                  </Reveal>
                </li>
              );
            })}
          </ol>

          <Reveal delay={80} className="how-photo">
            {/* One picture rather than one per step. SectionArt resolves the
                panel's upload for this slot, then a file in public/photos,
                then the drawing -- so the photograph already uploaded for the
                middle step is what stands here. */}
            <SectionArt
              name="step-2"
              alt="Booking a self-drive car with NiteSha Cars & Bikes"
              className="how-leaf"
            />
          </Reveal>
        </div>

        <Reveal delay={120}>
          <p className="mx-auto mt-12 max-w-3xl rounded-[14px] border border-line bg-cream p-5 text-sm leading-relaxed text-ink-dim">
            <strong className="font-semibold text-navy">{noteLead}</strong> {noteBody}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
