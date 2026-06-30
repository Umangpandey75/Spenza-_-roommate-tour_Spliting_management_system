-- Create tables for expense splitting app

-- Groups table
CREATE TABLE IF NOT EXISTS groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Participants table
CREATE TABLE IF NOT EXISTS participants (
  id TEXT PRIMARY KEY,
  group_id TEXT REFERENCES groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  weight DECIMAL NOT NULL DEFAULT 1.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  group_id TEXT REFERENCES groups(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  paid_by TEXT NOT NULL, -- participant id
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Expense splits table (many-to-many between expenses and participants)
CREATE TABLE IF NOT EXISTS expense_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id TEXT REFERENCES expenses(id) ON DELETE CASCADE,
  participant_id TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  weight DECIMAL NOT NULL DEFAULT 1.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'system',
  currency TEXT DEFAULT 'INR',
  notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Groups: Users can only access their own groups
CREATE POLICY "Users can view their own groups" ON groups
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own groups" ON groups
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own groups" ON groups
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own groups" ON groups
  FOR DELETE USING (auth.uid() = user_id);

-- Participants: Users can access participants of their groups
CREATE POLICY "Users can view participants of their groups" ON participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM groups 
      WHERE groups.id = participants.group_id 
      AND groups.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert participants to their groups" ON participants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM groups 
      WHERE groups.id = participants.group_id 
      AND groups.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update participants of their groups" ON participants
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM groups 
      WHERE groups.id = participants.group_id 
      AND groups.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete participants of their groups" ON participants
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM groups 
      WHERE groups.id = participants.group_id 
      AND groups.user_id = auth.uid()
    )
  );

-- Expenses: Users can access expenses of their groups
CREATE POLICY "Users can view expenses of their groups" ON expenses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM groups 
      WHERE groups.id = expenses.group_id 
      AND groups.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert expenses to their groups" ON expenses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM groups 
      WHERE groups.id = expenses.group_id 
      AND groups.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update expenses of their groups" ON expenses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM groups 
      WHERE groups.id = expenses.group_id 
      AND groups.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete expenses of their groups" ON expenses
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM groups 
      WHERE groups.id = expenses.group_id 
      AND groups.user_id = auth.uid()
    )
  );

-- Expense splits: Users can access splits of their group expenses
CREATE POLICY "Users can view expense splits of their groups" ON expense_splits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM expenses 
      JOIN groups ON groups.id = expenses.group_id
      WHERE expenses.id = expense_splits.expense_id 
      AND groups.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert expense splits to their groups" ON expense_splits
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM expenses 
      JOIN groups ON groups.id = expenses.group_id
      WHERE expenses.id = expense_splits.expense_id 
      AND groups.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update expense splits of their groups" ON expense_splits
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM expenses 
      JOIN groups ON groups.id = expenses.group_id
      WHERE expenses.id = expense_splits.expense_id 
      AND groups.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete expense splits of their groups" ON expense_splits
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM expenses 
      JOIN groups ON groups.id = expenses.group_id
      WHERE expenses.id = expense_splits.expense_id 
      AND groups.user_id = auth.uid()
    )
  );

-- User settings: Users can only access their own settings
CREATE POLICY "Users can view their own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings" ON user_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_groups_user_id ON groups(user_id);
CREATE INDEX IF NOT EXISTS idx_participants_group_id ON participants(group_id);
CREATE INDEX IF NOT EXISTS idx_expenses_group_id ON expenses(group_id);
CREATE INDEX IF NOT EXISTS idx_expense_splits_expense_id ON expense_splits(expense_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();