<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/image-names.php';
require_once __DIR__ . '/vehicle-photos.php';

/**
 * The site's own images: the logo, and the banners across the pages.
 *
 * Same arrangement as vehicle photographs, and for the same reason -- the file
 * is written above the document root so a deploy cannot erase it, and read
 * back through a small PHP script because Apache cannot reach it there.
 * vehicle_photo_check() does the validating, so there is one answer to "is
 * this an image" rather than two that can disagree.
 *
 * The slots are fixed. Each one is a specific place in the page, and a name
 * that matches none of them would be a file nobody ever displays.
 */

const SITE_IMAGE_SLOTS = [
    // The brand marks.
    'logo'          => 'Logo',

    // The wide photograph across the top of each page. The names match what
    // the site asks for, so adding one here and adding one there is the same
    // decision rather than two that can disagree.
    'cars-hero'     => 'Cars page banner',
    'bikes-hero'    => 'Bikes page banner',
    'wedding-hero'  => 'Wedding cars banner',
    'tourist-hero'  => 'Tourist vehicles banner',
    'monthly-hero'  => 'Monthly rental banner',
    'nri-hero'      => 'NRI page banner',
    'tariff-hero'   => 'Tariff page banner',
    'about-hero'    => 'About page banner',
    'contact-hero'  => 'Contact page banner',
    'blog-hero'     => 'Blog page banner',
    'places-hero'   => 'Places to visit banner',
    'services-hero' => 'What we hire banner',

    // The home page, top to bottom.
    'home-hero'     => 'Home page background',
    'why-us-1'      => 'Why hire from us — large photo',
    'why-us-2'      => 'Why hire from us — small photo',

    // Behind the questions band, which stands on the home page and on the
    // tariff page. It had no slot and quietly borrowed the home page's
    // background, so there was no way to set it here and the tariff page's
    // questions sat over the home page's photograph.
    'faq'           => 'Questions panel background',

    // The panel on the home page listing the towns served.
    'coast'         => 'Areas we serve panel',

    // The six cards under "What we hire", on the home page and on /services.
    // Named after the page each one links to, which is what the site asks for.
    'cars'             => 'Card: self drive cars',
    'bikes'            => 'Card: bike rental',
    'wedding-cars'     => 'Card: wedding cars',
    'tourist-vehicles' => 'Card: tourist vehicles',
    'monthly'          => 'Card: monthly rental',
    'nri'              => 'Card: for NRI visitors',

    // "How it works" is one picture now, standing between the steps, so it
    // is one slot rather than three. It keeps the key the middle step used,
    // so a photograph already uploaded there is the one that shows -- the
    // site only ever sees a slot this list names, and renaming the key would
    // have quietly hidden it.
    'step-2'        => 'How it works: the picture between the steps',
];

/**
 * The shape each slot is cropped to, and the size it is saved at.
 *
 * One crop for everything would be wrong in both directions: a logo squeezed
 * into a banner's letterbox loses its top and bottom, and a banner squared off
 * loses its sides. The panel frames each upload to the shape the site actually
 * lays it out in, so what is chosen here is what appears there.
 *
 * Anything not named falls back to the card shape, which is the commonest.
 */
const SITE_IMAGE_SHAPES = [
    // A logo is artwork with its own margins, so it is not cropped at all:
    // the whole image is kept and only scaled to fit inside this box. A ratio
    // of 0 says so.
    //
    // It used to be framed square, from when the header showed a small badge
    // beside the business name in type. The header now shows the lockup and
    // nothing else, and a square frame around a wide lockup cuts the words off
    // it -- which is exactly what happened to the first one uploaded here.
    'logo'  => [0, 0, 1280, 800],

    // The wide band across the top of a page.
    'cars-hero'     => [16, 5, 1600, 500],
    'bikes-hero'    => [16, 5, 1600, 500],
    'wedding-hero'  => [16, 5, 1600, 500],
    'tourist-hero'  => [16, 5, 1600, 500],
    'monthly-hero'  => [16, 5, 1600, 500],
    'nri-hero'      => [16, 5, 1600, 500],
    'tariff-hero'   => [16, 5, 1600, 500],
    'about-hero'    => [16, 5, 1600, 500],
    'contact-hero'  => [16, 5, 1600, 500],
    'blog-hero'     => [16, 5, 1600, 500],
    'places-hero'   => [16, 5, 1600, 500],
    'services-hero' => [16, 5, 1600, 500],

    // Full-bleed sections, which are seen at whatever the window is.
    'home-hero' => [16, 9, 1600, 900],
    // The questions band is shorter than the home page's, and almost entirely
    // behind navy -- so it is cropped wider and saved smaller. Nothing in it
    // is ever read; it is there to stop the band being a flat colour.
    'faq'       => [16, 7, 1400, 613],

    // The photographs beside "Why hire from us" are laid out 4:3.
    'why-us-1' => [4, 3, 1200, 900],
    'why-us-2' => [4, 3, 1200, 900],

    // The one between the steps stands taller than it is wide. 4:5 rather
    // than anything narrower: the photographs already uploaded here are
    // landscape, and a tall crop of a landscape photograph takes the heads
    // off it.
    'step-2' => [4, 5, 1000, 1250],
];

/**
 * The words each slot's file is named with, and therefore its address.
 *
 * Not the slot name and not the label beside it in the panel. "Cars page
 * banner" describes where the picture goes, which is of no use to anyone
 * searching; "self drive car rental Nagercoil" describes what is in it, in the
 * words this business wants to be found for. Google reads the file name as one
 * of the handful of signals it has about a picture, so this is the one place
 * the phrase can be stated once and ride on every upload.
 *
 * A slot with no entry falls back to its own name plus the district, which is
 * always better than a random one and is a reminder to add a real phrase here
 * when a slot is added.
 */
const SITE_IMAGE_KEYWORDS = [
    'logo'  => 'NiteSha Cars and Bikes logo Nagercoil',

    'cars-hero'     => 'self drive car rental Nagercoil',
    'bikes-hero'    => 'bike rental Nagercoil Kanyakumari',
    'wedding-hero'  => 'wedding car rental Kanyakumari district',
    'tourist-hero'  => 'tourist vehicle hire with driver Kanyakumari',
    'monthly-hero'  => 'monthly car rental Nagercoil',
    'nri-hero'      => 'car rental for NRI visitors Kanyakumari',
    'tariff-hero'   => 'self drive car rental tariff Kanyakumari',
    'about-hero'    => 'about NiteSha Cars and Bikes Nagercoil',
    'contact-hero'  => 'contact self drive car rental Nagercoil',
    'blog-hero'     => 'car rental travel blog Kanyakumari',
    'places-hero'   => 'places to visit in Kanyakumari district',
    'services-hero' => 'vehicle hire services Kanyakumari district',

    'home-hero' => 'self drive car and bike rental Kanyakumari district',
    'why-us-1'  => 'why hire from NiteSha Cars Nagercoil',
    'why-us-2'  => 'self drive car handover Nagercoil',
    'coast'     => 'car rental delivery areas Kanyakumari district',
    'faq'       => 'self drive car rental questions Kanyakumari',

    'cars'             => 'self drive cars for rent Nagercoil',
    'bikes'            => 'two wheeler rental Kanyakumari',
    'wedding-cars'     => 'decorated wedding cars Nagercoil',
    'tourist-vehicles' => 'tempo traveller and tourist vehicle hire Kanyakumari',
    'monthly'          => 'monthly self drive car hire Nagercoil',
    'nri'              => 'airport car hire for NRI families Kanyakumari',

    'step-2' => 'booking a self drive car Nagercoil',
];

/** The words a slot's uploaded file is named with. */
function site_image_keywords(string $slot): string
{
    return SITE_IMAGE_KEYWORDS[$slot] ?? ($slot . ' NiteSha Cars Kanyakumari');
}

/**
 * Whether the whole image is kept rather than framed to a shape.
 *
 * True for the logo, and for anything else given a ratio of zero.
 */
function site_image_whole(string $slot): bool
{
    [$rw, $rh] = site_image_shape($slot);
    return $rw <= 0 || $rh <= 0;
}

/** [width ratio, height ratio, saved width, saved height] for one slot. */
function site_image_shape(string $slot): array
{
    // 16:10 is the card shape -- the six services, the three steps and the
    // areas panel all use it, which is most of the list.
    return SITE_IMAGE_SHAPES[$slot] ?? [16, 10, 1200, 750];
}

function site_image_dir(): string
{
    $base = (string) (config('storage_path') ?? (dirname(__DIR__, 3) . '/nitesha-storage'));
    $dir  = rtrim($base, '/') . '/brand';

    if (!is_dir($dir)) {
        @mkdir($dir, 0750, true);
    }
    return $dir;
}

/** The stored filename for each slot that has one. */
function site_images(): array
{
    if (!table_has_column('site_images', 'file')) {
        return [];
    }
    try {
        $out = [];
        foreach (fetch_all('SELECT slot, file FROM site_images') as $row) {
            if (isset(SITE_IMAGE_SLOTS[$row['slot']])) {
                $out[(string) $row['slot']] = (string) $row['file'];
            }
        }
        return $out;
    } catch (Throwable $e) {
        error_log('site_images read failed: ' . $e->getMessage());
        return [];
    }
}

/** The public URL for a stored site image, or null. */
function site_image_url(?string $name): ?string
{
    if ($name === null || $name === '') {
        return null;
    }
    // /site-images/, from the site root, for the same reason as the car
    // photographs: an address that reads as a file reads as a picture, to a
    // person scanning a search result and to the crawler that put it there,
    // and "admin" in the path says nothing and risks a great deal. Both the
    // old address and ?f= still answer, so nothing that stored one breaks.
    //
    // The name carries random bytes chosen at upload, so a new image is a new
    // URL and the response can be cached hard.
    return '/site-images/' . rawurlencode($name);
}

/**
 * Stores an upload against a slot, replacing whatever was there.
 *
 * Returns null on success, or a sentence explaining the refusal.
 */
function site_image_save(string $slot, array $file, int $userId): ?string
{
    if (!isset(SITE_IMAGE_SLOTS[$slot])) {
        return 'That is not one of the site images.';
    }

    [$extension, $problem] = vehicle_photo_check($file);
    if ($problem !== null) {
        return $problem;
    }

    $previous = site_images()[$slot] ?? null;

    // Our name, never the uploader's: a filename from a browser can contain
    // path separators, and writing outside this directory is the one thing
    // that must not be possible.
    //
    // Named for what the picture shows rather than for the slot it fills. It
    // was b + the slot name + random bytes, which is unique and tells a reader
    // -- or a search engine -- nothing at all. See SITE_IMAGE_KEYWORDS.
    $name = image_name(site_image_keywords($slot), $extension, 'nitesha-cars-' . $slot);

    if (!move_uploaded_file((string) $file['tmp_name'], site_image_dir() . '/' . $name)) {
        return 'The image could not be saved on the server.';
    }
    @chmod(site_image_dir() . '/' . $name, 0640);

    query(
        'INSERT INTO site_images (slot, file, updated_by) VALUES (?,?,?)
         ON DUPLICATE KEY UPDATE file = VALUES(file), updated_by = VALUES(updated_by)',
        [$slot, $name, $userId]
    );

    // Only once the row points at the new file, so a failed write never leaves
    // the site pointing at something that has just been deleted.
    site_image_delete_file($previous);

    return null;
}

/** Clears a slot and removes its file. */
function site_image_clear(string $slot): void
{
    if (!isset(SITE_IMAGE_SLOTS[$slot])) {
        return;
    }
    $previous = site_images()[$slot] ?? null;
    query('DELETE FROM site_images WHERE slot = ?', [$slot]);
    site_image_delete_file($previous);
}

function site_image_delete_file(?string $name): void
{
    if ($name === null || $name === '' || str_contains($name, '/') || str_contains($name, '\\')) {
        return;
    }
    @unlink(site_image_dir() . '/' . $name);
}
