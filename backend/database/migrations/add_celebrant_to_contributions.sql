-- Migration: Add celebrant field to contributions table
-- This field stores the name of the person who performed the marriage or baptism

ALTER TABLE contributions ADD COLUMN celebrant TEXT;

