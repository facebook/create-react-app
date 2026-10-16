<?php
declare(strict_types=1);

require_once __DIR__ . '/src/csrf.php';
require_once __DIR__ . '/src/assets.php';
require_once __DIR__ . '/src/migrate.php';
require_once __DIR__ . '/src/auth.php';
require_once __DIR__ . '/src/abilities.php';
require_once __DIR__ . '/src/audit.php';
require_once __DIR__ . '/src/shell.php';

/**
 * Users: who can sign in, and as what.
 *
 * The roles table has described five of these since the schema was written,
 * and the Super Admin row says in so many words "Full access, including user
 * management" -- of a panel that had no screen for it. The only way to add a
 * second person was tools/create-user.php over SSH, which on this hosting
 * means the business cannot add its own staff without asking a developer.
 *
 * Guarded by 'user.manage' rather than 'user.view'. The ability names matter
 * here: auditor holds '*.view', which would have matched user.view and handed
 * a read-only account the list of everyone who can sign in. One ability, named
 * so that only the '*' of super_admin reaches it.
 *
 * A page rather than a dashboard tab, like Website content and Places: it is
 * opened when somebody joins or leaves, not while running the day.
 *
 * A role is chosen first and then adjusted. Five roles covered the business
 * while everybody fitted one of them, and stopped the moment somebody nearly
 * did: the person on the counter who is also trusted with the cash, the
 * relative who should see the expenses and touch nothing. Both were a choice
 * between a role that does too little and one that does far too much. So the
 * role sets the ticks, and the ticks can then be changed one at a time --
 * stored as differences from the role, never as a snapshot of it, so that
 * "Staff, and may also take payments" stays true when Staff changes meaning.
 */

$me = require_can('user.manage');

$migrationError = migrate_if_needed();

header('X-Frame-Options: DENY');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');

$notice = null;
$error  = null;

$roles = fetch_all('SELECT slug, name, description FROM roles ORDER BY id');
$roleSlugs = array_column($roles, 'slug');

/**
 * The ticked permissions a form posted, or null to mean "whatever the role
 * says".
 *
 * The hidden abilities_for field names the role the ticks were rendered for.
 * If it does not match the role being saved, the ticks describe a different
 * role's standard and are ignored -- which is what happens with JavaScript
 * off, where changing the role cannot re-tick the boxes. Ignoring them falls
 * back to the role's own standard, the safe reading of the two: the
 * alternative is saving Staff's ticks against Accounts and recording nine
 * removals nobody asked for.
 *
 * @return list<string>|null
 */
function posted_abilities(string $role): ?array
{
    if ((string) ($_POST['abilities_for'] ?? '') !== $role) {
        return null;
    }
    $ticked = $_POST['abilities'] ?? [];
    if (!is_array($ticked)) {
        return null;
    }
    return array_values(array_intersect(
        array_filter($ticked, 'is_string'),
        all_abilities()
    ));
}

/**
 * The permission grid for a form, ticked as $effective says.
 *
 * One function for both forms on this page -- the one that creates an account
 * and the one that adjusts an existing one -- so the two cannot drift into
 * offering different permissions, which is the failure src/vocab.php exists
 * to remember.
 */
function ability_grid(array $effective): string
{
    $html = '<div class="u-perm-grid">';
    foreach (ABILITY_GROUPS as $group => $abilities) {
        $html .= '<fieldset class="u-perm-group"><legend>' . e($group) . '</legend>';
        foreach ($abilities as $ability => $label) {
            $weighty = in_array($ability, ABILITY_WEIGHTY, true);
            $html .= '<label class="u-perm' . ($weighty ? ' is-weighty' : '') . '">'
                   . '<input type="checkbox" name="abilities[]" value="' . e($ability) . '"'
                   . (!empty($effective[$ability]) ? ' checked' : '') . '>'
                   . '<span>' . e($label) . '</span>'
                   . '</label>';
        }
        $html .= '</fieldset>';
    }
    return $html . '</div>';
}

/** "Accounts" rather than "accounts", for a sentence somebody reads. */
function role_name_of(array $roles, string $slug): string
{
    foreach ($roles as $r) {
        if ($r['slug'] === $slug) {
            return (string) $r['name'];
        }
    }
    return $slug;
}

/** "2 added, 1 removed", or '' when the account is exactly its role. */
function ability_summary(array $counts): string
{
    $parts = [];
    if ($counts['extra'] > 0) {
        $parts[] = $counts['extra'] . ' added';
    }
    if ($counts['removed'] > 0) {
        $parts[] = $counts['removed'] . ' removed';
    }
    return implode(', ', $parts);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();

    $action = (string) ($_POST['action'] ?? '');
    $id     = (int) ($_POST['id'] ?? 0);

    // Everything below refuses to act on the signed-in account.
    //
    // Not out of tidiness: this is the only screen that can remove the last
    // way into the panel. Changing your own role to Staff, or switching
    // yourself off, locks you out of the page you would use to undo it -- and
    // on a one-super-admin business that is the whole panel, recoverable only
    // over SSH. Somebody else's account can be changed freely; your own is
    // changed by somebody else, or at the command line.
    $isSelf = $id === (int) $me['id'];

    try {
        if ($action === 'create') {
            $name     = trim((string) ($_POST['name'] ?? ''));
            $email    = strtolower(trim((string) ($_POST['email'] ?? '')));
            $role     = (string) ($_POST['role'] ?? '');
            $password = (string) ($_POST['password'] ?? '');

            if ($name === '' || $email === '') {
                throw new InvalidArgumentException('A name and an email address are both needed.');
            }
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                throw new InvalidArgumentException('That email address does not look right.');
            }
            if (!in_array($role, $roleSlugs, true)) {
                throw new InvalidArgumentException('Choose a role.');
            }
            if ($password !== (string) ($_POST['password_confirm'] ?? '')) {
                throw new InvalidArgumentException('The two passwords do not match.');
            }
            if (fetch_one('SELECT id FROM users WHERE email = ?', [$email]) !== null) {
                throw new InvalidArgumentException('Somebody already signs in with that email address.');
            }

            // create_user() enforces the ten-character minimum and does the
            // hashing. Called rather than reimplemented, so the rule lives in
            // one place and the CLI tool and this screen cannot disagree.
            $newId = create_user($name, $email, $password, $role);

            // The ticks, if this form was able to offer them for this role.
            // A Super Admin is full access by definition and has no ticks to
            // save -- set_user_abilities would write a row for every
            // permission the role grants and the screen does not show.
            $delta = ['extra' => [], 'removed' => []];
            $wanted = $role === 'super_admin' ? null : posted_abilities($role);
            if ($wanted !== null) {
                $delta = set_user_abilities($newId, $role, $wanted);
            }

            audit_log('user_created', 'auth', 'user', $newId, null,
                ['name' => $name, 'email' => $email, 'role' => $role,
                 'added' => $delta['extra'], 'removed' => $delta['removed']],
                'Created from the Users screen', (int) $me['id'], (string) $me['name']);

            $tally = ability_summary(['extra' => count($delta['extra']), 'removed' => count($delta['removed'])]);
            $notice = $name . ' can now sign in as ' . role_name_of($roles, $role)
                . ($tally === '' ? '.' : ', with ' . $tally . ' against that role.');

        } elseif ($action === 'role') {
            $role = (string) ($_POST['role'] ?? '');
            if ($isSelf) {
                throw new InvalidArgumentException('You cannot change your own role.');
            }
            if (!in_array($role, $roleSlugs, true)) {
                throw new InvalidArgumentException('Choose a role.');
            }
            $before = fetch_one('SELECT u.name, r.slug AS role FROM users u
                                   JOIN roles r ON r.id = u.role_id WHERE u.id = ?', [$id]);
            if ($before === null) {
                throw new InvalidArgumentException('That account no longer exists.');
            }
            $hadExceptions = user_ability_counts($id, (string) $before['role']);
            query('UPDATE users SET role_id = (SELECT id FROM roles WHERE slug = ?) WHERE id = ?',
                [$role, $id]);

            // Changing the role resets the exceptions with it. They are stored
            // as differences from a role, so keeping them across a change
            // would mean reading yesterday's differences against today's
            // baseline -- "two added" against Staff can be "one removed"
            // against Accounts, which is not a thing anybody chose. The screen
            // says so above the list, and the permissions are two clicks away.
            clear_user_abilities($id);

            audit_log('user_role_changed', 'auth', 'user', $id,
                ['role' => $before['role'],
                 'added' => $hadExceptions['extra'], 'removed' => $hadExceptions['removed']],
                ['role' => $role, 'added' => 0, 'removed' => 0], null,
                (int) $me['id'], (string) $me['name']);

            $had = ability_summary($hadExceptions);
            $notice = $before['name'] . ' is now ' . role_name_of($roles, $role) . '.'
                . ($had === '' ? '' : ' The ' . $had . ' permission(s) set against the old role'
                    . ' went with it — set them again if they still apply.');

        } elseif ($action === 'abilities') {
            if ($isSelf) {
                throw new InvalidArgumentException('You cannot change your own permissions.');
            }
            $row = fetch_one('SELECT u.name, r.slug AS role FROM users u
                                JOIN roles r ON r.id = u.role_id WHERE u.id = ?', [$id]);
            if ($row === null) {
                throw new InvalidArgumentException('That account no longer exists.');
            }
            // A Super Admin is full access, and a Super Admin with pieces
            // missing is a contradiction rather than a configuration. Change
            // the role first if the access is meant to be narrower.
            if ($row['role'] === 'super_admin') {
                throw new InvalidArgumentException(
                    'A Super Admin has full access. Give them a narrower role first, then set permissions.');
            }

            $before = user_ability_overrides($id);

            if (isset($_POST['reset'])) {
                clear_user_abilities($id);
                audit_log('user_abilities_reset', 'auth', 'user', $id,
                    ['overrides' => $before], ['overrides' => []], null,
                    (int) $me['id'], (string) $me['name']);
                $notice = $row['name'] . ' is back to exactly what '
                    . role_name_of($roles, (string) $row['role']) . ' allows.';
            } else {
                $wanted = posted_abilities((string) $row['role']);
                if ($wanted === null) {
                    throw new InvalidArgumentException(
                        'That form was for a different role — reload the page and try again.');
                }
                $delta = set_user_abilities($id, (string) $row['role'], $wanted);
                audit_log('user_abilities_changed', 'auth', 'user', $id,
                    ['overrides' => $before],
                    ['added' => $delta['extra'], 'removed' => $delta['removed']], null,
                    (int) $me['id'], (string) $me['name']);
                $tally = ability_summary(['extra' => count($delta['extra']), 'removed' => count($delta['removed'])]);
                $roleName = role_name_of($roles, (string) $row['role']);
                $notice = $tally === ''
                    ? $row['name'] . ' is now exactly what ' . $roleName . ' allows.'
                    : 'Permissions saved for ' . $row['name'] . ' — ' . $tally . ' against ' . $roleName . '.';
            }

        } elseif ($action === 'active') {
            $on = (string) ($_POST['active'] ?? '') === '1';
            if ($isSelf) {
                throw new InvalidArgumentException('You cannot switch your own account off.');
            }
            $row = fetch_one('SELECT name FROM users WHERE id = ?', [$id]);
            if ($row === null) {
                throw new InvalidArgumentException('That account no longer exists.');
            }
            // Switched off rather than deleted. Every booking, payment and
            // expense records who entered it, and a deleted user takes the
            // answer to "who did this" with it.
            query('UPDATE users SET is_active = ?, failed_logins = 0, locked_until = NULL WHERE id = ?',
                [$on ? 1 : 0, $id]);
            audit_log($on ? 'user_enabled' : 'user_disabled', 'auth', 'user', $id,
                null, ['is_active' => $on ? 1 : 0], null,
                (int) $me['id'], (string) $me['name']);
            $notice = $row['name'] . ($on ? ' can sign in again.' : ' can no longer sign in.');

        } elseif ($action === 'password') {
            $password = (string) ($_POST['password'] ?? '');
            if ($password !== (string) ($_POST['password_confirm'] ?? '')) {
                throw new InvalidArgumentException('The two passwords do not match.');
            }
            if (strlen($password) < 10) {
                throw new InvalidArgumentException('A password needs at least 10 characters.');
            }
            $row = fetch_one('SELECT name FROM users WHERE id = ?', [$id]);
            if ($row === null) {
                throw new InvalidArgumentException('That account no longer exists.');
            }
            // The lock is cleared with it: somebody who has forgotten a
            // password has usually also been locked out trying to remember it,
            // and a new password that still refuses to sign in is a second
            // support call.
            query('UPDATE users SET password_hash = ?, failed_logins = 0, locked_until = NULL WHERE id = ?',
                [password_hash($password, PASSWORD_DEFAULT), $id]);
            // The password is not in the log, here or anywhere. What is
            // recorded is that it changed and who changed it.
            audit_log('user_password_reset', 'auth', 'user', $id, null, null,
                'Reset from the Users screen', (int) $me['id'], (string) $me['name']);
            $notice = 'New password set for ' . $row['name'] . '. Tell them in person, not by message.';
        }
    } catch (Throwable $e) {
        $error = $e->getMessage();
    }
}

$users = fetch_all(
    'SELECT u.id, u.name, u.email, u.is_active, u.last_login_at, u.locked_until,
            u.created_at, r.slug AS role_slug, r.name AS role_name
       FROM users u
       JOIN roles r ON r.id = u.role_id
      ORDER BY u.is_active DESC, u.name'
);

$fmt = static function (?string $when): string {
    if ($when === null || $when === '') {
        return 'never';
    }
    $t = strtotime($when);
    return $t === false ? 'never' : date('j M Y, g:ia', $t);
};

admin_shell_open($me, 'users.php', 'Users', false, $migrationError);
?>

  <div class="c-top">
    <div>
      <p class="c-note">
        Everybody with a login to this panel, and what each of them may do.
        Only a <strong>Super Admin</strong> sees this page.
      </p>
    </div>
  </div>

  <?php if ($notice !== null): ?>
    <p class="c-msg c-ok"><?= e($notice) ?></p>
  <?php endif; ?>
  <?php if ($error !== null): ?>
    <p class="c-msg c-bad"><?= e($error) ?></p>
  <?php endif; ?>

  <section class="admin-panel">
    <div class="panel-header">
      <div>
        <h2>Accounts</h2>
        <p>Switched off rather than deleted, always — every booking and payment records
          who entered it, and a deleted account takes the answer to &ldquo;who did this&rdquo;
          with it.</p>
      </div>
    </div>

    <div class="rec-tablewrap">
      <table class="rec-table">
        <thead>
          <tr>
            <th>Name</th>
            <th class="rec-hide-sm">Email</th>
            <th>Role</th>
            <th class="rec-hide-sm">Last signed in</th>
            <th>Status</th>
            <th class="rec-act">Action</th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ($users as $u): $self = (int) $u['id'] === (int) $me['id']; ?>
            <tr>
              <td>
                <span class="rec-who"><?= e($u['name']) ?></span>
                <?= $self ? '<span class="status-badge status-badge-Active">you</span>' : '' ?>
              </td>
              <td class="rec-hide-sm"><?= e($u['email']) ?></td>
              <td>
                <?php if ($self): ?>
                  <?= e($u['role_name']) ?>
                <?php else: ?>
                  <form method="post" class="u-inline">
                    <?= csrf_field() ?>
                    <input type="hidden" name="action" value="role">
                    <input type="hidden" name="id" value="<?= (int) $u['id'] ?>">
                    <select name="role" onchange="this.form.submit()" aria-label="Role for <?= e($u['name']) ?>">
                      <?php foreach ($roles as $r): ?>
                        <option value="<?= e($r['slug']) ?>"<?= $r['slug'] === $u['role_slug'] ? ' selected' : '' ?>>
                          <?= e($r['name']) ?>
                        </option>
                      <?php endforeach; ?>
                    </select>
                  </form>
                <?php endif; ?>
                <?php $tally = ability_summary(user_ability_counts((int) $u['id'], (string) $u['role_slug'])); ?>
                <?php if ($tally !== ''): ?>
                  <span class="field-hint u-perm-tally"><?= e($tally) ?></span>
                <?php endif; ?>
              </td>
              <td class="rec-hide-sm rec-when"><?= e($fmt($u['last_login_at'])) ?></td>
              <td>
                <?php if ((int) $u['is_active'] === 1): ?>
                  <span class="status-badge status-badge-Active">Active</span>
                <?php else: ?>
                  <span class="status-badge status-badge-Inactive">Off</span>
                <?php endif; ?>
              </td>
              <td class="rec-act">
                <?php if ($self): ?>
                  <span class="field-hint">Changed by another Super Admin,<br>or at the command line.</span>
                <?php else: ?>
                  <span class="u-acts">
                    <form method="post">
                      <?= csrf_field() ?>
                      <input type="hidden" name="action" value="active">
                      <input type="hidden" name="id" value="<?= (int) $u['id'] ?>">
                      <input type="hidden" name="active" value="<?= (int) $u['is_active'] === 1 ? '0' : '1' ?>">
                      <button class="btn btn-ghost btn-sm" type="submit">
                        <?= (int) $u['is_active'] === 1 ? 'Switch off' : 'Switch on' ?>
                      </button>
                    </form>
                    <details class="u-reset">
                      <summary class="btn btn-ghost btn-sm">New password</summary>
                      <form method="post" class="u-reset-form">
                        <?= csrf_field() ?>
                        <input type="hidden" name="action" value="password">
                        <input type="hidden" name="id" value="<?= (int) $u['id'] ?>">
                        <input type="password" name="password" required minlength="10"
                               autocomplete="new-password" placeholder="At least 10 characters">
                        <input type="password" name="password_confirm" required minlength="10"
                               autocomplete="new-password" placeholder="Again">
                        <button class="btn btn-primary btn-sm" type="submit">Set it</button>
                      </form>
                    </details>
                  </span>
                <?php endif; ?>
              </td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  </section>

  <section class="admin-panel">
    <div class="panel-header">
      <div>
        <h2>What each of them may do</h2>
        <p>The role sets these. Change any one of them and what gets saved is the
          difference &mdash; so an account reads as &ldquo;Accounts, and may also cancel a
          booking&rdquo;, and stays that way when the role itself is adjusted later.
          Changing somebody&rsquo;s role clears whatever was set here, because a difference
          only means something against the role it was set against.</p>
        <p class="field-hint">A dot marks the ones that remove something, or change a figure
          that has already been counted. They are not harder to use &mdash; they are harder to
          undo.</p>
      </div>
    </div>

    <?php foreach ($users as $u): ?>
      <?php
        $self  = (int) $u['id'] === (int) $me['id'];
        $full  = $u['role_slug'] === 'super_admin';
        $tally = ability_summary(user_ability_counts((int) $u['id'], (string) $u['role_slug']));
      ?>
      <details class="u-perm-person"<?= $tally !== '' ? ' open' : '' ?>>
        <summary>
          <span class="u-perm-name"><?= e($u['name']) ?></span>
          <span class="u-perm-role"><?= e($u['role_name']) ?></span>
          <?php if ($tally !== ''): ?>
            <span class="status-badge status-badge-Pending"><?= e($tally) ?></span>
          <?php elseif (!$full): ?>
            <span class="field-hint">exactly the role</span>
          <?php endif; ?>
          <?php if ((int) $u['is_active'] !== 1): ?>
            <span class="status-badge status-badge-Inactive">Off</span>
          <?php endif; ?>
        </summary>

        <?php if ($full): ?>
          <p class="c-note">A <strong>Super Admin</strong> can do everything in the panel,
            including this page. There is nothing to choose, and nothing is stored &mdash;
            give a narrower role first if the access should be narrower.</p>
        <?php elseif ($self): ?>
          <p class="c-note">Your own permissions, which this page will not change. Another
            Super Admin can, or you can at the command line &mdash; the same rule as your role
            and your password above, and for the same reason.</p>
          <?= ability_grid(user_abilities((int) $u['id'], (string) $u['role_slug'])) ?>
        <?php else: ?>
          <form method="post" class="u-perm-form">
            <?= csrf_field() ?>
            <input type="hidden" name="action" value="abilities">
            <input type="hidden" name="id" value="<?= (int) $u['id'] ?>">
            <input type="hidden" name="abilities_for" value="<?= e($u['role_slug']) ?>">
            <?= ability_grid(user_abilities((int) $u['id'], (string) $u['role_slug'])) ?>
            <div class="u-perm-save">
              <button class="btn btn-primary btn-sm" type="submit">Save permissions</button>
              <?php if ($tally !== ''): ?>
                <button class="btn btn-ghost btn-sm" type="submit" name="reset" value="1">
                  Back to what <?= e($u['role_name']) ?> allows
                </button>
              <?php endif; ?>
            </div>
          </form>
        <?php endif; ?>
      </details>
    <?php endforeach; ?>
  </section>

  <section class="admin-panel">
    <div class="panel-header">
      <div>
        <h2>Add somebody</h2>
        <p>They sign in at this same address with the email and password set here.
          Give them the password in person &mdash; not over WhatsApp, where it stays
          readable on both phones for good.</p>
      </div>
    </div>

    <form method="post" class="u-new">
      <?= csrf_field() ?>
      <input type="hidden" name="action" value="create">
      <div class="modal-row">
        <div class="field-group">
          <label for="uName">Full name</label>
          <input type="text" id="uName" name="name" required maxlength="120" data-rule="name" >
        </div>
        <div class="field-group">
          <label for="uEmail">Email</label>
          <input type="email" id="uEmail" name="email" required maxlength="190">
        </div>
      </div>
      <div class="modal-row">
        <div class="field-group">
          <label for="uPassword">Password</label>
          <input type="password" id="uPassword" name="password" required minlength="10"
                 autocomplete="new-password" placeholder="At least 10 characters">
        </div>
        <div class="field-group">
          <label for="uPasswordConfirm">Password again</label>
          <input type="password" id="uPasswordConfirm" name="password_confirm" required
                 minlength="10" autocomplete="new-password">
        </div>
      </div>
      <div class="field-group">
        <label for="uRole">What they may do</label>
        <select id="uRole" name="role" required>
          <?php foreach ($roles as $r): ?>
            <option value="<?= e($r['slug']) ?>"<?= $r['slug'] === 'staff' ? ' selected' : '' ?>>
              <?= e($r['name']) ?> &mdash; <?= e((string) $r['description']) ?>
            </option>
          <?php endforeach; ?>
        </select>
        <p class="field-hint">Staff by default. Give the least that lets somebody do their job:
          a role can be raised in a second from the table above, and an account that could
          never do the damage is the one that never does.</p>
      </div>

      <div class="field-group u-perm-block">
        <label>And exactly what they may do</label>
        <input type="hidden" name="abilities_for" id="uAbilitiesFor" value="staff">
        <p class="field-hint" id="uPermNote">
          Ticked is the standard for <strong>Staff</strong>. Change any of them &mdash; what is
          saved is the difference, so this account stays &ldquo;Staff, with changes&rdquo; rather
          than becoming a copy of today&rsquo;s Staff that never moves again. A dot marks what is hard to undo.
        </p>
        <?= ability_grid(role_abilities('staff')) ?>
      </div>

      <button class="btn btn-primary" type="submit">Create the account</button>
    </form>
  </section>

<?php
/**
 * What each role ticks, so changing the role above re-ticks the boxes without
 * a round trip. A data block rather than generated JavaScript: the page has
 * nothing executable written into it, and the list comes from the same
 * role_abilities() the server will check against.
 */
$roleStandards = [];
foreach ($roleSlugs as $slug) {
    $roleStandards[$slug] = array_keys(array_filter(role_abilities($slug)));
}
?>
  <script type="application/json" id="nsRoleStandards"><?= json_encode(
      $roleStandards, JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_SLASHES
  ) ?></script>
  <script src="<?= asset('input-rules.js') ?>"></script>
  <script src="<?= asset('users.js') ?>"></script>

<?php admin_shell_close(); ?>
