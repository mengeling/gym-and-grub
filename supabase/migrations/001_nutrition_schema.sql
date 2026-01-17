-- Nutrition tracking tables for calorie and meal logging

-- Food database table - stores nutritional information for foods
CREATE TABLE IF NOT EXISTS food_database (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255),
    serving_size VARCHAR(100) NOT NULL,
    serving_unit VARCHAR(50) NOT NULL,
    calories INTEGER NOT NULL,
    protein DECIMAL(10, 2) NOT NULL DEFAULT 0,
    carbs DECIMAL(10, 2) NOT NULL DEFAULT 0,
    fat DECIMAL(10, 2) NOT NULL DEFAULT 0,
    fiber DECIMAL(10, 2) DEFAULT 0,
    sugar DECIMAL(10, 2) DEFAULT 0,
    sodium INTEGER DEFAULT 0,
    category VARCHAR(100),
    barcode VARCHAR(50),
    is_verified BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_custom BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster food searches
CREATE INDEX IF NOT EXISTS idx_food_database_name ON food_database(name);
CREATE INDEX IF NOT EXISTS idx_food_database_category ON food_database(category);
CREATE INDEX IF NOT EXISTS idx_food_database_barcode ON food_database(barcode);
CREATE INDEX IF NOT EXISTS idx_food_database_created_by ON food_database(created_by);

-- Meals table - stores individual meal logs
CREATE TABLE IF NOT EXISTS meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    food_id UUID REFERENCES food_database(id) ON DELETE SET NULL,
    meal_name VARCHAR(255) NOT NULL,
    meal_type VARCHAR(50) NOT NULL DEFAULT 'snack', -- breakfast, lunch, dinner, snack
    serving_multiplier DECIMAL(10, 2) DEFAULT 1.0,
    calories INTEGER NOT NULL,
    protein DECIMAL(10, 2) NOT NULL DEFAULT 0,
    carbs DECIMAL(10, 2) NOT NULL DEFAULT 0,
    fat DECIMAL(10, 2) NOT NULL DEFAULT 0,
    fiber DECIMAL(10, 2) DEFAULT 0,
    sugar DECIMAL(10, 2) DEFAULT 0,
    sodium INTEGER DEFAULT 0,
    notes TEXT,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster meal queries
CREATE INDEX IF NOT EXISTS idx_meals_user_id ON meals(user_id);
CREATE INDEX IF NOT EXISTS idx_meals_logged_at ON meals(logged_at);
CREATE INDEX IF NOT EXISTS idx_meals_user_logged_at ON meals(user_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_meals_meal_type ON meals(meal_type);

-- Daily nutrition summary table - stores daily totals and goals
CREATE TABLE IF NOT EXISTS daily_nutrition (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    calorie_goal INTEGER NOT NULL DEFAULT 2000,
    protein_goal DECIMAL(10, 2) DEFAULT 150,
    carbs_goal DECIMAL(10, 2) DEFAULT 200,
    fat_goal DECIMAL(10, 2) DEFAULT 65,
    total_calories INTEGER DEFAULT 0,
    total_protein DECIMAL(10, 2) DEFAULT 0,
    total_carbs DECIMAL(10, 2) DEFAULT 0,
    total_fat DECIMAL(10, 2) DEFAULT 0,
    water_intake_ml INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Index for faster daily nutrition queries
CREATE INDEX IF NOT EXISTS idx_daily_nutrition_user_id ON daily_nutrition(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_nutrition_date ON daily_nutrition(date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_nutrition_user_date ON daily_nutrition(user_id, date DESC);

-- User nutrition preferences table
CREATE TABLE IF NOT EXISTS nutrition_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    daily_calorie_goal INTEGER DEFAULT 2000,
    daily_protein_goal DECIMAL(10, 2) DEFAULT 150,
    daily_carbs_goal DECIMAL(10, 2) DEFAULT 200,
    daily_fat_goal DECIMAL(10, 2) DEFAULT 65,
    daily_water_goal_ml INTEGER DEFAULT 2000,
    diet_type VARCHAR(50), -- vegan, vegetarian, keto, paleo, etc.
    allergies TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meal templates table - for quick logging of common meals
CREATE TABLE IF NOT EXISTS meal_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    meal_type VARCHAR(50) NOT NULL DEFAULT 'snack',
    total_calories INTEGER NOT NULL,
    total_protein DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_carbs DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_fat DECIMAL(10, 2) NOT NULL DEFAULT 0,
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Template meal items (foods in a template)
CREATE TABLE IF NOT EXISTS meal_template_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES meal_templates(id) ON DELETE CASCADE,
    food_id UUID REFERENCES food_database(id) ON DELETE SET NULL,
    food_name VARCHAR(255) NOT NULL,
    serving_multiplier DECIMAL(10, 2) DEFAULT 1.0,
    calories INTEGER NOT NULL,
    protein DECIMAL(10, 2) NOT NULL DEFAULT 0,
    carbs DECIMAL(10, 2) NOT NULL DEFAULT 0,
    fat DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE food_database ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_nutrition ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_template_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for food_database
-- Anyone can read verified/public foods
CREATE POLICY "Public foods are viewable by all authenticated users"
    ON food_database FOR SELECT
    USING (
        auth.role() = 'authenticated' AND
        (is_custom = false OR created_by = auth.uid())
    );

-- Users can insert their own custom foods
CREATE POLICY "Users can create custom foods"
    ON food_database FOR INSERT
    WITH CHECK (auth.uid() = created_by AND is_custom = true);

-- Users can update their own custom foods
CREATE POLICY "Users can update their own custom foods"
    ON food_database FOR UPDATE
    USING (auth.uid() = created_by AND is_custom = true);

-- Users can delete their own custom foods
CREATE POLICY "Users can delete their own custom foods"
    ON food_database FOR DELETE
    USING (auth.uid() = created_by AND is_custom = true);

-- RLS Policies for meals
CREATE POLICY "Users can view their own meals"
    ON meals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meals"
    ON meals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meals"
    ON meals FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meals"
    ON meals FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for daily_nutrition
CREATE POLICY "Users can view their own daily nutrition"
    ON daily_nutrition FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily nutrition"
    ON daily_nutrition FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily nutrition"
    ON daily_nutrition FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily nutrition"
    ON daily_nutrition FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for nutrition_preferences
CREATE POLICY "Users can view their own nutrition preferences"
    ON nutrition_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own nutrition preferences"
    ON nutrition_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own nutrition preferences"
    ON nutrition_preferences FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own nutrition preferences"
    ON nutrition_preferences FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for meal_templates
CREATE POLICY "Users can view their own meal templates"
    ON meal_templates FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meal templates"
    ON meal_templates FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal templates"
    ON meal_templates FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal templates"
    ON meal_templates FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for meal_template_items
CREATE POLICY "Users can view items in their own meal templates"
    ON meal_template_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM meal_templates
            WHERE meal_templates.id = meal_template_items.template_id
            AND meal_templates.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert items in their own meal templates"
    ON meal_template_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM meal_templates
            WHERE meal_templates.id = meal_template_items.template_id
            AND meal_templates.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update items in their own meal templates"
    ON meal_template_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM meal_templates
            WHERE meal_templates.id = meal_template_items.template_id
            AND meal_templates.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete items in their own meal templates"
    ON meal_template_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM meal_templates
            WHERE meal_templates.id = meal_template_items.template_id
            AND meal_templates.user_id = auth.uid()
        )
    );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at columns
CREATE TRIGGER update_food_database_updated_at BEFORE UPDATE ON food_database
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meals_updated_at BEFORE UPDATE ON meals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_nutrition_updated_at BEFORE UPDATE ON daily_nutrition
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nutrition_preferences_updated_at BEFORE UPDATE ON nutrition_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_templates_updated_at BEFORE UPDATE ON meal_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
