SELECT 
    id,
    created_at,
    EXTRACT(YEAR FROM AGE(NOW(), COALESCE(last_interest_update, created_at))) * 12 + EXTRACT(MONTH FROM AGE(NOW(), COALESCE(last_interest_update, created_at))) AS full_months_since_last_update,
    payment_left,
    payment_left + (payment_left * 0.05 * (EXTRACT(YEAR FROM AGE(NOW(), COALESCE(last_interest_update, created_at))) * 12 + EXTRACT(MONTH FROM AGE(NOW(), COALESCE(last_interest_update, created_at))))) AS payment_left_with_interest
FROM 
    "Credit" c  
WHERE 
    last_interest_update IS NULL
OR 
(
    EXTRACT(DAY FROM AGE(NOW(), COALESCE(last_interest_update, created_at))) = 0
AND
    EXTRACT(MONTH FROM AGE(NOW(), COALESCE(last_interest_update, created_at))) >= 1
);

