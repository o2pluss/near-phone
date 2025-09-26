-- Remove holiday field from stores.hours JSONB column
-- Update existing records to remove holiday field
UPDATE public.stores 
SET hours = hours - 'holiday'
WHERE hours ? 'holiday';

-- Add comment for documentation
COMMENT ON COLUMN public.stores.hours IS 'Store operating hours in format: weekday, saturday, sunday';
