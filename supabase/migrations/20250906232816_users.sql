create table users (
  user_id uuid UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  pwd VARCHAR NOT NULL,
  refresh_token VARCHAR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
