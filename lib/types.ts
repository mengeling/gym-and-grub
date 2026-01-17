export interface Exercise {
  id: string;
  name: string;
  sets: Set[];
  notes?: string;
  muscleGroups?: string[];
  supersetGroup?: number;
  exerciseOrder?: number;
}

export interface Set {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
  rpe?: number; // Rate of Perceived Exertion (0-10)
  restSeconds?: number; // Rest time in seconds
}

export interface Workout {
  id: string;
  date: string;
  name: string;
  exercises: Exercise[];
  duration?: number; // in minutes
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  notes?: string;
  exercises: TemplateExercise[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TemplateExercise {
  id: string;
  name: string;
  muscleGroups?: string[];
  supersetGroup?: number;
  exerciseOrder?: number;
  defaultSets?: number;
  defaultReps?: number;
  defaultWeight?: number;
  notes?: string;
}

export interface BodyMeasurement {
  id: string;
  date: string;
  weight?: number; // in lbs or kg
  bodyFatPercentage?: number; // percentage
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
    calves?: number;
    [key: string]: number | undefined;
  };
  notes?: string;
}

export interface ExerciseDatabase {
  id: string;
  name: string;
  category: string;
  muscleGroups: string[];
  equipment?: string;
  instructions?: string;
}

// Nutrition Types
export interface FoodDatabase {
  id: string;
  name: string;
  brand?: string;
  serving_size: string;
  serving_unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  category?: string;
  barcode?: string;
  is_verified: boolean;
  created_by?: string;
  is_custom: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Meal {
  id: string;
  user_id: string;
  food_id?: string;
  meal_name: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  serving_multiplier: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  notes?: string;
  logged_at: string;
  created_at?: string;
  updated_at?: string;
}

export interface DailyNutrition {
  id: string;
  user_id: string;
  date: string;
  calorie_goal: number;
  protein_goal: number;
  carbs_goal: number;
  fat_goal: number;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  water_intake_ml: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface NutritionPreferences {
  id: string;
  user_id: string;
  daily_calorie_goal: number;
  daily_protein_goal: number;
  daily_carbs_goal: number;
  daily_fat_goal: number;
  daily_water_goal_ml: number;
  diet_type?: string;
  allergies?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface MealTemplate {
  id: string;
  user_id: string;
  name: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  is_favorite: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MealTemplateItem {
  id: string;
  template_id: string;
  food_id?: string;
  food_name: string;
  serving_multiplier: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  created_at?: string;
}

// Legacy interface for backwards compatibility
export interface DailyCalories {
  date: string;
  meals: Meal[];
  targetCalories: number;
}

