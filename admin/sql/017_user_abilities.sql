-- What one person may do that their role does not say.
--
-- Five roles covered the business while everybody fitted one of them. They
-- stop covering it the moment somebody nearly fits: the person who runs the
-- counter and is also trusted to take the cash, the relative who should see
-- the expenses and touch nothing. Both of those were a choice between a role
-- that does too little and one that does far too much, and the panel had no
-- third answer.
--
-- One row per difference, not per permission. An account with no rows is
-- exactly its role, which is almost all of them; an account with two rows is
-- "Accounts, and may also cancel a booking". Storing the differences rather
-- than a snapshot of the whole set is what keeps that sentence true after the
-- meaning of a role changes -- a snapshot would silently freeze whatever the
-- role happened to grant on the day the account was made.
--
-- granted is 1 for something the role does not give and this person has, 0
-- for something the role gives and this person does not. There is no third
-- value: "as the role says" is the absence of a row.
CREATE TABLE IF NOT EXISTS user_abilities (
  user_id    INT UNSIGNED NOT NULL,

  -- The permission as the server asks for it: 'payment.create'. Deliberately
  -- not a foreign key to a table of permissions -- the catalogue lives in
  -- src/abilities.php next to the code that enforces it, and a row naming a
  -- permission that no longer exists is ignored rather than fatal.
  ability    VARCHAR(40)  NOT NULL,

  granted    TINYINT(1)   NOT NULL,

  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- One answer per person per permission, enforced here rather than trusted
  -- to the code: two rows disagreeing about whether somebody may void a
  -- payment is not a question the server should ever have to resolve.
  PRIMARY KEY (user_id, ability),

  CONSTRAINT fk_user_abilities_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
