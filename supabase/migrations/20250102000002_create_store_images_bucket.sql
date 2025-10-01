-- Create store-images bucket for Supabase Storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'store-images',
  'store-images', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Create RLS policies for store-images bucket
CREATE POLICY "store_images_select_policy" ON storage.objects
FOR SELECT USING (bucket_id = 'store-images');

CREATE POLICY "store_images_insert_policy" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'store-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "store_images_update_policy" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'store-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "store_images_delete_policy" ON storage.objects
FOR DELETE USING (
  bucket_id = 'store-images' 
  AND auth.role() = 'authenticated'
);
