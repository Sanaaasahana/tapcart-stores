-- Add Razorpay payment keys to stores table
-- Each store can have their own Razorpay merchant account

ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS razorpay_key_id VARCHAR(255);

ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS razorpay_key_secret VARCHAR(255);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_stores_razorpay_key_id ON stores(razorpay_key_id);

-- Add comment for documentation
COMMENT ON COLUMN stores.razorpay_key_id IS 'Razorpay Key ID for this store merchant account';
COMMENT ON COLUMN stores.razorpay_key_secret IS 'Razorpay Key Secret for this store merchant account (encrypted in production)';

