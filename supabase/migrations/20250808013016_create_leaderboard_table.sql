create table leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid();
  username TEXT NOT NULL,
  solve_duration FLOAT NOT NULL,
  solved_at TIMESTAMPTZ NOT NULL DEFAULT now()
);