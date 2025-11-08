-- Add transaction_id and payment_method columns to purchases table
-- Run this if you already have an existing database

ALTER TABLE purchases 
ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255);

ALTER TABLE purchases 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_purchases_transaction_id ON purchases(transaction_id);
CREATE INDEX IF NOT EXISTS idx_purchases_payment_method ON purchases(payment_method);

