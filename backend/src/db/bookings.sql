CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workspace_id INT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'booked'
    CHECK (status IN ('booked', 'checked_in', 'cancelled', 'completed')),
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS hours NUMERIC(6,2),
  ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS subscription_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) NOT NULL DEFAULT 'not_required',
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id VARCHAR(255);

CREATE INDEX IF NOT EXISTS bookings_user_idx ON bookings (user_id);
CREATE INDEX IF NOT EXISTS bookings_workspace_idx ON bookings (workspace_id);
CREATE INDEX IF NOT EXISTS bookings_date_idx ON bookings (booking_date);
CREATE UNIQUE INDEX IF NOT EXISTS bookings_stripe_session_idx ON bookings (stripe_checkout_session_id)
  WHERE stripe_checkout_session_id IS NOT NULL;
