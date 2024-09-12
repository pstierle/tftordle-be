CREATE TABLE guess_champion (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date VARCHAR(10) NOT NULL,
    guess_type VARCHAR(255) NOT NULL,
    champion_id UUID NOT NULL,
    CONSTRAINT fk_champion FOREIGN KEY(champion_id) REFERENCES champion(id)
)