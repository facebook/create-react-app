<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/image-names.php';

/**
 * Where a vehicle's photograph lives, and what counts as one.
 *
 * Uploads go under storage_path, which sits above the document root. That is
 * not tidiness: this host deploys by rebuilding the web root from the
 * repository, so a photograph written inside it would be erased by the next
 * push. config.php was lost that way once already, and a customer-facing photo
 * disappearing on an unrelated deploy would be the same bug wearing different
 * clothes.
 *
 * Being outside the web root also means the file cannot be requested directly,
 * so photo.php reads and streams it. That costs a PHP process per image and
 * buys the guarantee that nothing in this directory is ever executed, whatever
 * ends up in it.
 */

/** The directory holding vehicle photographs, created on first use. */
function vehicle_photo_dir(): string
{
    $base = (string) (config('storage_path') ?? (dirname(__DIR__, 3) . '/nitesha-storage'));
    $dir  = rtrim($base, '/') . '/vehicles';

    if (!is_dir($dir)) {
        @mkdir($dir, 0750, true);
    }
    return $dir;
}

/**
 * Formats a browser will decode, mapped to the extension this will save under.
 *
 * The list is deliberately short and checked against the file's actual
 * contents rather than its name or the type the browser claimed, both of which
 * the person uploading chooses. A .jpg that is really a PHP script is the
 * oldest trick there is; it cannot execute from storage_path, but there is no
 * reason to store it either.
 */
const VEHICLE_PHOTO_TYPES = [
    IMAGETYPE_JPEG => 'jpg',
    IMAGETYPE_PNG  => 'png',
    IMAGETYPE_WEBP => 'webp',
    IMAGETYPE_AVIF => 'avif',
];

const VEHICLE_PHOTO_MIME = [
    'jpg'  => 'image/jpeg',
    'png'  => 'image/png',
    'webp' => 'image/webp',
    'avif' => 'image/avif',
];

/** 6 MB. A phone photograph is 2-5 MB; beyond this it is not a car picture. */
const VEHICLE_PHOTO_MAX_BYTES = 6 * 1024 * 1024;

/**
 * Checks an upload and returns [extension, null] or [null, reason].
 *
 * Reasons are written for the person who took the photograph, not for a log.
 */
function vehicle_photo_check(array $file): array
{
    $error = $file['error'] ?? UPLOAD_ERR_NO_FILE;

    if ($error === UPLOAD_ERR_INI_SIZE || $error === UPLOAD_ERR_FORM_SIZE) {
        return [null, 'That image is larger than the server will accept. Around 5 MB is the limit.'];
    }
    if ($error !== UPLOAD_ERR_OK) {
        return [null, 'The image did not finish uploading. Try again.'];
    }
    if (($file['size'] ?? 0) > VEHICLE_PHOTO_MAX_BYTES) {
        return [null, 'That image is over 6 MB. Most phones can export a smaller copy.'];
    }

    $tmp = (string) ($file['tmp_name'] ?? '');
    if ($tmp === '' || !is_uploaded_file($tmp)) {
        return [null, 'That upload could not be read.'];
    }

    // The file's own contents decide. getimagesize returns false for anything
    // that is not actually an image, whatever it is called.
    $info = @getimagesize($tmp);
    if ($info === false || !isset(VEHICLE_PHOTO_TYPES[$info[2]])) {
        return [null, 'That is not an image the site can show. Use a JPG, PNG, WebP or AVIF.'];
    }

    return [VEHICLE_PHOTO_TYPES[$info[2]], null];
}

/**
 * The words a vehicle's photograph is named with.
 *
 * The car's own make and model, then what it is for and where -- so the file
 * is called maruti-swift-self-drive-car-rental-nagercoil-<random>.jpg rather
 * than v12-<random>.jpg. That is the only description of the picture that
 * exists outside the page it sits on, and it is one Google reads.
 *
 * Falls back to the id if the row cannot be read. A photograph that saves with
 * a dull name is a far better outcome than one that refuses to save.
 */
function vehicle_photo_keywords(int $vehicleId): string
{
    try {
        $row = fetch_one('SELECT brand, name FROM vehicles WHERE id = ?', [$vehicleId]);
    } catch (Throwable $e) {
        $row = null;
    }

    $make = trim((string) ($row['brand'] ?? '') . ' ' . (string) ($row['name'] ?? ''));

    return ($make === '' ? 'vehicle ' . $vehicleId : $make)
        . ' self drive car rental Nagercoil Kanyakumari';
}

/**
 * Stores an upload for a vehicle and returns the stored filename.
 *
 * The name is ours, never the uploader's: a filename arriving from a browser
 * can contain path separators, and the one thing that must not be possible
 * here is writing outside this directory.
 */
function vehicle_photo_store(int $vehicleId, array $file, string $extension): string
{
    $name = image_name(vehicle_photo_keywords($vehicleId), $extension, 'vehicle-' . $vehicleId);
    $path = vehicle_photo_dir() . '/' . $name;

    if (!move_uploaded_file((string) $file['tmp_name'], $path)) {
        throw new RuntimeException('The image could not be saved.');
    }
    @chmod($path, 0640);

    return $name;
}

/**
 * Deletes a stored photograph.
 *
 * Takes a filename that came out of the database, and still refuses anything
 * with a separator in it: the check costs nothing and the day it matters is
 * the day something else went wrong.
 */
function vehicle_photo_delete(?string $name): void
{
    if ($name === null || $name === '' || str_contains($name, '/') || str_contains($name, '\\')) {
        return;
    }
    @unlink(vehicle_photo_dir() . '/' . $name);
}

/** The public URL for a stored photograph, or null when there is none. */
function vehicle_photo_url(?string $name): ?string
{
    if ($name === null || $name === '') {
        return null;
    }
    // /car-photos/, from the site root, not photos/ relative to the panel.
    //
    // The words in the file name were already right; the folder was not. Every
    // picture on a car hire site sat at /admin/photos/..., and "admin" is a
    // dead word in the one part of an image's address Google reads besides the
    // file name. Worse, it left every photograph one robots.txt edit from being
    // uncrawlable: disallowing /admin/ is the obvious thing to do, and three
    // Allow lines were all that stood in the way.
    //
    // Root-absolute so it survives the trip through the website's panelUrl(),
    // which prefixes anything relative with /admin. The old address still
    // answers, because it is what pages already indexed point at.
    //
    // The filename carries random bytes, so it changes whenever the photograph
    // does -- which is what lets the response be cached hard.
    return '/car-photos/' . rawurlencode($name);
}
