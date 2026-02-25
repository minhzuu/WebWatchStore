-- Migration: Add updated_by column to inventories table
-- This tracks which admin user last updated the inventory stock

ALTER TABLE inventories
ADD COLUMN updated_by BIGINT NULL,
ADD CONSTRAINT fk_inventory_updated_by 
    FOREIGN KEY (updated_by) 
    REFERENCES users(id) 
    ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX idx_inventory_updated_by ON inventories(updated_by);

-- Update comment
COMMENT ON COLUMN inventories.updated_by IS 'ID của admin đã cập nhật số lượng tồn kho';
