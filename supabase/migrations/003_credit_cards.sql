-- =====================================================
-- SCFP - Cartões de Crédito
-- Migration: 003_credit_cards
-- =====================================================

CREATE TABLE public.credit_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  linked_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  flag TEXT NOT NULL DEFAULT 'other' CHECK (flag IN ('visa', 'mastercard', 'elo', 'amex', 'hipercard', 'other')),
  last_four TEXT CHECK (last_four ~ '^[0-9]{4}$'),
  credit_limit NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (credit_limit >= 0),
  current_bill NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (current_bill >= 0),
  closing_day INTEGER NOT NULL DEFAULT 1 CHECK (closing_day >= 1 AND closing_day <= 28),
  due_day INTEGER NOT NULL DEFAULT 10 CHECK (due_day >= 1 AND due_day <= 28),
  color TEXT NOT NULL DEFAULT '#8B5CF6',
  institution TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_credit_cards_user_id ON credit_cards(user_id);

CREATE TRIGGER credit_cards_updated_at
  BEFORE UPDATE ON credit_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own credit cards"   ON credit_cards FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own credit cards" ON credit_cards FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own credit cards" ON credit_cards FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own credit cards" ON credit_cards FOR DELETE TO authenticated USING (auth.uid() = user_id);
