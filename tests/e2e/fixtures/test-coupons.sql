-- Test Coupon Codes for End-to-End Testing
-- These coupons provide 100% discount for testing purposes (no charges)

-- Insert 100% discount coupon for E2E testing
INSERT INTO coupons (
    code, 
    description, 
    discount_percentage, 
    usage_limit, 
    times_used, 
    expires_at, 
    is_active
) VALUES (
    'E2E_TEST_100',
    '100% discount for end-to-end testing - DO NOT USE IN PRODUCTION',
    100.00,
    1000,  -- High usage limit for testing
    0,
    datetime('now', '+1 year'),  -- Valid for 1 year
    1  -- Active
);

-- Insert 50% discount coupon for testing edge cases
INSERT INTO coupons (
    code, 
    description, 
    discount_percentage, 
    usage_limit, 
    times_used, 
    expires_at, 
    is_active
) VALUES (
    'E2E_TEST_50',
    '50% discount for end-to-end testing - DO NOT USE IN PRODUCTION',
    50.00,
    100,
    0,
    datetime('now', '+1 year'),
    1
);

-- Insert expired coupon for testing error handling
INSERT INTO coupons (
    code, 
    description, 
    discount_percentage, 
    usage_limit, 
    times_used, 
    expires_at, 
    is_active
) VALUES (
    'E2E_TEST_EXPIRED',
    'Expired coupon for testing error handling',
    25.00,
    10,
    0,
    datetime('now', '-1 day'),  -- Expired yesterday
    1
);

-- Insert inactive coupon for testing
INSERT OR REPLACE INTO coupons (
    code, 
    description, 
    discount_percentage, 
    usage_limit, 
    times_used, 
    expires_at, 
    is_active
) VALUES (
    'E2E_TEST_INACTIVE',
    'Inactive coupon for testing error handling',
    75.00,
    10,
    0,
    datetime('now', '+1 month'),
    0  -- Inactive
);

-- Verify the test coupons were created
SELECT 'Test coupons created:' as message;
SELECT 
    code,
    description,
    discount_percentage,
    usage_limit,
    expires_at,
    is_active
FROM coupons 
WHERE code LIKE 'E2E_TEST_%'
ORDER BY code; 