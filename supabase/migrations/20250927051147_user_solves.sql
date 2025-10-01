CREATE TABLE user_solves (
    solve_id UUID PRIMARY KEY DEFUALT gen_random_uuid(),
    user_id UUID NOT NULL,
    solve_duration FLOAT NOT NULL,
    scramble VARCHAR NOT NULL,
    move_list VARCHAR NOT NULL,
    solved_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);