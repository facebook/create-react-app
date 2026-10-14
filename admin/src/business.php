<?php
declare(strict_types=1);

require_once __DIR__ . '/content.php';

/**
 * Who the business is, for a document a customer keeps.
 *
 * A booking confirmation has to say who sent it, and every part of that
 * already exists somewhere -- so this reads those places rather than adding
 * a third copy of the phone number to keep in step.
 *
 *   name, phone, email   the website's own seo.json, which is where the
 *                        footer and the schema.org markup read them from
 *   address              the panel's Website content, footer section, which
 *                        is where the owner already edits it
 *
 * Anything it cannot find is left out of the letterhead rather than guessed.
 * A confirmation with no email line is a confirmation; one with last year's
 * phone number on it is a customer who cannot reach anybody.
 */
function business_details(): array
{
    $out = ['name' => 'NiteSha Cars & Bikes', 'phone' => '', 'email' => '', 'address' => []];

    // Two up from admin/src is the document root, which is this repository:
    // Hostinger clones the whole of it and serves the site from the top.
    $seoPath = dirname(__DIR__, 2) . '/my-app/src/data/seo.json';
    if (is_readable($seoPath)) {
        $seo = json_decode((string) file_get_contents($seoPath), true);
        $site = is_array($seo) && isset($seo['site']) && is_array($seo['site']) ? $seo['site'] : [];
        foreach (['name', 'phone', 'email'] as $k) {
            if (isset($site[$k]) && is_string($site[$k]) && $site[$k] !== '') {
                $out[$k] = $site[$k];
            }
        }
    }

    // The address is a list of lines in the content store. Reading it is
    // wrapped because a panel whose migrations have not run yet still has to
    // be able to print a confirmation.
    try {
        $footer = content_section('home', 'footer');
        if (isset($footer['address']) && is_array($footer['address'])) {
            $out['address'] = array_values(array_filter(array_map(
                static fn ($line) => trim((string) $line),
                $footer['address']
            ), static fn ($line) => $line !== ''));
        }
    } catch (Throwable) {
        // Leave it empty; the rest of the letterhead still stands.
    }

    return $out;
}
