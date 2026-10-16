<?php
declare(strict_types=1);

require_once __DIR__ . '/src/csrf.php';
require_once __DIR__ . '/src/assets.php';
require_once __DIR__ . '/src/migrate.php';
require_once __DIR__ . '/src/places.php';
require_once __DIR__ . '/src/shell.php';

/**
 * Places worth driving to.
 *
 * A page rather than a tab on the dashboard, for the same reason Website
 * content is one: it is edited occasionally and at length, not glanced at
 * while running the day. The dashboard is for today's bookings.
 */

// As on the Website content screen: reading the list and changing it are two
// permissions, so a read-only account can check what the site offers without
// being able to rewrite it. See abilities.php.
$me      = require_can('place.view');
$mayEdit = user_can('place.edit');

$migrationError = migrate_if_needed();

header('X-Frame-Options: DENY');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');

$notice = null;
$error  = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();
    require_can('place.edit');

    $action = (string) ($_POST['action'] ?? '');

    if ($action === 'delete') {
        place_delete((int) ($_POST['id'] ?? 0), (int) $me['id']);
        $notice = 'Removed.';
    } elseif ($action === 'save') {
        $problem = place_save($_POST, $_FILES['photo'] ?? null, (int) $me['id']);
        if ($problem !== null) {
            $error = $problem;
        } else {
            $notice = 'Saved. It appears on the site within a minute.';
        }
    }
}

$places = places_all(true);
$editing = null;
if (isset($_GET['edit'])) {
    foreach ($places as $row) {
        if ((int) $row['id'] === (int) $_GET['edit']) {
            $editing = $row;
        }
    }
}

admin_shell_open($me, 'places.php', 'Places to visit', false, $migrationError);
?>

  <div class="c-top">
    <div>
      <p class="c-note">
        Shown on the home page and on <strong>niteshacars.in/places</strong>. These are
        what people search for before they book a car, so it is worth keeping current.
      </p>
    </div>
    <a class="btn btn-outline btn-sm" href="/places" target="_blank" rel="noopener">See the page &rarr;</a>
  </div>

  <?php if ($notice !== null): ?><div class="c-msg c-ok"><?= e($notice) ?></div><?php endif; ?>
  <?php if ($error !== null): ?><div class="c-msg c-bad"><?= e($error) ?></div><?php endif; ?>

  <?php if (!$mayEdit): ?>
    <p class="c-note">You can see what the website offers here. Changing it needs
      the &ldquo;<?= e(ability_label('place.edit')) ?>&rdquo; permission.</p>
  <?php endif; ?>

  <?php if ($mayEdit): ?>
  <form class="c-sec" method="post" enctype="multipart/form-data">
    <?= csrf_field() ?>
    <input type="hidden" name="action" value="save">
    <input type="hidden" name="id" value="<?= e((string) ($editing['id'] ?? '')) ?>">

    <h2><?= $editing === null ? 'Add a place' : 'Edit ' . e((string) $editing['name']) ?></h2>

    <div class="modal-row">
      <div class="field-group">
        <label for="placeName">Name</label>
        <input type="text" id="placeName" name="name" required maxlength="120"
               value="<?= e((string) ($editing['name'] ?? '')) ?>"
               placeholder="e.g. Vattakottai Fort">
      </div>
      <div class="field-group">
        <label for="placeCategory">Group</label>
        <input type="text" id="placeCategory" name="category" maxlength="60"
               value="<?= e((string) ($editing['category'] ?? '')) ?>"
               placeholder="e.g. Temples &amp; heritage">
      </div>
    </div>

    <div class="field-group">
      <label for="placeBlurb">One or two sentences</label>
      <textarea id="placeBlurb" name="blurb" rows="2" maxlength="400"
                placeholder="What someone would want to know before driving there."><?= e((string) ($editing['blurb'] ?? '')) ?></textarea>
    </div>

    <div class="field-group">
      <label for="placeMap">Map link</label>
      <input type="url" id="placeMap" name="map_url" maxlength="500"
             value="<?= e((string) ($editing['map_url'] ?? '')) ?>"
             placeholder="https://www.google.com/maps/...">
      <p class="field-note">Open the place in Google Maps, press Share, and paste the link.
      Visitors get a Directions button that opens it on their phone.</p>
    </div>

    <div class="modal-row">
      <div class="field-group">
        <label for="placeOrder">Order</label>
        <input type="number" id="placeOrder" name="sort_order" min="0" max="9999"
               value="<?= e((string) ($editing['sort_order'] ?? 0)) ?>">
        <p class="field-note">Lowest first.</p>
      </div>
      <div class="field-group">
        <label for="placePublished">Shown on the site</label>
        <label class="finance-toggle">
          <input type="checkbox" id="placePublished" name="published"
                 <?= ($editing === null || (int) $editing['published'] === 1) ? 'checked' : '' ?>>
          Yes
        </label>
      </div>
    </div>

    <div class="field-group">
      <label for="placePhoto">Photograph</label>
      <?php if (!empty($editing['photo_file'])): ?>
        <div class="photo-preview">
          <img src="<?= e((string) place_photo_url((string) $editing['photo_file'])) ?>" alt="">
        </div>
      <?php endif; ?>
      <input type="file" id="placePhoto" name="photo"
             accept="image/jpeg,image/png,image/webp,image/avif">
      <p class="field-note">Landscape works best &mdash; it is shown in a wide card. Leave empty
      to keep the picture already there. Up to 6&nbsp;MB.</p>
    </div>

    <div class="modal-actions">
      <?php if ($editing !== null): ?>
        <a class="btn btn-ghost" href="places.php">Cancel</a>
      <?php endif; ?>
      <button class="btn btn-primary" type="submit">
        <?= $editing === null ? 'Add place' : 'Save changes' ?>
      </button>
    </div>
  </form>
  <?php endif; ?>

  <div class="c-sec">
    <h2><?= count($places) ?> place<?= count($places) === 1 ? '' : 's' ?></h2>

    <?php if ($places === []): ?>
      <div class="empty-state">Nothing yet.<?= $mayEdit ? ' Add the first one above.' : '' ?></div>
    <?php else: ?>
      <div class="place-list">
        <?php foreach ($places as $row): ?>
          <div class="place-row">
            <div class="place-thumb">
              <?php if (!empty($row['photo_file'])): ?>
                <img src="<?= e((string) place_photo_url((string) $row['photo_file'])) ?>" alt="" loading="lazy">
              <?php else: ?>
                <span class="brand-slot-empty">No photo</span>
              <?php endif; ?>
            </div>
            <div class="place-body">
              <strong><?= e((string) $row['name']) ?></strong>
              <?php if ((int) $row['published'] !== 1): ?>
                <span class="c-flag">hidden</span>
              <?php endif; ?>
              <p class="c-note c-note-tight"><?= e((string) $row['blurb']) ?></p>
              <p class="c-note c-note-tight">
                <?= e((string) $row['category']) ?> &middot; order <?= (int) $row['sort_order'] ?>
                <?= $row['map_url'] !== '' ? ' &middot; has a map link' : ' &middot; no map link' ?>
              </p>
            </div>
            <?php if ($mayEdit): ?>
            <div class="place-actions">
              <a class="btn btn-outline btn-sm" href="places.php?edit=<?= (int) $row['id'] ?>">Edit</a>
              <!-- Asked in the panel's own dialog; see dialog.js. -->
              <form method="post" data-confirm="It stops appearing on the website's places page."
                    data-confirm-title="Remove <?= e((string) $row['name']) ?>?"
                    data-confirm-label="Remove">
                <?= csrf_field() ?>
                <input type="hidden" name="action" value="delete">
                <input type="hidden" name="id" value="<?= (int) $row['id'] ?>">
                <button class="btn btn-danger btn-sm btn-icon" type="submit"
                        title="Delete this place" aria-label="Delete <?= e((string) $row['name']) ?>">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M4 7h16"/><path d="M10 11v6"/><path d="M14 11v6"/>
                      <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/>
                      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                </button>
              </form>
            </div>
            <?php endif; ?>
          </div>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
  </div>

<?php admin_shell_close(); ?>
</body>
</html>
