<?php
/**
 * The panel's icons: a coloured plate with a mark on it.
 *
 * The same recipe the site uses (my-app/src/components/Icon3d.tsx) written for
 * the server: a plate with a diagonal gradient, a gloss across its top half, a
 * shadow underneath and a rim inside the edge, with the mark in white on top.
 * Two copies rather than one, because the panel is PHP served from a different
 * machine and shares no build with the site -- the same trade the content
 * defaults already make.
 *
 * Every id inside is suffixed, because six plates on a page all defining
 * "plate" would every one of them paint with whichever the browser read last.
 *
 * Only where the icon is big enough to carry it. The bin on a table row and
 * the chevron on a summary stay hairlines: a plate at sixteen pixels is a
 * coloured square with something indistinct on it.
 */

/** Light end, dark end. The dark end is also the shadow. */
const ADMIN_ICON_TONES = [
    'gold'   => ['#f6dc84', '#c9a227'],
    'bronze' => ['#e6a860', '#a85f22'],
    'navy'   => ['#2b3a72', '#0a0e20'],
    'green'  => ['#5ee08a', '#128c3e'],
    'plum'   => ['#d08bd6', '#7b2f86'],
    'slate'  => ['#9fb0cc', '#465a7e'],
];

/** The mark, drawn in a 24-unit box, and the plate it sits on by default. */
function admin_icon_glyphs(): array
{
    return [
        'chart'     => ['navy', '<rect x="3" y="12" width="4" height="8" rx="1" fill="currentColor" stroke="none"/><rect x="10" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none"/><rect x="17" y="9" width="4" height="11" rx="1" fill="currentColor" stroke="none"/>'],
        'clipboard' => ['gold', '<rect x="5" y="4" width="14" height="17" rx="2"/><rect x="8.5" y="2" width="7" height="4" rx="1"/><line x1="8" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="16" y2="15"/>'],
        'car'       => ['bronze', '<path d="M3 13l1.4-4.2A2 2 0 0 1 6.3 7.5h11.4a2 2 0 0 1 1.9 1.3L21 13"/><rect x="2.5" y="13" width="19" height="5" rx="1.5"/><circle cx="7" cy="18.5" r="1.4"/><circle cx="17" cy="18.5" r="1.4"/>'],
        'inbox'     => ['plum', '<path d="M3 12h5l1.5 3h5L16 12h5"/><path d="M5.5 5h13l2.5 7v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7l2.5-7z"/>'],
        'card'      => ['green', '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/><circle cx="16.5" cy="14.5" r="1"/>'],
        'trend'     => ['slate', '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>'],
        'pencil'    => ['gold', '<path d="M4 20h4l10-10a2.8 2.8 0 0 0-4-4L4 16v4z"/><line x1="13.5" y1="6.5" x2="17.5" y2="10.5"/>'],
        'pin'       => ['bronze', '<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>'],
        // The dashboard's counters.
        'rupee'     => ['green', '<path d="M7 5h10"/><path d="M7 9h10"/><path d="M14.5 5c0 3-2.2 4-5 4h-2.5l7.5 10"/>'],
        'wallet'    => ['bronze', '<path d="M3 8.5A2.5 2.5 0 0 1 5.5 6H18a2 2 0 0 1 2 2v1"/><rect x="3" y="9" width="18" height="10" rx="2.5"/><circle cx="16.5" cy="14" r="1.2"/>'],
        'scales'    => ['navy', '<path d="M12 4v16"/><path d="M6 8h12"/><path d="M4 16l2.5-6L9 16a2.6 2.6 0 0 1-5 0z"/><path d="M15 16l2.5-6L20 16a2.6 2.6 0 0 1-5 0z"/>'],
        // Who can sign in. A head and shoulders, drawn in the same single
        // stroke as the rest -- without it the entry renders with an empty
        // plate beside five that have one, because an unknown name here
        // returns nothing rather than a placeholder.
        'user'      => ['navy', '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>'],
    ];
}

/**
 * One icon, as markup.
 *
 * @param string      $name  a key of admin_icon_glyphs()
 * @param int         $size  rendered edge to edge, shadow included
 * @param string|null $tone  overrides the glyph's own plate colour
 */
function admin_icon3d(string $name, int $size = 30, ?string $tone = null, string $class = 'ns-ico3d'): string
{
    static $n = 0;
    $n++;

    $glyphs = admin_icon_glyphs();
    if (!isset($glyphs[$name])) {
        return '';
    }

    [$defaultTone, $paths] = $glyphs[$name];
    $key   = $tone !== null && isset(ADMIN_ICON_TONES[$tone]) ? $tone : $defaultTone;
    [$light, $dark] = ADMIN_ICON_TONES[$key];
    $uid = 'i' . $n;

    return '<svg class="' . htmlspecialchars($class, ENT_QUOTES) . '" width="' . $size . '" height="' . $size . '"'
        . ' viewBox="0 0 48 48" aria-hidden="true" focusable="false">'
        . '<defs>'
        . '<linearGradient id="plate-' . $uid . '" x1="0.15" y1="0" x2="0.85" y2="1">'
        . '<stop offset="0%" stop-color="' . $light . '"/><stop offset="100%" stop-color="' . $dark . '"/></linearGradient>'
        . '<linearGradient id="gloss-' . $uid . '" x1="0" y1="0" x2="0" y2="1">'
        . '<stop offset="0%" stop-color="#fff" stop-opacity="0.5"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/></linearGradient>'
        . '<filter id="drop-' . $uid . '" x="-30%" y="-20%" width="160%" height="160%">'
        . '<feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="' . $dark . '" flood-opacity="0.45"/></filter>'
        . '</defs>'
        . '<g filter="url(#drop-' . $uid . ')">'
        . '<rect x="3" y="2" width="42" height="42" rx="13" fill="url(#plate-' . $uid . ')"/>'
        . '<rect x="4" y="3" width="40" height="40" rx="12" fill="none" stroke="#fff" stroke-opacity="0.28"/>'
        . '<rect x="5" y="4" width="38" height="20" rx="11" fill="url(#gloss-' . $uid . ')"/>'
        . '</g>'
        . '<g transform="translate(12 11)" fill="none" stroke="#fff" stroke-width="1.7"'
        . ' stroke-linecap="round" stroke-linejoin="round" color="#fff">' . $paths . '</g>'
        . '</svg>';
}
