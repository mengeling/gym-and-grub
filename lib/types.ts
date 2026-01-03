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

