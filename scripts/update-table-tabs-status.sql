-- Update the status check constraint to include "closed" status
-- First, drop the existing constraint
ALTER TABLE table_tabs DROP CONSTRAINT IF EXISTS table_tabs_status_check;

-- Then, add the updated constraint with "closed" status included
ALTER TABLE table_tabs ADD CONSTRAINT table_tabs_status_check 
CHECK (status IN ('available', 'occupied', 'pending_payment', 'closed'));
