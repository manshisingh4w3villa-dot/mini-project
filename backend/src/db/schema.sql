-- The users table already contains the fields used by authentication.
-- Run this file only if the original users table has not been created yet.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS plan_status VARCHAR(20) NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS plan_name VARCHAR(50),
  ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS pending_subscription_session_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS pending_subscription_plan VARCHAR(50),
  ADD COLUMN IF NOT EXISTS verification_token_expires_at TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_plan_status_check') THEN
    ALTER TABLE users ADD CONSTRAINT users_plan_status_check
      CHECK (plan_status IN ('free', 'active', 'past_due', 'cancelled', 'expired'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS users_stripe_customer_idx ON users (stripe_customer_id);
CREATE INDEX IF NOT EXISTS users_stripe_subscription_idx ON users (stripe_subscription_id);
CREATE UNIQUE INDEX IF NOT EXISTS users_pending_subscription_session_idx
  ON users (pending_subscription_session_id)
  WHERE pending_subscription_session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS users_verification_token_idx
  ON users (verification_token);

CREATE INDEX IF NOT EXISTS users_verification_token_expiry_idx
  ON users (verification_token_expires_at)
  WHERE verification_token_expires_at IS NOT NULL;

-- Existing pending accounts created before token expiry was introduced retain
-- their already-random token for one final 24-hour verification window.
UPDATE users
SET verification_token_expires_at = NOW() + INTERVAL '24 hours'
WHERE is_verified = FALSE
  AND verification_token IS NOT NULL
  AND verification_token_expires_at IS NULL;

-- A user may sign in with more than one external provider. Keeping these
-- identities in their own table lets us link an OAuth identity to an existing
-- account without creating duplicate users for the same email address.
CREATE TABLE IF NOT EXISTS user_social_accounts (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(32) NOT NULL,
  provider_subject VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT user_social_accounts_provider_subject_key UNIQUE (provider, provider_subject)
);

CREATE INDEX IF NOT EXISTS user_social_accounts_user_id_idx
  ON user_social_accounts (user_id);
