-- =====================================================
-- SCFP - Row Level Security Policies
-- Migration: 002_rls_policies
-- =====================================================

-- users_profiles
ALTER TABLE users_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile"   ON users_profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users_profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- accounts
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own accounts"   ON accounts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own accounts" ON accounts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own accounts" ON accounts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own accounts" ON accounts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own categories"   ON categories FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own categories" ON categories FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories" ON categories FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON categories FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- recurrences
ALTER TABLE recurrences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own recurrences"   ON recurrences FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own recurrences" ON recurrences FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recurrences" ON recurrences FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own recurrences" ON recurrences FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own transactions" ON transactions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM accounts WHERE id = account_id AND user_id = auth.uid()));
CREATE POLICY "Users can update own transactions" ON transactions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- attachments
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own attachments" ON attachments FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM transactions WHERE transactions.id = attachments.transaction_id AND transactions.user_id = auth.uid()));
CREATE POLICY "Users can create attachments for own transactions" ON attachments FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM transactions WHERE transactions.id = attachments.transaction_id AND transactions.user_id = auth.uid()));
CREATE POLICY "Users can delete own attachments" ON attachments FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM transactions WHERE transactions.id = attachments.transaction_id AND transactions.user_id = auth.uid()));

-- budgets
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own budgets"   ON budgets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own budgets" ON budgets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own budgets" ON budgets FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own budgets" ON budgets FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- goals
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own goals"   ON goals FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own goals" ON goals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON goals FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON goals FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- investments
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own investments"   ON investments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own investments" ON investments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own investments" ON investments FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own investments" ON investments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- alerts
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own alerts"    ON alerts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own alerts"  ON alerts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own alerts"  ON alerts FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Service role can create alerts" ON alerts FOR INSERT TO service_role WITH CHECK (true);

-- activity_logs
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own activity logs"        ON activity_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Service role can insert activity logs"   ON activity_logs FOR INSERT TO service_role WITH CHECK (true);

-- =====================================================
-- STORAGE POLICIES
-- =====================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('transaction-attachments', 'transaction-attachments', false)
ON CONFLICT DO NOTHING;

CREATE POLICY "Users can upload own attachments" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'transaction-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own attachments storage" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'transaction-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own attachments storage" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'transaction-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);
