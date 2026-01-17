-- Populate food database with common foods and nutritional information
-- Similar to Nutritionix food database

-- Fruits
INSERT INTO food_database (name, brand, serving_size, serving_unit, calories, protein, carbs, fat, fiber, sugar, category, is_verified) VALUES
('Apple', NULL, '1', 'medium (182g)', 95, 0.5, 25, 0.3, 4.4, 19, 'Fruits', true),
('Banana', NULL, '1', 'medium (118g)', 105, 1.3, 27, 0.4, 3.1, 14, 'Fruits', true),
('Orange', NULL, '1', 'medium (131g)', 62, 1.2, 15, 0.2, 3.1, 12, 'Fruits', true),
('Strawberries', NULL, '1', 'cup (152g)', 49, 1.0, 12, 0.5, 3.0, 7.4, 'Fruits', true),
('Blueberries', NULL, '1', 'cup (148g)', 84, 1.1, 21, 0.5, 3.6, 15, 'Fruits', true),
('Grapes', NULL, '1', 'cup (151g)', 104, 1.1, 27, 0.2, 1.4, 23, 'Fruits', true),
('Watermelon', NULL, '1', 'cup diced (152g)', 46, 0.9, 12, 0.2, 0.6, 9.4, 'Fruits', true),
('Pineapple', NULL, '1', 'cup chunks (165g)', 82, 0.9, 22, 0.2, 2.3, 16, 'Fruits', true),
('Mango', NULL, '1', 'cup sliced (165g)', 99, 1.4, 25, 0.6, 2.6, 23, 'Fruits', true),
('Avocado', NULL, '1', 'medium (136g)', 227, 2.7, 12, 21, 9.2, 0.9, 'Fruits', true);

-- Vegetables
INSERT INTO food_database (name, brand, serving_size, serving_unit, calories, protein, carbs, fat, fiber, sugar, category, is_verified) VALUES
('Broccoli', NULL, '1', 'cup chopped (91g)', 31, 2.6, 6, 0.3, 2.4, 1.5, 'Vegetables', true),
('Carrots', NULL, '1', 'cup chopped (128g)', 52, 1.2, 12, 0.3, 3.6, 6.1, 'Vegetables', true),
('Spinach', NULL, '1', 'cup raw (30g)', 7, 0.9, 1.1, 0.1, 0.7, 0.1, 'Vegetables', true),
('Sweet Potato', NULL, '1', 'medium baked (114g)', 103, 2.3, 24, 0.2, 3.8, 7.4, 'Vegetables', true),
('Bell Pepper', NULL, '1', 'medium (119g)', 30, 1.0, 7, 0.3, 2.5, 4.2, 'Vegetables', true),
('Tomato', NULL, '1', 'medium (123g)', 22, 1.1, 4.8, 0.2, 1.5, 3.2, 'Vegetables', true),
('Cucumber', NULL, '1', 'cup sliced (104g)', 16, 0.7, 3.8, 0.1, 0.5, 1.9, 'Vegetables', true),
('Lettuce', NULL, '1', 'cup shredded (47g)', 7, 0.5, 1.3, 0.1, 0.6, 0.5, 'Vegetables', true),
('Cauliflower', NULL, '1', 'cup chopped (107g)', 27, 2.1, 5.3, 0.3, 2.1, 2.4, 'Vegetables', true),
('Asparagus', NULL, '1', 'cup (134g)', 27, 3.0, 5.2, 0.2, 2.8, 2.5, 'Vegetables', true);

-- Proteins
INSERT INTO food_database (name, brand, serving_size, serving_unit, calories, protein, carbs, fat, fiber, sugar, category, is_verified) VALUES
('Chicken Breast', NULL, '4', 'oz cooked (112g)', 187, 35, 0, 4, 0, 0, 'Protein', true),
('Ground Beef (93% lean)', NULL, '4', 'oz cooked (112g)', 199, 29, 0, 8.4, 0, 0, 'Protein', true),
('Salmon', NULL, '4', 'oz cooked (112g)', 233, 25, 0, 14, 0, 0, 'Protein', true),
('Eggs', NULL, '1', 'large (50g)', 72, 6.3, 0.4, 4.8, 0, 0.2, 'Protein', true),
('Greek Yogurt (non-fat)', 'Fage', '1', 'cup (227g)', 100, 18, 7, 0, 0, 7, 'Protein', true),
('Tuna', NULL, '1', 'can (142g)', 179, 39, 0, 1.3, 0, 0, 'Protein', true),
('Tofu', NULL, '4', 'oz (112g)', 86, 10, 2.3, 5.3, 1.9, 0.2, 'Protein', true),
('Turkey Breast', NULL, '4', 'oz cooked (112g)', 153, 30, 0, 3.2, 0, 0, 'Protein', true),
('Shrimp', NULL, '4', 'oz cooked (112g)', 112, 23, 0.9, 1.2, 0, 0, 'Protein', true),
('Pork Loin', NULL, '4', 'oz cooked (112g)', 206, 30, 0, 8.9, 0, 0, 'Protein', true);

-- Grains & Carbs
INSERT INTO food_database (name, brand, serving_size, serving_unit, calories, protein, carbs, fat, fiber, sugar, category, is_verified) VALUES
('White Rice', NULL, '1', 'cup cooked (158g)', 205, 4.2, 45, 0.4, 0.6, 0.1, 'Grains', true),
('Brown Rice', NULL, '1', 'cup cooked (195g)', 218, 4.5, 46, 1.6, 3.5, 0.7, 'Grains', true),
('Quinoa', NULL, '1', 'cup cooked (185g)', 222, 8.1, 39, 3.6, 5.2, 1.6, 'Grains', true),
('Oatmeal', NULL, '1', 'cup cooked (234g)', 166, 5.9, 28, 3.6, 4.0, 0.6, 'Grains', true),
('Whole Wheat Bread', NULL, '1', 'slice (28g)', 69, 3.6, 12, 0.9, 1.9, 1.4, 'Grains', true),
('Pasta (whole wheat)', NULL, '1', 'cup cooked (140g)', 174, 7.5, 37, 0.8, 6.3, 0.8, 'Grains', true),
('White Bread', NULL, '1', 'slice (25g)', 67, 1.9, 13, 0.8, 0.6, 1.4, 'Grains', true),
('Bagel', NULL, '1', 'medium (89g)', 245, 9.5, 48, 1.4, 1.9, 5.3, 'Grains', true),
('Tortilla (flour)', NULL, '1', 'medium (46g)', 144, 3.7, 24, 3.6, 1.4, 0.9, 'Grains', true),
('Sweet Potato Fries', NULL, '1', 'serving (85g)', 140, 1.8, 23, 4.5, 3.0, 0.8, 'Grains', true);

-- Dairy
INSERT INTO food_database (name, brand, serving_size, serving_unit, calories, protein, carbs, fat, fiber, sugar, category, is_verified) VALUES
('Milk (whole)', NULL, '1', 'cup (244g)', 149, 7.7, 12, 7.9, 0, 12, 'Dairy', true),
('Milk (2%)', NULL, '1', 'cup (244g)', 122, 8.1, 12, 4.8, 0, 12, 'Dairy', true),
('Milk (skim)', NULL, '1', 'cup (245g)', 83, 8.3, 12, 0.2, 0, 12, 'Dairy', true),
('Cheddar Cheese', NULL, '1', 'oz (28g)', 114, 7.0, 0.4, 9.4, 0, 0.2, 'Dairy', true),
('Mozzarella Cheese', NULL, '1', 'oz (28g)', 85, 6.3, 0.6, 6.3, 0, 0.2, 'Dairy', true),
('Cottage Cheese (low-fat)', NULL, '1', 'cup (226g)', 163, 28, 6.2, 2.3, 0, 6.2, 'Dairy', true),
('Yogurt (plain)', NULL, '1', 'cup (245g)', 149, 8.5, 11, 8.0, 0, 11, 'Dairy', true),
('Almond Milk (unsweetened)', NULL, '1', 'cup (240ml)', 30, 1.0, 1.0, 2.5, 1.0, 0, 'Dairy', true),
('Sour Cream', NULL, '2', 'tbsp (28g)', 60, 0.7, 1.2, 5.8, 0, 0.4, 'Dairy', true),
('Cream Cheese', NULL, '1', 'oz (28g)', 99, 1.7, 1.6, 9.9, 0, 0.8, 'Dairy', true);

-- Nuts & Seeds
INSERT INTO food_database (name, brand, serving_size, serving_unit, calories, protein, carbs, fat, fiber, sugar, category, is_verified) VALUES
('Almonds', NULL, '1', 'oz (28g)', 164, 6.0, 6.1, 14, 3.5, 1.2, 'Nuts & Seeds', true),
('Peanut Butter', NULL, '2', 'tbsp (32g)', 188, 8.0, 7.0, 16, 1.8, 3.0, 'Nuts & Seeds', true),
('Walnuts', NULL, '1', 'oz (28g)', 185, 4.3, 3.9, 18, 1.9, 0.7, 'Nuts & Seeds', true),
('Cashews', NULL, '1', 'oz (28g)', 157, 5.2, 8.6, 12, 0.9, 1.7, 'Nuts & Seeds', true),
('Chia Seeds', NULL, '1', 'oz (28g)', 138, 4.7, 12, 8.7, 9.8, 0, 'Nuts & Seeds', true),
('Sunflower Seeds', NULL, '1', 'oz (28g)', 164, 5.8, 6.8, 14, 2.4, 0.8, 'Nuts & Seeds', true),
('Pistachios', NULL, '1', 'oz (28g)', 159, 5.7, 7.7, 13, 3.0, 2.2, 'Nuts & Seeds', true),
('Peanuts', NULL, '1', 'oz (28g)', 161, 7.3, 4.6, 14, 2.4, 1.3, 'Nuts & Seeds', true),
('Flaxseeds', NULL, '1', 'tbsp (10g)', 55, 1.9, 3.0, 4.3, 2.8, 0.2, 'Nuts & Seeds', true),
('Almond Butter', NULL, '2', 'tbsp (32g)', 196, 6.7, 6.0, 18, 3.3, 2.0, 'Nuts & Seeds', true);

-- Snacks
INSERT INTO food_database (name, brand, serving_size, serving_unit, calories, protein, carbs, fat, fiber, sugar, category, is_verified) VALUES
('Protein Bar', 'Quest', '1', 'bar (60g)', 200, 21, 22, 8, 14, 1, 'Snacks', true),
('Granola Bar', 'Nature Valley', '1', 'bar (42g)', 190, 4.0, 29, 7.0, 2.0, 11, 'Snacks', true),
('Potato Chips', 'Lays', '1', 'oz (28g)', 152, 1.9, 15, 9.8, 1.4, 0.2, 'Snacks', true),
('Popcorn', 'SkinnyPop', '3.5', 'cups (28g)', 150, 2.0, 15, 10, 3.0, 0, 'Snacks', true),
('Dark Chocolate', NULL, '1', 'oz (28g)', 170, 2.2, 13, 12, 3.1, 6.8, 'Snacks', true),
('Pretzels', NULL, '1', 'oz (28g)', 108, 2.6, 23, 0.8, 0.9, 1.1, 'Snacks', true),
('Trail Mix', NULL, '1', 'oz (28g)', 131, 3.9, 13, 8.3, 1.9, 9.3, 'Snacks', true),
('Rice Cakes', NULL, '1', 'cake (9g)', 35, 0.7, 7.3, 0.3, 0.4, 0.1, 'Snacks', true),
('Hummus', 'Sabra', '2', 'tbsp (28g)', 70, 2.0, 4.0, 5.0, 1.0, 0, 'Snacks', true),
('Beef Jerky', 'Jack Links', '1', 'oz (28g)', 80, 13, 3.0, 1.5, 0, 3.0, 'Snacks', true);

-- Beverages
INSERT INTO food_database (name, brand, serving_size, serving_unit, calories, protein, carbs, fat, fiber, sugar, category, is_verified) VALUES
('Water', NULL, '1', 'cup (240ml)', 0, 0, 0, 0, 0, 0, 'Beverages', true),
('Coffee (black)', NULL, '1', 'cup (240ml)', 2, 0.3, 0, 0, 0, 0, 'Beverages', true),
('Green Tea', NULL, '1', 'cup (240ml)', 2, 0.5, 0, 0, 0, 0, 'Beverages', true),
('Orange Juice', NULL, '1', 'cup (248ml)', 112, 1.7, 26, 0.5, 0.5, 21, 'Beverages', true),
('Apple Juice', NULL, '1', 'cup (248ml)', 114, 0.2, 28, 0.3, 0.2, 24, 'Beverages', true),
('Coca-Cola', 'Coca-Cola', '12', 'fl oz (355ml)', 140, 0, 39, 0, 0, 39, 'Beverages', true),
('Gatorade', 'Gatorade', '12', 'fl oz (355ml)', 80, 0, 21, 0, 0, 21, 'Beverages', true),
('Protein Shake', 'Muscle Milk', '11', 'fl oz (325ml)', 160, 25, 9, 4.5, 0, 5, 'Beverages', true),
('Beer (regular)', NULL, '12', 'fl oz (355ml)', 153, 1.6, 13, 0, 0, 0, 'Beverages', true),
('Wine (red)', NULL, '5', 'fl oz (147ml)', 125, 0.1, 3.8, 0, 0, 0.9, 'Beverages', true);

-- Fast Food
INSERT INTO food_database (name, brand, serving_size, serving_unit, calories, protein, carbs, fat, fiber, sugar, category, is_verified) VALUES
('Big Mac', 'McDonald''s', '1', 'sandwich (219g)', 563, 25, 46, 33, 3.0, 9, 'Fast Food', true),
('Whopper', 'Burger King', '1', 'sandwich (290g)', 657, 28, 49, 40, 2.0, 11, 'Fast Food', true),
('Chicken Nuggets', 'McDonald''s', '6', 'pieces (100g)', 287, 13, 18, 18, 1.2, 0, 'Fast Food', true),
('Large Fries', 'McDonald''s', '1', 'serving (154g)', 510, 6, 66, 24, 6.0, 0, 'Fast Food', true),
('Pepperoni Pizza', 'Domino''s', '1', 'slice (108g)', 298, 11, 34, 12, 2.0, 3.5, 'Fast Food', true),
('Cheese Pizza', 'Pizza Hut', '1', 'slice (107g)', 280, 12, 30, 12, 2.0, 3.0, 'Fast Food', true),
('Burrito Bowl', 'Chipotle', '1', 'bowl (600g)', 665, 32, 67, 28, 15, 4, 'Fast Food', true),
('Subway 6-inch Turkey', 'Subway', '1', 'sandwich (238g)', 280, 18, 46, 3.5, 5.0, 7, 'Fast Food', true),
('Taco', 'Taco Bell', '1', 'taco (78g)', 170, 8, 13, 9, 3.0, 1, 'Fast Food', true),
('Chick-fil-A Sandwich', 'Chick-fil-A', '1', 'sandwich (170g)', 440, 28, 41, 19, 1.0, 5, 'Fast Food', true);

-- Condiments & Oils
INSERT INTO food_database (name, brand, serving_size, serving_unit, calories, protein, carbs, fat, fiber, sugar, category, is_verified) VALUES
('Olive Oil', NULL, '1', 'tbsp (14g)', 119, 0, 0, 14, 0, 0, 'Oils & Condiments', true),
('Butter', NULL, '1', 'tbsp (14g)', 102, 0.1, 0, 12, 0, 0, 'Oils & Condiments', true),
('Mayo', 'Hellmann''s', '1', 'tbsp (14g)', 94, 0.1, 0.1, 10, 0, 0.1, 'Oils & Condiments', true),
('Ketchup', 'Heinz', '1', 'tbsp (17g)', 17, 0.2, 4.7, 0, 0.1, 3.7, 'Oils & Condiments', true),
('Mustard', NULL, '1', 'tsp (5g)', 3, 0.2, 0.3, 0.2, 0.2, 0.1, 'Oils & Condiments', true),
('Ranch Dressing', 'Hidden Valley', '2', 'tbsp (30g)', 140, 0, 2, 14, 0, 1, 'Oils & Condiments', true),
('BBQ Sauce', NULL, '2', 'tbsp (34g)', 58, 0.3, 14, 0.2, 0.3, 10, 'Oils & Condiments', true),
('Soy Sauce', NULL, '1', 'tbsp (18g)', 11, 1.0, 1.0, 0, 0.1, 0.4, 'Oils & Condiments', true),
('Hot Sauce', 'Tabasco', '1', 'tsp (5g)', 1, 0, 0, 0, 0, 0, 'Oils & Condiments', true),
('Honey', NULL, '1', 'tbsp (21g)', 64, 0.1, 17, 0, 0, 17, 'Oils & Condiments', true);
