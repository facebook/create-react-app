<?php
declare(strict_types=1);

require_once __DIR__ . '/src/csrf.php';
require_once __DIR__ . '/src/assets.php';
require_once __DIR__ . '/src/site-images.php';
require_once __DIR__ . '/src/content.php';
require_once __DIR__ . '/src/migrate.php';
require_once __DIR__ . '/src/audit.php';
require_once __DIR__ . '/src/shell.php';

/**
 * Editing the words on the public site.
 *
 * A page of its own rather than another tab in dashboard.php, which is driven
 * by admin.js and would need real surgery to take a form this shape. Plain
 * form posts, no JavaScript: a repeater row is rendered server-side with one
 * blank row on the end, which is enough to add items without shipping an
 * editor.
 *
 * Saving writes an override. Resetting deletes it, and the section goes back
 * to the copy shipped with the site.
 */

// Seeing what the website says and changing it are separate permissions: an
// Auditor may read this screen, and the save below is refused without the
// second one. See abilities.php.
$me      = require_can('content.view');
$mayEdit = user_can('content.edit');

header('X-Frame-Options: DENY');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');

$schema = content_schema();
$page   = $_GET['page'] ?? 'home';
if (!isset($schema[$page])) {
    $page = array_key_first($schema);
}

$notice = null;
$error  = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();
    require_can('content.edit');

    $action  = (string) ($_POST['action'] ?? '');
    $section = (string) ($_POST['section'] ?? '');

    if ($action === 'brand-upload' || $action === 'brand-clear') {
        // Handled before the section check below, which would otherwise reject
        // these for not naming a section -- they do not have one.
        $slot = (string) ($_POST['slot'] ?? '');

        if (!isset(SITE_IMAGE_SLOTS[$slot])) {
            $error = 'That is not one of the site images.';
        } elseif ($action === 'brand-clear') {
            site_image_clear($slot);
            audit_log('site_image_cleared', 'content', 'site_image', null, null,
                ['slot' => $slot], null, (int) $me['id'], (string) $me['name']);
            $notice = SITE_IMAGE_SLOTS[$slot] . ' removed.';
        } else {
            $problem = site_image_save($slot, $_FILES['image'] ?? [], (int) $me['id']);
            if ($problem !== null) {
                $error = $problem;
            } else {
                audit_log('site_image_changed', 'content', 'site_image', null, null,
                    ['slot' => $slot], null, (int) $me['id'], (string) $me['name']);
                $notice = SITE_IMAGE_SLOTS[$slot] . ' updated. It appears on the site within a minute.';
            }
        }
    } elseif ($action === 'migrate') {
        try {
            $applied = migrate();
            $notice  = $applied === []
                ? 'Storage was already set up.'
                : 'Set up content storage (' . implode(', ', $applied) . ').';
        } catch (Throwable $e) {
            $error = 'Could not set up storage: ' . $e->getMessage();
        }
    } elseif (!isset($schema[$page]['sections'][$section])) {
        $error = 'That section does not exist.';
    } elseif ($action === 'reset') {
        content_reset($page, $section);
        audit_log('content_reset', 'content', 'section', null, null,
            ['page' => $page, 'section' => $section], null, (int) $me['id'], (string) $me['name']);
        $notice = 'Put back the wording the site ships with.';
    } elseif ($action === 'save') {
        $fields = $schema[$page]['sections'][$section]['fields'];
        $data   = content_from_input($fields, (array) ($_POST['f'] ?? []));
        try {
            content_save($page, $section, $data, (int) $me['id']);
            audit_log('content_saved', 'content', 'section', null, null,
                ['page' => $page, 'section' => $section], null, (int) $me['id'], (string) $me['name']);
            $notice = 'Saved. It appears on the site after the next publish.';
        } catch (Throwable $e) {
            $error = 'Could not save: ' . $e->getMessage();
        }
    }
}

$ready = content_storage_ready();

/** Renders one field, or a group of them for a repeater row. */
function field_input(string $name, array $spec, mixed $value, string $scope = ''): void
{
    // The id has to carry the section, because the field names do not. Every
    // section posts its own form, so "heading" in one and "heading" in another
    // are different fields with the same name -- which is correct for the
    // form and wrong for the document, where an id must be unique. Twenty-two
    // ids were repeated on this page, and the consequence is not theoretical:
    // <label for="f_f_heading_"> finds whichever element the browser reaches
    // first, so clicking the label above one section's Heading box put the
    // cursor in a different section's.
    $id = 'f_' . preg_replace('/[^a-z0-9]+/i', '_', ($scope === '' ? '' : $scope . '_') . $name);

    echo '<label class="c-label" for="' . e($id) . '">' . e($spec['label']) . '</label>';

    // A note under the box, for a field where the shape of the answer matters
    // and the label cannot carry it -- opening hours being the case that
    // prompted it, where "Mo-Su 07:00-21:00" is the only form Google reads.
    $hint = (string) ($spec['hint'] ?? '');

    if ($spec['type'] === 'textarea') {
        echo '<textarea class="c-input" id="' . e($id) . '" name="' . e($name) . '" rows="3">'
           . e((string) $value) . '</textarea>';
    } elseif ($spec['type'] === 'list') {
        $lines = is_array($value) ? implode("\n", $value) : (string) $value;
        echo '<textarea class="c-input" id="' . e($id) . '" name="' . e($name) . '" rows="4"'
           . ' placeholder="One per line">' . e($lines) . '</textarea>';
        if ($hint === '') {
            $hint = 'One per line.';
        }
    } else {
        echo '<input class="c-input" type="text" id="' . e($id) . '" name="' . e($name) . '"'
           . ' value="' . e((string) $value) . '">';
    }

    if ($hint !== '') {
        echo '<p class="c-hint">' . e($hint) . '</p>';
    }
}

admin_shell_open($me, 'content.php', 'Website content');
?>

<?php if (!$mayEdit): ?>
  <!-- Every control on the page at once, rather than a condition on each of
       the hundred-odd fields. A disabled fieldset disables everything inside
       it, so what is left is the page as it reads -- which is the whole point
       of an account that may look and not touch. The server refuses the post
       either way; this is so nobody fills a form that will be refused. -->
  <fieldset class="c-readonly" disabled>
<?php endif; ?>

  <div class="c-top">
    <div>
      <p class="c-note">
        The words on <strong><?= e($schema[$page]['label']) ?></strong>.
        Edits are saved here and appear on the live site at the next publish.
      </p>
    </div>
    <a class="btn btn-outline btn-sm" href="/" target="_blank" rel="noopener">See the site &rarr;</a>
  </div>

  <?php if (!$mayEdit): ?>
    <div class="c-msg">This is what the website says. Changing it needs the
      &ldquo;<?= e(ability_label('content.edit')) ?>&rdquo; permission.</div>
  <?php endif; ?>

  <?php if ($notice !== null): ?>
    <div class="c-msg c-ok"><?= e($notice) ?></div>
  <?php endif; ?>
  <?php if ($error !== null): ?>
    <div class="c-msg c-bad"><?= e($error) ?></div>
  <?php endif; ?>

  <?php if (!$ready): ?>
    <div class="c-msg c-bad">
      <p class="c-msg-lead"><strong>Content storage is not set up yet.</strong></p>
      <p class="c-msg-body">
        The table that holds your edits has not been created. The installer makes it,
        but it refuses to run once an account exists — so it has to be done from here.
        Until then the site shows the wording it ships with, and the form below is
        read-only.
      </p>
      <form method="post">
        <?= csrf_field() ?>
        <input type="hidden" name="action" value="migrate">
        <button class="btn btn-primary btn-sm" type="submit">Set up content storage</button>
      </form>
    </div>
  <?php endif; ?>

  <?php $brand = site_images(); ?>
  <details class="c-sec c-fold">
    <summary class="c-sum">
      <span class="c-sum-name">Pictures</span>
      <span class="c-flag"><?= count($brand) ?> of <?= count(SITE_IMAGE_SLOTS) ?> uploaded</span>
      <svg class="c-sum-chev" width="16" height="16" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
           aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
    </summary>
    <div class="c-fold-body">
    <p class="c-note">
      Every picture on the website, in the order it appears: the two brand
      marks, the banner across the top of each page, the home page, the six
      cards under &ldquo;What we hire&rdquo; and the three steps. A slot with
      nothing in it keeps the drawing the site ships with, so an unfinished set
      still looks finished. PNG with a transparent background looks best for
      the logo; it sits on the dark header, so light artwork reads better than
      dark. The logo is kept exactly as it is drawn -- the banners are framed
      to the shape the page lays them out in. Up to 6&nbsp;MB each.
    </p>
    <p class="c-note">
      An upload appears on the website within a minute. If one does not, open
      <code>/fleet-check.html</code> on the site: it says whether the picture
      reached the server and whether the website published there is new enough
      to ask for it, which are the only two things that can be wrong.
    </p>

    <div class="brand-slots">
      <?php foreach (SITE_IMAGE_SLOTS as $slot => $label): ?>
        <?php
        [$rw, $rh, $ow, $oh] = site_image_shape($slot);
        // A logo is kept whole. There is nothing to frame, so the slot says
        // so, shows the picture on its own shape, and offers no Edit button.
        $whole = site_image_whole($slot);
        ?>
        <!-- One form per slot. The file input is hidden and driven by the
             button beside it: the native control prints "No file chosen" in
             a width nobody chose, which is what made this grid ragged. -->
        <form class="brand-slot" method="post" enctype="multipart/form-data"
              data-slot="<?= e($slot) ?>" data-ratio="<?= $rw ?>:<?= $rh ?>"
              data-out="<?= $ow ?>x<?= $oh ?>"<?= $whole ? ' data-fit="whole"' : '' ?>>
          <?= csrf_field() ?>
          <input type="hidden" name="action" value="brand-upload">
          <input type="hidden" name="slot" value="<?= e($slot) ?>">

          <span class="brand-slot-label"><?= e($label) ?></span>

          <div class="brand-slot-preview<?= $whole ? ' is-whole' : '' ?>"
               style="aspect-ratio: <?= $whole ? '16 / 10' : $rw . ' / ' . $rh ?>">
            <?php if (isset($brand[$slot])): ?>
              <!-- The readable address first, and the old ?f= one if the
                   server is not routing it. The panel is where someone looks
                   to see whether an upload worked, so a thumbnail that depends
                   on a rewrite rule is the worst place for one to be missing.
                   The fallback runs once: onerror clears itself before
                   swapping, or a genuinely missing file loops. -->
              <img src="<?= e((string) site_image_url($brand[$slot])) ?>" alt=""
                   onerror="this.onerror=null;this.src='brand.php?f=<?= e(rawurlencode($brand[$slot])) ?>'">
            <?php else: ?>
              <span class="brand-slot-empty">Nothing yet</span>
            <?php endif; ?>
          </div>

          <p class="brand-slot-shape"><?= $whole
              ? 'Kept whole &middot; scaled to fit ' . $ow . '&times;' . $oh
              : $rw . ':' . $rh . ' &middot; saved ' . $ow . '&times;' . $oh ?></p>

          <input class="brand-slot-file" type="file" name="image"
                 accept="image/jpeg,image/png,image/webp,image/avif"
                 aria-label="<?= e($label) ?>">

          <div class="brand-slot-actions">
            <button class="btn btn-outline btn-sm brand-pick" type="button">
              <?= isset($brand[$slot]) ? 'Replace' : 'Choose image' ?>
            </button>
            <?php if (isset($brand[$slot])): ?>
              <?php if (!$whole): ?>
                <!-- Nothing to frame on a slot that keeps the whole image. -->
                <button class="btn btn-ghost btn-sm brand-edit" type="button"
                        data-src="<?= e((string) site_image_url($brand[$slot])) ?>"
                        data-src-fallback="brand.php?f=<?= e(rawurlencode($brand[$slot])) ?>">Edit</button>
              <?php endif; ?>
              <!-- Same form, different action: a form cannot contain another,
                   and a second form beside it would be a second cell in the
                   grid. The script sets the action before it submits. -->
              <button class="btn btn-danger btn-sm btn-icon brand-remove" type="button"
                      title="Remove <?= e($label) ?>" aria-label="Remove <?= e($label) ?>">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M4 7h16"/><path d="M10 11v6"/><path d="M14 11v6"/>
                  <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/>
                  <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </button>
            <?php endif; ?>
          </div>
        </form>
      <?php endforeach; ?>
    </div>
    </div>
  </details>

  <?php foreach ($schema[$page]['sections'] as $key => $spec):
        $data       = content_section($page, $key);
        $overridden = $ready && content_is_overridden($page, $key); ?>

    <form method="post">
      <?= csrf_field() ?>
      <input type="hidden" name="section" value="<?= e($key) ?>">

      <!-- Folded shut by default. Open, this page was a single scroll roughly
           fifteen thousand pixels long, and finding one heading in it meant
           dragging past every other. -->
      <details class="c-sec c-fold">
        <summary class="c-sum">
          <span class="c-sum-name"><?= e($spec['label']) ?></span>
          <?php if ($overridden): ?><span class="c-flag">edited</span><?php endif; ?>
          <svg class="c-sum-chev" width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
               aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
        </summary>

        <div class="c-fold-body">
      <?php if (isset($spec['note'])): ?>
        <p class="c-note"><?= e($spec['note']) ?></p>
      <?php endif; ?>

      <?php foreach ($spec['fields'] as $fkey => $fspec): ?>
        <?php if ($fspec['type'] === 'repeater'):
              $rows = $data[$fkey] ?? [];
              // One blank row on the end is how something gets added without
              // any JavaScript. It is dropped on save if left untouched.
              $rows[] = []; ?>
          <p class="c-label c-label-group"><?= e($fspec['label']) ?></p>
          <?php foreach ($rows as $i => $row): ?>
            <div class="c-row">
              <div class="c-row-top">
                <p class="c-row-n"><?= $i + 1 === count($rows) ? 'Add another' : 'Item ' . ($i + 1) ?></p>
                <?php if ($i + 1 !== count($rows)): ?>
                  <!-- Empties the boxes rather than posting a delete of its own.
                       A section is saved whole and an item with nothing in it is
                       dropped, so clearing IS the delete -- this is the button
                       for what the hint used to ask people to do by hand. -->
                  <button type="button" class="btn btn-danger btn-sm btn-icon c-row-del"
                          title="Remove this item" aria-label="Remove item <?= $i + 1 ?>">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M4 7h16"/><path d="M10 11v6"/><path d="M14 11v6"/>
                      <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/>
                      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  </button>
                <?php endif; ?>
              </div>
              <?php foreach ($fspec['fields'] as $rkey => $rspec): ?>
                <?php field_input("f[{$fkey}][{$i}][{$rkey}]", $rspec, $row[$rkey] ?? '', $key); ?>
              <?php endforeach; ?>
            </div>
          <?php endforeach; ?>
        <?php else: ?>
          <?php field_input("f[{$fkey}]", $fspec, $data[$fkey] ?? '', $key); ?>
        <?php endif; ?>
      <?php endforeach; ?>

      <div class="c-actions">
        <button class="btn btn-primary btn-sm" type="submit" name="action" value="save"
          <?= $ready ? '' : 'disabled' ?>>Save this section</button>
        <?php if ($overridden): ?>
          <!-- data-confirm rather than onclick="return confirm(...)": the panel
               asks in its own dialog now, which cannot answer an inline
               handler because it does not block. dialog.js catches this. -->
          <button class="btn btn-ghost btn-sm" type="submit" name="action" value="reset"
            data-confirm="Your edits to this section are lost, and the site goes back to the wording it ships with."
            data-confirm-title="Reset this section?"
            data-confirm-label="Reset">
            Reset to original
          </button>
        <?php endif; ?>
      </div>
        </div>
      </details>
    </form>

  <?php endforeach; ?>
<!-- One framing dialog, reused by every slot. -->
<div class="modal-overlay" id="frameOverlay" hidden>
  <div class="modal">
    <h3 id="frameTitle">Frame the image</h3>
    <p class="field-hint" id="frameHint"></p>

    <div class="photo-crop">
      <div class="crop-window" id="frameWindow">
        <img id="frameImg" alt="">
      </div>
      <div class="crop-zoom">
        <button class="btn btn-ghost btn-sm btn-icon" type="button" id="frameOut"
                title="Zoom out" aria-label="Zoom out">&minus;</button>
        <input type="range" id="frameZoom" min="100" max="300" value="100" aria-label="Zoom">
        <button class="btn btn-ghost btn-sm btn-icon" type="button" id="frameIn"
                title="Zoom in" aria-label="Zoom in">+</button>
      </div>
      <p class="field-note">Drag the picture to move it. Whatever is inside the frame is what the site shows.</p>
    </div>

    <div class="modal-actions">
      <button class="btn btn-ghost" type="button" id="frameCancel">Cancel</button>
      <button class="btn btn-primary" type="button" id="frameSave">Use this image</button>
    </div>
  </div>
</div>

<?php if (!$mayEdit): ?>
  </fieldset>
<?php endif; ?>

<script src="<?= asset('content.js') ?>"></script>
<?php admin_shell_close(); ?>
</body>
</html>
