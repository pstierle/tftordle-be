CREATE TABLE champion (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    set VARCHAR(255) NOT NULL,
    cost SMALLINT NOT NULL,
    range SMALLINT NOT NULL,
    gender VARCHAR(255) NOT NULL
);