create table leaderboard (
  username TEXT NOT NULL,
  solve_duration FLOAT NOT NULL,
  solved_at TIMESTAMPTZ NOT NULL DEFAULT now()
);