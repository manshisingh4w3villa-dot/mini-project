const pool = require("../config/db");

async function createUser({ firstName, lastName, address, email, passwordHash, verificationToken, verificationTokenExpiresAt, isVerified }) {
  const { rows } = await pool.query(
    `INSERT INTO users
      (first_name, last_name, address, email, password_hash, verification_token, verification_token_expires_at, is_verified)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id, first_name, last_name, address, email, is_verified, is_admin,
        plan_status, plan_name, plan_expires_at, created_at`,
    [firstName, lastName, address, email, passwordHash, verificationToken, verificationTokenExpiresAt, isVerified],
  );
  return rows[0];
}

async function findUserByEmail(email) {
  const { rows } = await pool.query(
    "SELECT id, first_name, last_name, email, password_hash, is_verified, is_admin, plan_status, plan_name, plan_expires_at FROM users WHERE email = $1",
    [email],
  );
  return rows[0];
}

async function findUserById(id) {
  const { rows } = await pool.query(
    "SELECT id, first_name, last_name, email, is_verified, is_admin, plan_status, plan_name, plan_expires_at, stripe_subscription_id, pending_subscription_session_id, pending_subscription_plan FROM users WHERE id = $1",
    [id],
  );
  return rows[0];
}

async function withSubscriptionCheckoutLock(userId, operation) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock($1)', [Number(userId)]);
    const { rows } = await client.query(
      `SELECT id, email, plan_status, plan_name, plan_expires_at,
              stripe_subscription_id, pending_subscription_session_id,
              pending_subscription_plan
       FROM users WHERE id = $1 FOR UPDATE`,
      [userId],
    );
    if (!rows[0]) throw Object.assign(new Error('User no longer exists'), { statusCode: 401 });
    const result = await operation(client, rows[0]);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function setPendingSubscriptionCheckout(client, userId, sessionId, plan) {
  await client.query(
    `UPDATE users
     SET pending_subscription_session_id = $1,
         pending_subscription_plan = $2,
         updated_at = NOW()
     WHERE id = $3`,
    [sessionId, plan, userId],
  );
}

async function clearPendingSubscriptionCheckout(sessionId) {
  await pool.query(
    `UPDATE users
     SET pending_subscription_session_id = NULL,
         pending_subscription_plan = NULL,
         updated_at = NOW()
     WHERE pending_subscription_session_id = $1`,
    [sessionId],
  );
}

async function updatePlan({ userId, planStatus, planName, planExpiresAt, stripeCustomerId, stripeSubscriptionId }) {
  const { rows } = await pool.query(
    `UPDATE users
     SET plan_status = $1, plan_name = $2, plan_expires_at = $3,
         stripe_customer_id = COALESCE($4, stripe_customer_id),
         stripe_subscription_id = COALESCE($5, stripe_subscription_id),
         updated_at = NOW()
     WHERE id = $6
     RETURNING id, first_name, last_name, email, is_verified, is_admin,
               plan_status, plan_name, plan_expires_at`,
    [planStatus, planName, planExpiresAt, stripeCustomerId, stripeSubscriptionId, userId],
  );
  return rows[0];
}

async function updatePlanBySubscription({ stripeSubscriptionId, planStatus, planName, planExpiresAt }) {
  const { rows } = await pool.query(
    `UPDATE users
     SET plan_status = $1, plan_name = $2, plan_expires_at = $3, updated_at = NOW()
     WHERE stripe_subscription_id = $4
     RETURNING id`,
    [planStatus, planName, planExpiresAt, stripeSubscriptionId],
  );
  return rows[0];
}

async function verifyUserEmail(token) {
  const { rows } = await pool.query(
    `UPDATE users
     SET is_verified = TRUE, verification_token = NULL,
         verification_token_expires_at = NULL, updated_at = NOW()
     WHERE verification_token = $1
       AND verification_token_expires_at > NOW()
     RETURNING id, first_name, last_name, email, is_verified`,
    [token],
  );
  return rows[0];
}

async function setVerificationToken(userId, token, expiresAt) {
  const { rows } = await pool.query(
    `UPDATE users
     SET verification_token = $1, verification_token_expires_at = $2,
         is_verified = FALSE, updated_at = NOW()
     WHERE id = $3
     RETURNING id, first_name, last_name, email, is_verified`,
    [token, expiresAt, userId],
  );
  return rows[0];
}

const publicUserColumns = `id, first_name, last_name, email, is_verified, is_admin,
  plan_status, plan_name, plan_expires_at, created_at`;

/**
 * Finds a previously linked social identity, or atomically links it to the
 * account with the provider's verified email.  The advisory lock prevents two
 * simultaneous first-time OAuth callbacks from creating duplicate accounts.
 */
async function findOrCreateSocialUser({ provider, providerSubject, email, firstName, lastName }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`${provider}:${providerSubject}`]);

    const linked = await client.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.is_verified, u.is_admin,
              u.plan_status, u.plan_name, u.plan_expires_at, u.created_at
       FROM user_social_accounts sa
       JOIN users u ON u.id = sa.user_id
       WHERE sa.provider = $1 AND sa.provider_subject = $2`,
      [provider, providerSubject],
    );
    if (linked.rows[0]) {
      await client.query('COMMIT');
      return { user: linked.rows[0], merged: false };
    }

    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`email:${email}`]);

    const existingByEmail = await client.query(
      `SELECT ${publicUserColumns} FROM users WHERE email = $1 FOR UPDATE`,
      [email],
    );
    let user = existingByEmail.rows[0];
    const merged = Boolean(user);
    if (user) {
      const verified = await client.query(
        `UPDATE users
         SET is_verified = TRUE,
             verification_token = NULL,
             verification_token_expires_at = NULL,
             updated_at = NOW()
         WHERE id = $1
         RETURNING ${publicUserColumns}`,
        [user.id],
      );
      user = verified.rows[0];
    } else {
      const created = await client.query(
        `INSERT INTO users (first_name, last_name, email, password_hash, is_verified)
         VALUES ($1, $2, $3, NULL, TRUE)
         RETURNING ${publicUserColumns}`,
        [firstName, lastName, email],
      );
      user = created.rows[0];
    }

    await client.query(
      `INSERT INTO user_social_accounts (user_id, provider, provider_subject)
       VALUES ($1, $2, $3)
       ON CONFLICT (provider, provider_subject) DO NOTHING`,
      [user.id, provider, providerSubject],
    );
    await client.query('COMMIT');
    return { user, merged };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  verifyUserEmail,
  setVerificationToken,
  findOrCreateSocialUser,
  updatePlan,
  updatePlanBySubscription,
  withSubscriptionCheckoutLock,
  setPendingSubscriptionCheckout,
  clearPendingSubscriptionCheckout,
};
