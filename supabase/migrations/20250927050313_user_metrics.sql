CREATE TABLE user_metrics (
    id UUID PRIMARY KEY,
    total_solves INTEGER NOT NULL,
    fastest_solve_time FLOAT NOT NULL,
    wins INTEGER NOT NULL,
    losses INTEGER NOT NULL,
    fastest_solve_scramble VARCHAR NOT NULL,
    fastest_solve_move_history VARCHAR NOT NULL,
    CONSTRAINT fk_user FOREIGN KEY (id) REFERENCES users(id)
);