-- Add images column to stores table
ALTER TABLE public.stores 
ADD COLUMN images text[];

-- Add comment to describe the structure
COMMENT ON COLUMN public.stores.images IS 'Array of store image URLs';
