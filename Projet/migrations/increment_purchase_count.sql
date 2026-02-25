-- Function to increment product purchase count atomically
CREATE OR REPLACE FUNCTION increment_purchase_count(product_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE products
  SET 
    purchase_count = COALESCE(purchase_count, 0) + 1,
    updated_at = NOW()
  WHERE id = product_id;
END;
$$;
