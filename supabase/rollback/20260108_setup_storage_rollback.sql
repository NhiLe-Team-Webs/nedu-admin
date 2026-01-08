-- Rollback: Setup Storage
-- Removes policies and the bucket created for images

-- 1. Remove policies
DROP POLICY IF EXISTS "Public Read" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;

-- 2. Remove bucket (Note: This will only work if the bucket is empty)
-- DELETE FROM storage.buckets WHERE id = 'nedu';
