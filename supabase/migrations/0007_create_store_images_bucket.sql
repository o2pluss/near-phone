-- Create store-images bucket for storing store photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'store-images',
  'store-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Create RLS policies for store-images bucket
CREATE POLICY "Store images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'store-images');

CREATE POLICY "Users can upload store images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'store-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.stores 
    WHERE seller_id = auth.uid()
  )
);

CREATE POLICY "Users can update their store images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'store-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.stores 
    WHERE seller_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their store images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'store-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.stores 
    WHERE seller_id = auth.uid()
  )
);
