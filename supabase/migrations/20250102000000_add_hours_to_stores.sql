-- Add hours column to stores table
ALTER TABLE public.stores 
ADD COLUMN hours jsonb;

-- Add comment to describe the structure
COMMENT ON COLUMN public.stores.hours IS 'Store operating hours in JSON format: {"weekday": "09:00 - 18:00", "saturday": "09:00 - 18:00", "sunday": "휴무"}';
