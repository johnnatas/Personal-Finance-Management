-- =====================================================
-- SCFP - Fix transactions_detailed view
-- Migration: 004_fix_transactions_view
--
-- Fixes two issues:
-- 1. Security: view was missing user_id filter, allowing cross-user data access
-- 2. Missing columns: account_id, category_id, destination_account_id needed for edit
-- =====================================================

CREATE OR REPLACE VIEW transactions_detailed AS
SELECT
  t.id,
  t.user_id,
  t.type,
  t.amount,
  t.description,
  t.date,
  t.status,
  t.account_id,
  t.category_id,
  t.destination_account_id,
  a.name  AS account_name,
  a.type  AS account_type,
  a.color AS account_color,
  c.name  AS category_name,
  c.color AS category_color,
  c.icon  AS category_icon,
  t.payment_method,
  t.is_recurrent,
  t.tags,
  t.notes,
  t.created_at,
  t.updated_at
FROM transactions t
LEFT JOIN accounts   a ON t.account_id  = a.id
LEFT JOIN categories c ON t.category_id = c.id
WHERE t.deleted_at IS NULL
  AND t.user_id = auth.uid();
