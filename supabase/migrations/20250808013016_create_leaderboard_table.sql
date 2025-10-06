create table leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR NOT NULL,
  solve_duration FLOAT NOT NULL,
  solved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  scramble VARCHAR(59) NOT NULL,
  move_history VARCHAR NOT NULL
);
