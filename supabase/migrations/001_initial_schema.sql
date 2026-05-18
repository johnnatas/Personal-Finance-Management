-- =====================================================
-- SCFP - Sistema de Controle Financeiro Pessoal
-- Migration: 001_initial_schema
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- FUNÇÃO AUXILIAR: updated_at automático
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TABELA: users_profiles
-- =====================================================
CREATE TABLE public.users_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  currency TEXT NOT NULL DEFAULT 'BRL',
  locale TEXT NOT NULL DEFAULT 'pt-BR',
  timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  theme TEXT CHECK (theme IN ('light', 'dark', 'auto')) DEFAULT 'auto',
  enable_notifications BOOLEAN DEFAULT true,
  enable_email_alerts BOOLEAN DEFAULT true,
  enable_budget_alerts BOOLEAN DEFAULT true,
  alert_threshold INTEGER DEFAULT 80,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER users_profiles_updated_at
  BEFORE UPDATE ON users_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- TABELA: accounts
-- =====================================================
CREATE TABLE public.accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('checking_account', 'savings_account', 'credit_card', 'investment', 'cash', 'other')),
  initial_balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
  current_balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BRL',
  institution TEXT,
  account_number TEXT,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  icon TEXT DEFAULT 'wallet',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT positive_initial_balance CHECK (initial_balance >= 0)
);

CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_user_active ON accounts(user_id, is_active);

CREATE TRIGGER accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- TABELA: categories
-- =====================================================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'both')),
  color TEXT NOT NULL DEFAULT '#10B981',
  icon TEXT NOT NULL DEFAULT 'tag',
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_type ON categories(type);
CREATE INDEX idx_categories_parent ON categories(parent_id);

CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- TABELA: recurrences
-- =====================================================
CREATE TABLE public.recurrences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  interval INTEGER NOT NULL DEFAULT 1,
  start_date DATE NOT NULL,
  end_date DATE,
  next_occurrence DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  template_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recurrences_user_id ON recurrences(user_id);
CREATE INDEX idx_recurrences_next_occurrence ON recurrences(next_occurrence) WHERE is_active = true;

CREATE TRIGGER recurrences_updated_at
  BEFORE UPDATE ON recurrences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- TABELA: transactions
-- =====================================================
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  amount NUMERIC(15, 2) NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('cash', 'debit_card', 'credit_card', 'bank_transfer', 'pix', 'boleto', 'other')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'completed',
  is_recurrent BOOLEAN DEFAULT false,
  recurrence_id UUID REFERENCES recurrences(id) ON DELETE SET NULL,
  destination_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  transfer_id UUID,
  installments INTEGER,
  current_installment INTEGER,
  tags TEXT[],
  notes TEXT,
  metadata JSONB,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT positive_amount CHECK (amount > 0),
  CONSTRAINT valid_installment CHECK (
    (installments IS NULL AND current_installment IS NULL) OR
    (installments > 0 AND current_installment > 0 AND current_installment <= installments)
  )
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_type_status ON transactions(type, status);
CREATE INDEX idx_transactions_deleted ON transactions(deleted_at) WHERE deleted_at IS NULL;

CREATE TRIGGER transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- TABELA: attachments
-- =====================================================
CREATE TABLE public.attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_attachments_transaction_id ON attachments(transaction_id);

-- =====================================================
-- TABELA: budgets
-- =====================================================
CREATE TABLE public.budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL,
  spent NUMERIC(15, 2) DEFAULT 0,
  period TEXT NOT NULL CHECK (period IN ('weekly', 'monthly', 'quarterly', 'yearly', 'custom')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  alert_threshold INTEGER DEFAULT 80,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT positive_amount CHECK (amount > 0),
  CONSTRAINT valid_dates CHECK (end_date > start_date),
  CONSTRAINT valid_threshold CHECK (alert_threshold >= 0 AND alert_threshold <= 150)
);

CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_category_id ON budgets(category_id);
CREATE INDEX idx_budgets_period ON budgets(period, start_date, end_date);

CREATE TRIGGER budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- TABELA: goals
-- =====================================================
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  target_amount NUMERIC(15, 2) NOT NULL,
  current_amount NUMERIC(15, 2) DEFAULT 0,
  deadline DATE,
  status TEXT NOT NULL CHECK (status IN ('in_progress', 'achieved', 'cancelled')) DEFAULT 'in_progress',
  type TEXT NOT NULL CHECK (type IN ('savings', 'debt_payment', 'purchase', 'emergency_fund', 'other')),
  linked_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT positive_target CHECK (target_amount > 0),
  CONSTRAINT valid_current CHECK (current_amount >= 0)
);

CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(status);

CREATE TRIGGER goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- TABELA: investments
-- =====================================================
CREATE TABLE public.investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('stocks', 'fiis', 'fixed_income', 'crypto', 'funds', 'pension', 'other')),
  purchase_value NUMERIC(15, 2) NOT NULL,
  current_value NUMERIC(15, 2) NOT NULL,
  quantity NUMERIC(15, 4) NOT NULL,
  purchase_date DATE NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  institution TEXT,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT positive_values CHECK (purchase_value > 0 AND current_value >= 0 AND quantity > 0)
);

CREATE INDEX idx_investments_user_id ON investments(user_id);
CREATE INDEX idx_investments_type ON investments(type);

CREATE TRIGGER investments_updated_at
  BEFORE UPDATE ON investments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- TABELA: alerts
-- =====================================================
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('budget_exceeded', 'bill_due', 'goal_achieved', 'low_balance', 'unusual_transaction', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_user_read ON alerts(user_id, is_read);
CREATE INDEX idx_alerts_created ON alerts(created_at DESC);

-- =====================================================
-- TABELA: activity_logs
-- =====================================================
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);

-- =====================================================
-- VIEWS
-- =====================================================
CREATE OR REPLACE VIEW transactions_detailed AS
SELECT
  t.id, t.user_id, t.type, t.amount, t.description, t.date, t.status,
  a.name AS account_name, a.type AS account_type, a.color AS account_color,
  c.name AS category_name, c.color AS category_color, c.icon AS category_icon,
  t.payment_method, t.is_recurrent, t.tags, t.notes,
  t.created_at, t.updated_at
FROM transactions t
LEFT JOIN accounts a ON t.account_id = a.id
LEFT JOIN categories c ON t.category_id = c.id
WHERE t.deleted_at IS NULL;

-- =====================================================
-- TRIGGERS DE NEGÓCIO: Atualizar saldo da conta
-- =====================================================
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.status = 'completed') OR
     (TG_OP = 'UPDATE' AND NEW.status = 'completed' AND OLD.status != 'completed') THEN
    IF NEW.type = 'income' THEN
      UPDATE accounts SET current_balance = current_balance + NEW.amount WHERE id = NEW.account_id;
    ELSIF NEW.type = 'expense' THEN
      UPDATE accounts SET current_balance = current_balance - NEW.amount WHERE id = NEW.account_id;
    ELSIF NEW.type = 'transfer' THEN
      UPDATE accounts SET current_balance = current_balance - NEW.amount WHERE id = NEW.account_id;
      UPDATE accounts SET current_balance = current_balance + NEW.amount WHERE id = NEW.destination_account_id;
    END IF;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status = 'completed' AND NEW.status = 'cancelled' THEN
    IF OLD.type = 'income' THEN
      UPDATE accounts SET current_balance = current_balance - OLD.amount WHERE id = OLD.account_id;
    ELSIF OLD.type = 'expense' THEN
      UPDATE accounts SET current_balance = current_balance + OLD.amount WHERE id = OLD.account_id;
    ELSIF OLD.type = 'transfer' THEN
      UPDATE accounts SET current_balance = current_balance + OLD.amount WHERE id = OLD.account_id;
      UPDATE accounts SET current_balance = current_balance - OLD.amount WHERE id = OLD.destination_account_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transactions_update_balance
  AFTER INSERT OR UPDATE ON transactions
  FOR EACH ROW
  WHEN (NEW.deleted_at IS NULL)
  EXECUTE FUNCTION update_account_balance();

-- =====================================================
-- TRIGGER: Atualizar gasto do orçamento
-- =====================================================
CREATE OR REPLACE FUNCTION update_budget_spent()
RETURNS TRIGGER AS $$
DECLARE v_budget_id UUID;
BEGIN
  SELECT id INTO v_budget_id FROM budgets
  WHERE user_id = NEW.user_id AND category_id = NEW.category_id
    AND NEW.date BETWEEN start_date AND end_date AND is_active = true
  LIMIT 1;

  IF v_budget_id IS NOT NULL THEN
    UPDATE budgets SET spent = (
      SELECT COALESCE(SUM(amount), 0) FROM transactions
      WHERE user_id = budgets.user_id AND category_id = budgets.category_id
        AND date BETWEEN budgets.start_date AND budgets.end_date
        AND type = 'expense' AND status = 'completed' AND deleted_at IS NULL
    ) WHERE id = v_budget_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transactions_update_budget
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_budget_spent();

-- =====================================================
-- TRIGGER: Alerta de orçamento excedido
-- =====================================================
CREATE OR REPLACE FUNCTION check_budget_alert()
RETURNS TRIGGER AS $$
DECLARE
  v_percentage NUMERIC;
  v_category_name TEXT;
BEGIN
  v_percentage := (NEW.spent / NULLIF(NEW.amount, 0)) * 100;

  IF v_percentage >= NEW.alert_threshold AND v_percentage < (NEW.alert_threshold + 5) THEN
    SELECT name INTO v_category_name FROM categories WHERE id = NEW.category_id;
    INSERT INTO alerts (user_id, type, title, message, priority)
    VALUES (
      NEW.user_id, 'budget_exceeded', 'Atenção ao Orçamento',
      format('Você já gastou %.0f%% do orçamento de %s', v_percentage, v_category_name),
      CASE WHEN v_percentage >= 100 THEN 'urgent' WHEN v_percentage >= 80 THEN 'high' ELSE 'medium' END
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER budgets_check_alert
  AFTER UPDATE OF spent ON budgets
  FOR EACH ROW WHEN (NEW.is_active = true)
  EXECUTE FUNCTION check_budget_alert();

-- =====================================================
-- TRIGGER: Criar perfil e categorias ao criar usuário
-- =====================================================
CREATE OR REPLACE FUNCTION create_default_categories_for_user(p_user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO categories (user_id, name, type, color, icon, is_default) VALUES
    (p_user_id, 'Alimentação',   'expense', '#EF4444', 'utensils',       true),
    (p_user_id, 'Transporte',    'expense', '#F59E0B', 'car',            true),
    (p_user_id, 'Moradia',       'expense', '#8B5CF6', 'home',           true),
    (p_user_id, 'Saúde',         'expense', '#EC4899', 'heart',          true),
    (p_user_id, 'Educação',      'expense', '#3B82F6', 'book',           true),
    (p_user_id, 'Lazer',         'expense', '#10B981', 'smile',          true),
    (p_user_id, 'Vestuário',     'expense', '#6366F1', 'shirt',          true),
    (p_user_id, 'Serviços',      'expense', '#F97316', 'briefcase',      true),
    (p_user_id, 'Impostos',      'expense', '#DC2626', 'file-text',      true),
    (p_user_id, 'Outros',        'expense', '#6B7280', 'more-horizontal',true),
    (p_user_id, 'Salário',       'income',  '#10B981', 'dollar-sign',    true),
    (p_user_id, 'Freelance',     'income',  '#3B82F6', 'briefcase',      true),
    (p_user_id, 'Investimentos', 'income',  '#8B5CF6', 'trending-up',    true),
    (p_user_id, 'Outros',        'income',  '#6B7280', 'more-horizontal',true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users_profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
  PERFORM create_default_categories_for_user(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
