create table users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  pwd VARCHAR NOT NULL,
  refreshToken VARCHAR,
);
