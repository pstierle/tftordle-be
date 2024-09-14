CREATE TABLE correct_guess (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    guess_type VARCHAR(255) NOT NULL
)