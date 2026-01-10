-- Create thirty_day_config table
CREATE TABLE IF NOT EXISTS public.thirty_day_config (
    id SERIAL PRIMARY KEY,
    program_id BIGINT NOT NULL REFERENCES public.program(id) ON DELETE CASCADE,
    monthly_fee NUMERIC(12, 2) DEFAULT 396000,
    membership_fee NUMERIC(12, 2) DEFAULT 3960000,
    benefit_1_title VARCHAR(255),
    benefit_1_quote TEXT,
    benefit_1_description TEXT,
    benefit_2_title VARCHAR(255),
    benefit_2_quote TEXT,
    benefit_2_description TEXT,
    benefit_3_title VARCHAR(255),
    benefit_3_quote TEXT,
    benefit_3_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(program_id)
);

-- Enable RLS
ALTER TABLE public.thirty_day_config ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'thirty_day_config' 
        AND policyname = 'Allow public select on thirty_day_config'
    ) THEN
        CREATE POLICY "Allow public select on thirty_day_config" 
        ON public.thirty_day_config 
        FOR SELECT 
        TO anon 
        USING (true);
    END IF;
END $$;

-- Create policy to allow authenticated users (admin) to insert/update
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'thirty_day_config' 
        AND policyname = 'Allow authenticated insert/update on thirty_day_config'
    ) THEN
        CREATE POLICY "Allow authenticated insert/update on thirty_day_config" 
        ON public.thirty_day_config 
        FOR ALL 
        TO authenticated 
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;
