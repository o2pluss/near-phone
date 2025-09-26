-- Add hours and images columns to stores table
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS hours jsonb DEFAULT '{
  "weekday": "09:00 - 18:00",
  "saturday": "09:00 - 18:00", 
  "sunday": "휴무",
  "holiday": "휴무"
}'::jsonb;

ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN public.stores.hours IS 'Store operating hours for each day of the week';
COMMENT ON COLUMN public.stores.images IS 'Array of store image URLs';
