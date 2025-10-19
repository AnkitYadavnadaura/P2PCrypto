CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE,
  email text,
  phone text,
  kyc_status text DEFAULT 'PENDING',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS nonces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet text,
  nonce text,
  expires_at timestamptz
);

CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid,
  title text,
  type text,
  crypto_symbol text,
  amount_min numeric,
  amount_max numeric,
  price_type text,
  price_value numeric,
  payment_methods jsonb,
  status text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid,
  buyer_id uuid,
  seller_id uuid,
  amount_crypto numeric,
  price numeric,
  fiat_amount numeric,
  status text,
  escrow_deposit_tx text,
  escrow_address text,
  release_tx text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz,
  released_at timestamptz
);

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text,
  entity_id uuid,
  type text,
  amount_crypto numeric,
  amount_fiat numeric,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text,
  payload jsonb,
  created_at timestamptz DEFAULT now()
);
