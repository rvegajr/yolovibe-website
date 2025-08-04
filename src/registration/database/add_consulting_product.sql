-- Migration: Add AI Consulting Product
-- Run this after updating the schema

INSERT INTO products (
    id, 
    name, 
    description, 
    product_type, 
    price, 
    duration_days, 
    duration_hours, 
    max_capacity, 
    is_active
) VALUES (
    'ai-consulting',
    'AI Business Development',
    'Personalized AI consulting sessions to help develop and implement your business ideas. $200/hour with 2-hour minimum. Virtual sessions via Zoom, Monday-Friday 9 AM - 5 PM.',
    'HOURLY_CONSULTING',
    200.00,
    NULL,
    2,
    1,
    TRUE
); 