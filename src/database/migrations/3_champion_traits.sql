CREATE TABLE champion_traits (
    champion_id UUID NOT NULL,
    trait_id UUID NOT NULL,
    CONSTRAINT fk_champion FOREIGN KEY(champion_id) REFERENCES champion(id),
    CONSTRAINT fk_trait FOREIGN KEY(trait_id) REFERENCES trait(id)
)