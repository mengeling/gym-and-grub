export interface Exercise {
  id: string;
  name: string;
  sets: Set[];
  notes?: string;
}

export interface Set {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
}

export interface Workout {
  id: string;
  date: string;
  name: string;
  exercises: Exercise[];
  duration?: number; // in minutes
}

export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  time: string; // ISO date string
}

export interface DailyCalories {
  date: string;
  meals: Meal[];
  targetCalories: number;
}

