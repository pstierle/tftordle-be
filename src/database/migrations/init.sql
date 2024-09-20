CREATE TABLE IF NOT EXISTS migration (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    file_name VARCHAR(255),
    created_date TIMESTAMPTZ
);