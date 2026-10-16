import { useHome } from '../content';
import { Icon3d } from './Icon3d';
import type { Icon3dName } from './Icon3d';

/**
 * The social icons in the footer.
 *
 * The heading above them belongs to the footer column that places them, not
 * here -- this is the row of icons and nothing else.
 *
 * WhatsApp is not among them. It is a way to message us, not a page to
 * follow, and the footer's contact column now carries it with a number
 * beside it -- two WhatsApp links a hand's width apart read as a mistake.
 * The panel's WhatsApp box still feeds that row.
 *
 * A named field per network rather than a list the owner adds rows to: the
 * icon has to match the link, and a free-text "network" box would let someone
 * type "insta" and get no icon with nothing explaining why. Empty means the
 * icon is not shown at all — an icon that links nowhere is worse than no icon.
 */
const NETWORKS = [
  { key: 'instagram', label: 'Instagram', icon: 'instagram' },
  { key: 'facebook', label: 'Facebook', icon: 'facebook' },
] as const satisfies readonly { key: string; label: string; icon: Icon3dName }[];

/** Whether any network has an address, so a column can decide to print the
 *  heading above them at all rather than leaving one over an empty space. */
export function hasSocialLinks(social: Record<string, string | undefined> | undefined): boolean {
  return NETWORKS.some((n) => {
    const url = social?.[n.key];
    return typeof url === 'string' && url.trim() !== '';
  });
}

export function SocialLinks() {
  const social = useHome().social;

  const shown = NETWORKS.filter((n) => {
    const url = social?.[n.key];
    return typeof url === 'string' && url.trim() !== '';
  });

  if (shown.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2.5">
      {shown.map((n) => (
        <li key={n.key}>
          <a
            href={social[n.key]}
            target="_blank"
            rel="noopener noreferrer"
            // The accessible name is the network, not "link": a row of icons
            // announced as six identical links is a row nobody can use.
            aria-label={n.label}
            title={n.label}
            className="icon-btn3d grid size-11 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            <Icon3d name={n.icon} size={44} />
          </a>
        </li>
      ))}
    </ul>
  );
}
