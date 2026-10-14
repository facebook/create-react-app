<?php
declare(strict_types=1);

/**
 * Editable page content.
 *
 * The database stores overrides only. Every section has a default shipped with
 * the site, and a section nobody has edited has no row at all -- so the table
 * starts empty, "reset to default" is a DELETE, and the public site still
 * builds when this server cannot be reached.
 *
 * content-defaults.json is a copy of my-app/src/content/defaults.json. The
 * site build refuses to run if the two differ, so the copy cannot drift
 * quietly; it exists because this server never receives the site's repository.
 */

require_once __DIR__ . '/db.php';

/**
 * Describes what is editable, and how to render a field for it.
 *
 * Kept as a declaration rather than a hand-written form so that adding a field
 * is one entry here, not an edit in the form, the save handler and the
 * validator -- three places that drift apart the first time someone is in a
 * hurry.
 *
 * Types: text, textarea, list (lines of text), repeater (repeated group).
 */
function content_schema(): array
{
    return [
        'home' => [
            'label'    => 'Home page',
            'sections' => [
                'hero' => [
                    'label'  => 'Hero',
                    'note'   => 'The first thing a visitor reads. The accent line is the gold one.',
                    'fields' => [
                        'eyebrow'        => ['label' => 'Eyebrow', 'type' => 'text'],
                        'headingLead'    => ['label' => 'Heading', 'type' => 'text'],
                        'headingAccent'  => ['label' => 'Heading, gold line', 'type' => 'text'],
                        'tagline'        => ['label' => 'Tagline', 'type' => 'text'],
                        // What the background photograph shows. Read by screen
                        // readers and by image search, which has little else to
                        // go on besides this and the file name.
                        'imageAlt'       => ['label' => 'Background photo, description', 'type' => 'text'],
                        'intro'          => ['label' => 'Intro paragraph', 'type' => 'textarea'],
                        'primaryLabel'   => ['label' => 'Main button', 'type' => 'text'],
                        'primaryHref'    => ['label' => 'Main button link', 'type' => 'text'],
                        'secondaryLabel' => ['label' => 'Second button', 'type' => 'text'],
                        'secondaryHref'  => ['label' => 'Second button link', 'type' => 'text'],
                        'points'         => ['label' => 'Tick points', 'type' => 'list'],
                        // The short enquiry card beside the heading. Four
                        // boxes, so the words above them are most of what
                        // decides whether anybody fills it in.
                        'formTitle'      => ['label' => 'Enquiry card, heading', 'type' => 'text'],
                        'formNote'       => ['label' => 'Enquiry card, line under it', 'type' => 'text'],
                    ],
                ],
                'services' => [
                    'label'  => 'What we hire',
                    'fields' => [
                        'eyebrow' => ['label' => 'Small line above', 'type' => 'text'],
                        'heading' => ['label' => 'Heading', 'type' => 'text'],
                        'items'   => [
                            'label'  => 'Services',
                            'type'   => 'repeater',
                            'fields' => [
                                'title'  => ['label' => 'Title', 'type' => 'text'],
                                'body'   => ['label' => 'Description', 'type' => 'textarea'],
                                'to'     => ['label' => 'Links to', 'type' => 'text'],
                                // Shown as ticks on /services, where all six
                                // are laid out in full. The home page and the
                                // footer read the title and the description
                                // only, so these cost nothing there.
                                'points' => [
                                    'label' => 'Tick points',
                                    'type'  => 'list',
                                    'hint'  => 'One per line, three or four. Shown beside this service on the services page.',
                                ],
                            ],
                        ],
                    ],
                ],
                'whyUs' => [
                    'label'  => 'Why hire from us',
                    'fields' => [
                        'badge'   => ['label' => 'Badge', 'type' => 'text'],
                        'heading' => ['label' => 'Heading', 'type' => 'text'],
                        'intro'   => ['label' => 'Intro paragraph', 'type' => 'textarea'],
                        'items'   => [
                            'label'  => 'Accordion entries',
                            'type'   => 'repeater',
                            'fields' => [
                                'title' => ['label' => 'Question', 'type' => 'text'],
                                'body'  => ['label' => 'Answer', 'type' => 'textarea'],
                            ],
                        ],
                    ],
                ],
                'howItWorks' => [
                    'label'  => 'How it works',
                    'fields' => [
                        'heading'  => ['label' => 'Heading', 'type' => 'text'],
                        'steps'    => [
                            'label'  => 'Steps',
                            'type'   => 'repeater',
                            'fields' => [
                                'n'     => ['label' => 'Number', 'type' => 'text'],
                                'title' => ['label' => 'Title', 'type' => 'text'],
                                'body'  => ['label' => 'Description', 'type' => 'textarea'],
                            ],
                        ],
                        'noteLead' => ['label' => 'Note, bold start', 'type' => 'text'],
                        'noteBody' => ['label' => 'Note', 'type' => 'textarea'],
                    ],
                ],
                'areasServed' => [
                    'label'  => 'Where we hire',
                    'note'   => 'The town names themselves come from the site\'s SEO data, so they stay in step with the structured data Google reads.',
                    'fields' => [
                        'heading'           => ['label' => 'Heading', 'type' => 'text'],
                        'intro'             => ['label' => 'Intro paragraph', 'type' => 'textarea'],
                        'footnoteLead'      => ['label' => 'Footnote, before the link', 'type' => 'text'],
                        'footnoteLinkLabel' => ['label' => 'Footnote link text', 'type' => 'text'],
                        'footnoteTail'      => ['label' => 'Footnote, after the link', 'type' => 'text'],
                    ],
                ],
                'faq' => [
                    'label'  => 'Questions and answers',
                    'note'   => 'The questions people ask before they book, on the home page and the tariff page. Worth keeping honest and specific: this is the part of the site that answers what somebody typed into Google, and Google reads these as questions and answers rather than as paragraphs. Delete one you would rather not answer in writing; add the ones you find yourself repeating on the phone.',
                    'fields' => [
                        'heading' => ['label' => 'Heading', 'type' => 'text'],
                        'intro'   => ['label' => 'Line under it', 'type' => 'text'],
                        'items'   => [
                            'label'  => 'Questions',
                            'type'   => 'repeater',
                            'fields' => [
                                'question' => ['label' => 'Question', 'type' => 'text'],
                                'answer'   => ['label' => 'Answer', 'type' => 'textarea'],
                            ],
                        ],
                    ],
                ],
                /* Not on the website. It is here because this is where the
                   owner already edits the words the business says, and a
                   second place to edit words is a second place to forget. The
                   label and the note say where it actually comes out. */
                'bookingTerms' => [
                    'label'  => 'Booking terms (printed on confirmations)',
                    'note'   => 'These do not appear on the website. They print at the bottom of the '
                        . 'booking confirmation you hand to a customer or send on WhatsApp, so they are '
                        . 'what you can point at later if there is a disagreement. Worth covering: fuel, '
                        . 'what happens if the car comes back late, what the deposit covers and when it '
                        . 'is returned, who pays a fine or a toll, and what to do after an accident. '
                        . 'One line each, written plainly. Leave it empty and the confirmation simply '
                        . 'has no terms section.',
                    'fields' => [
                        'heading' => ['label' => 'Heading', 'type' => 'text'],
                        'items'   => [
                            'label'  => 'Terms',
                            'type'   => 'repeater',
                            'fields' => [
                                'term' => ['label' => 'Term', 'type' => 'textarea'],
                            ],
                        ],
                    ],
                ],
                'closingCta' => [
                    'label'  => 'Closing call to action',
                    'fields' => [
                        'heading'        => ['label' => 'Heading', 'type' => 'text'],
                        'body'           => ['label' => 'Paragraph', 'type' => 'textarea'],
                        'primaryLabel'   => ['label' => 'Main button', 'type' => 'text'],
                        'primaryHref'    => ['label' => 'Main button link', 'type' => 'text'],
                        'secondaryLabel' => ['label' => 'Second button', 'type' => 'text'],
                        'secondaryHref'  => ['label' => 'Second button link', 'type' => 'text'],
                    ],
                ],
                'footer' => [
                    'label'  => 'Footer',
                    'note'   => 'The band at the bottom of every page. The map is built from what you type in "Where the map should point" -- a place name or an address is enough, the same thing you would type into Google Maps. The address and the opening hours are also what Google reads to build the panel it shows beside a local search result, so the more exact they are the better that panel is.',
                    'fields' => [
                        'blurb'           => ['label' => 'Line under the business name', 'type' => 'textarea'],
                        'locationHeading' => ['label' => 'Heading above the map', 'type' => 'text'],
                        'address'         => ['label' => 'Address', 'type' => 'list'],
                        'hours'           => [
                            'label' => 'Opening hours',
                            'type'  => 'text',
                            'hint'  => 'Written the way Google expects: Mo-Su 07:00-21:00. '
                                . 'Two ranges go in one line separated by a comma, '
                                . 'like Mo-Sa 08:00-20:00, Su 09:00-18:00. Leave it empty if the hours vary.',
                        ],
                        'mapQuery'        => ['label' => 'Where the map should point', 'type' => 'text'],
                        'directionsLabel' => ['label' => 'Directions link text', 'type' => 'text'],
                    ],
                ],
                'social' => [
                    'label'  => 'Social media',
                    'note'   => 'Paste the address of each page you have. Leave a box empty and that icon is simply not shown -- an icon linking nowhere is worse than no icon. A named box per network rather than a list you add to, so the icon always matches the link.',
                    'fields' => [
                        'heading'   => ['label' => 'Heading above the icons', 'type' => 'text'],
                        'whatsapp'  => ['label' => 'WhatsApp', 'type' => 'text'],
                        'instagram' => ['label' => 'Instagram', 'type' => 'text'],
                        'facebook'  => ['label' => 'Facebook', 'type' => 'text'],
                    ],
                ],
            ],
        ],
    ];
}

/** The shipped copy, as the site would render it with nothing overridden. */
function content_defaults(): array
{
    static $defaults = null;
    if ($defaults === null) {
        $raw      = @file_get_contents(dirname(__DIR__) . '/content-defaults.json');
        $decoded  = $raw === false ? null : json_decode($raw, true);
        $defaults = is_array($decoded) ? $decoded : [];
    }
    return $defaults;
}

/** Overrides, as [page][section] => data. */
function content_overrides(): array
{
    // The table only exists once 003_content.sql has run. Treating a missing
    // table as "no overrides" keeps the public endpoint serving defaults
    // rather than returning a 500 while an install waits to be migrated.
    try {
        $rows = fetch_all('SELECT page, section, data FROM content_sections');
    } catch (Throwable $e) {
        return [];
    }

    $out = [];
    foreach ($rows as $row) {
        $decoded = json_decode((string) $row['data'], true);
        if (is_array($decoded)) {
            $out[$row['page']][$row['section']] = $decoded;
        }
    }
    return $out;
}

/**
 * Defaults with any overrides laid on top, section by section.
 *
 * Whole sections are replaced rather than merged field by field. A half-merged
 * section is the worse failure: remove an item from a list in the admin and a
 * deep merge would quietly put it back.
 */
function content_all(): array
{
    $content   = content_defaults();
    $overrides = content_overrides();

    foreach ($overrides as $page => $sections) {
        foreach ($sections as $section => $data) {
            // Ignore anything the schema no longer knows about, so a removed
            // section cannot be resurrected by a stale row.
            if (isset(content_schema()[$page]['sections'][$section])) {
                $content[$page][$section] = $data;
            }
        }
    }
    return $content;
}

/**
 * Whether 003_content.sql has been applied yet.
 *
 * content_overrides() treats a missing table as "nothing overridden" so the
 * public endpoint keeps serving defaults rather than 500-ing. That is right
 * for visitors and useless for the editor, who needs to be told the storage
 * is not there yet -- hence a check that distinguishes the two.
 */
function content_storage_ready(): bool
{
    try {
        fetch_one('SELECT id FROM content_sections LIMIT 1');
        return true;
    } catch (Throwable $e) {
        return false;
    }
}

/** One section, defaults or override, ready to fill a form. */
function content_section(string $page, string $section): array
{
    return content_all()[$page][$section] ?? [];
}

/** True when this section has been edited, so the form can offer a reset. */
function content_is_overridden(string $page, string $section): bool
{
    try {
        return fetch_one(
            'SELECT id FROM content_sections WHERE page = ? AND section = ?',
            [$page, $section]
        ) !== null;
    } catch (Throwable $e) {
        return false;
    }
}

/**
 * Reads one section out of submitted form input, shaped by the schema.
 *
 * Driven by the schema rather than by what the browser sent, so a crafted post
 * cannot introduce keys the site does not expect. Empty repeater rows are
 * dropped: a blank row is how someone cancels an addition.
 */
function content_from_input(array $fields, array $input): array
{
    $out = [];

    foreach ($fields as $key => $spec) {
        $value = $input[$key] ?? null;

        switch ($spec['type']) {
            case 'list':
                $lines = preg_split('/\r\n|\r|\n/', (string) $value) ?: [];
                $out[$key] = array_values(array_filter(array_map('trim', $lines), fn($l) => $l !== ''));
                break;

            case 'repeater':
                $rows = [];
                foreach (is_array($value) ? $value : [] as $row) {
                    if (!is_array($row)) {
                        continue;
                    }
                    $built = content_from_input($spec['fields'], $row);
                    $empty = true;
                    foreach ($built as $v) {
                        if ($v !== '' && $v !== []) {
                            $empty = false;
                            break;
                        }
                    }
                    if (!$empty) {
                        $rows[] = $built;
                    }
                }
                $out[$key] = $rows;
                break;

            default:
                $out[$key] = trim((string) $value);
        }
    }

    return $out;
}

/** Writes an override. */
function content_save(string $page, string $section, array $data, ?int $userId): void
{
    query(
        'INSERT INTO content_sections (page, section, data, updated_by)
              VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE data = VALUES(data), updated_by = VALUES(updated_by)',
        [$page, $section, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), $userId]
    );
}

/** Drops an override, so the section goes back to the shipped copy. */
function content_reset(string $page, string $section): void
{
    query('DELETE FROM content_sections WHERE page = ? AND section = ?', [$page, $section]);
}
