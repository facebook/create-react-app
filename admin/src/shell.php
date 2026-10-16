<?php
declare(strict_types=1);

require_once __DIR__ . '/assets.php';
require_once __DIR__ . '/csrf.php';
require_once __DIR__ . '/auth.php';

/**
 * The frame every admin page sits in.
 *
 * It used to be copied into each page, which is how places.php ended up with
 * no header at all and its own idea of what a card looks like. One function
 * means the panel is one product: the same navigation, the same bar, the same
 * widths, whichever page is open.
 *
 * The navigation is a column on a desktop and a drawer on a phone -- the same
 * markup either way, decided in CSS. The row of pills it replaces could only
 * ever show two of its six destinations on a phone; the rest were reachable
 * by dragging a strip most people never realised could be dragged.
 */

/**
 * Every destination in the panel, in the order they are shown.
 *
 * `tab` names a panel inside dashboard.php, switched in JavaScript. `page` is
 * an ordinary link. Grouping them here rather than in each page's markup is
 * what lets content.php show the same six operational destinations the
 * dashboard does, as links back to it.
 */
function admin_nav_groups(): array
{
    $groups = [
        'Running the day' => [
            ['tab' => 'dashboard', 'label' => 'Dashboard', 'icon' => 'chart'],
            ['tab' => 'bookings',  'label' => 'Bookings',  'icon' => 'clipboard', 'count' => 'bookingCount', 'can' => 'booking.view'],
            ['tab' => 'cars',      'label' => 'Vehicles',  'icon' => 'car',       'can' => 'vehicle.view'],
            ['tab' => 'inquiries', 'label' => 'Inquiries', 'icon' => 'inbox',     'count' => 'inquiryCount', 'can' => 'enquiry.view'],
        ],
        'Money' => [
            ['tab' => 'finance', 'label' => 'Finance', 'icon' => 'card',  'can' => 'expense.view'],
            ['tab' => 'reports', 'label' => 'Reports', 'icon' => 'trend', 'can' => 'report.view'],
        ],
        'The website' => [
            ['page' => 'content.php', 'label' => 'Website content', 'icon' => 'pencil', 'can' => 'content.view'],
            ['page' => 'places.php',  'label' => 'Places to visit',  'icon' => 'pin',    'can' => 'place.view'],
        ],
        'The panel' => [
            ['page' => 'users.php', 'label' => 'Users', 'icon' => 'user', 'can' => 'user.manage'],
        ],
    ];

    // Only the entries the signed-in account may actually use. Hiding a link
    // is not a permission -- every page and endpoint guards itself, and typing
    // the address gets a 403 regardless. This is so nobody is shown a door
    // that will not open for them: a Counter Staff account offered Finance
    // used to open it and be told it could not load.
    //
    // Dashboard carries no 'can' because it is where require_login() lands
    // everybody; what it shows is decided panel by panel in admin.js, from
    // the same list of abilities published below.
    foreach ($groups as $heading => $items) {
        $allowed = array_values(array_filter(
            $items,
            static fn (array $item): bool => !isset($item['can']) || user_can($item['can'])
        ));
        if ($allowed === []) {
            unset($groups[$heading]);
        } else {
            $groups[$heading] = $allowed;
        }
    }

    return $groups;
}

/**
 * What the signed-in account may do, for the JavaScript that draws the page.
 *
 * The server decides permission; this is so the panel does not offer a button
 * whose only outcome is "You do not have permission to do that", and does not
 * fetch what it will be refused -- every refusal is written to the audit log,
 * and a dashboard that asks for the month's expenses on every load used to
 * put two of them there each time a Counter Staff account signed in.
 */
function admin_ability_list(array $me): string
{
    $role = (string) ($me['role_slug'] ?? $me['role'] ?? '');
    $can  = [];
    foreach (user_abilities((int) $me['id'], $role) as $ability => $granted) {
        if ($granted) {
            $can[] = $ability;
        }
    }
    if (user_can(ABILITY_NOT_GRANTABLE)) {
        $can[] = ABILITY_NOT_GRANTABLE;
    }
    return implode(' ', $can);
}

/** The plate beside a navigation entry. */
function admin_nav_icon(string $name): string
{
    require_once __DIR__ . '/icons.php';

    // Twenty-two rather than seventeen: a plate has a gradient, a gloss and a
    // rim in it, and at seventeen pixels all three are one smudge.
    return admin_icon3d($name, 22, null, 'ns-ico ns-ico3d');
}

/**
 * Opens the page: everything from <!DOCTYPE> down to the start of the content.
 *
 * $current is the key of the entry to mark as where you are -- a tab name on
 * the dashboard, or a filename on any other page.
 *
 * $onDashboard decides whether the six operational entries are buttons that
 * switch a panel, or links that go to the dashboard and open it there. The
 * dashboard's own JavaScript binds to .admin-tab, so the class is kept on the
 * buttons and deliberately left off the links.
 */
function admin_shell_open(
    array $me,
    string $current,
    string $title,
    bool $onDashboard = false,
    ?string $migrationError = null,
    string $headExtra = '',
): void {
    $tabHref = static fn (string $tab): string => 'dashboard.php#' . $tab;
    ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= e($title) ?> — NiteSha Cars &amp; Bikes Admin</title>
  <meta name="robots" content="noindex, nofollow">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔐</text></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <meta name="csrf-token" content="<?= e(csrf_token()) ?>">
  <meta name="abilities" content="<?= e(admin_ability_list($me)) ?>">
  <link rel="stylesheet" href="<?= asset('admin.css') ?>">
<?= $headExtra ?>
</head>
<body class="ns-body">
<a class="ns-skip" href="#nsMain">Skip to the page</a>

<div class="ns">
  <!-- The drawer's backdrop on a phone. Nothing on a wide screen. -->
  <div class="ns-scrim" id="nsScrim" hidden></div>

  <aside class="ns-side" id="nsSide">
    <div class="ns-brand">
      <!-- The business's own emblem, the same file the website's header
           uses. It replaces a drawn car icon in a circle, which was a
           stand-in for exactly this. The name is written out beside it, so
           there is nothing here for a screen reader to add. -->
      <img class="brand-mark" src="<?= asset('nitesha-cars-and-bikes-emblem.webp') ?>"
           alt="" aria-hidden="true" width="44" height="19" decoding="async">
      <span class="ns-brand-text">NiteSha <span>Cars &amp; Bikes</span></span>
      <button class="ns-close" id="nsClose" type="button" aria-label="Close the menu">&times;</button>
    </div>

    <nav class="ns-nav" aria-label="Admin sections">
      <?php foreach (admin_nav_groups() as $heading => $items): ?>
        <p class="ns-group"><?= e($heading) ?></p>
        <?php foreach ($items as $item): ?>
          <?php
          $key    = $item['tab'] ?? $item['page'];
          $active = $key === $current ? ' is-on' : '';
          $inner  = admin_nav_icon($item['icon'])
              . '<span class="ns-item-label">' . e($item['label']) . '</span>'
              . (isset($item['count'])
                  ? '<span class="tab-count" id="' . e($item['count']) . '"></span>'
                  : '');
          ?>
          <?php if (isset($item['tab']) && $onDashboard): ?>
            <button class="ns-item admin-tab<?= $active ?>" type="button" data-tab="<?= e($item['tab']) ?>"><?= $inner ?></button>
          <?php else: ?>
            <a class="ns-item<?= $active ?>" href="<?= e($item['page'] ?? $tabHref($item['tab'])) ?>"><?= $inner ?></a>
          <?php endif; ?>
        <?php endforeach; ?>
      <?php endforeach; ?>
    </nav>

    <div class="ns-side-foot">
      <span class="ns-who">
        <span class="ns-who-name"><?= e((string) $me['name']) ?></span>
        <span class="who-role"><?= e((string) ($me['role_name'] ?? $me['role'] ?? '')) ?></span>
      </span>
      <form method="post" action="logout.php" class="logout-form">
        <?= csrf_field() ?>
        <button type="submit" class="btn btn-ghost btn-sm btn-block">Log out</button>
      </form>
    </div>
  </aside>

  <div class="ns-main">
    <header class="ns-bar">
      <button class="ns-burger" id="nsBurger" type="button" aria-label="Open the menu" aria-expanded="false" aria-controls="nsSide">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>
      </button>
      <h1 class="ns-bar-title" id="nsTitle"><?= e($title) ?></h1>

      <!-- What needs doing, reachable from every page rather than only from
           the dashboard. The panel is built by shell.js, which every admin
           page loads; the dashboard additionally opens a booking in place
           instead of navigating to it. -->
      <div class="ns-bell-wrap">
        <button class="ns-bell" id="nsBell" type="button"
                aria-expanded="false" aria-controls="nsBellPanel"
                aria-label="Reminders and notifications">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8"/>
            <path d="M13.7 21a2 2 0 0 1-3.4 0"/>
          </svg>
          <span class="ns-bell-count" id="nsBellCount" hidden></span>
        </button>

        <div class="ns-bell-panel" id="nsBellPanel" hidden>
          <div class="ns-bell-head">
            <strong>Reminders</strong>
            <span class="ns-bell-sub" id="nsBellSub">Loading&hellip;</span>
            <button type="button" class="ns-bell-add" id="nsBellAdd">+ Add</button>
          </div>
          <ul class="ns-bell-list" id="nsBellList"></ul>
        </div>
      </div>

      <!-- Who you are signed in as. It read "Admin" for everybody, which on a
           Counter Staff account contradicted the badge in the sidebar -- and
           on a phone, where the sidebar is a drawer, this is the only place
           the role is written at all. -->
      <span class="admin-tag"><?= e((string) ($me['role_name'] ?? $me['role'] ?? 'Admin')) ?></span>
    </header>

<?php if ($migrationError !== null): ?>
    <div class="migration-warning">
      <strong>The database is not fully up to date.</strong>
      Some newer features may fail until this is resolved.
      <span><?= e($migrationError) ?></span>
    </div>
<?php endif; ?>

    <main class="ns-content" id="nsMain">
<?php
}

/** Closes what admin_shell_open opened, and loads the drawer's script. */
function admin_shell_close(): void
{
    ?>
    </main>
  </div>
</div>
<div class="modal-overlay" id="nsReminderOverlay" hidden>
  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="nsReminderTitle">
    <h3 id="nsReminderTitle">New reminder</h3>
    <form id="nsReminderForm">
      <input type="hidden" id="nsReminderId" />
      <div class="field-group">
        <label for="nsReminderText">What is it?</label>
        <input type="text" id="nsReminderText" maxlength="190" required
               placeholder="Call Prasanth about the November booking" />
      </div>
      <div class="modal-row">
        <div class="field-group">
          <label for="nsReminderDate">When</label>
          <input type="date" id="nsReminderDate" required />
        </div>
        <div class="field-group">
          <label for="nsReminderTime">Time</label>
          <input type="time" id="nsReminderTime" />
          <p class="field-hint">Optional. Most reminders are just &ldquo;that day&rdquo;.</p>
        </div>
      </div>
      <div class="field-group">
        <label for="nsReminderNote">Anything else</label>
        <input type="text" id="nsReminderNote" maxlength="2000"
               placeholder="Optional — a number, an amount, what it is about" />
      </div>
      <p class="login-error" id="nsReminderError"></p>
      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" id="nsReminderCancel">Cancel</button>
        <button type="submit" class="btn btn-primary" id="nsReminderSave">Save reminder</button>
      </div>
    </form>
  </div>
</div>

<!-- Before everything else: every other script on the page asks questions
     through it. -->
<script src="<?= asset('dialog.js') ?>"></script>
<script src="<?= asset('shell.js') ?>"></script>
<?php
}
