-- Create storage bucket for programs and mentors
INSERT INTO storage.buckets (id, name, public) 
VALUES ('nedu', 'nedu', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies to allow public read and authenticated upload
-- Note: These policies assume you have a bucket named 'nedu'

-- 1. Allow public access to read files
CREATE POLICY "Public Read" ON storage.objects FOR SELECT USING (bucket_id = 'nedu');

-- 2. Allow authenticated users (Admins) to upload files
CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'nedu' AND auth.role() = 'authenticated');

-- 3. Allow authenticated users (Admins) to update their own files
CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE USING (bucket_id = 'nedu' AND auth.role() = 'authenticated');

-- 4. Allow authenticated users (Admins) to delete their own files
CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE USING (bucket_id = 'nedu' AND auth.role() = 'authenticated');
