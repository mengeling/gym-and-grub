import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Calculate 1RM (One Rep Max) using Epley formula: weight × (1 + reps / 30)
export function calculate1RM(weight: number, reps: number): number {
  if (reps === 0 || weight === 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 100) / 100;
}

// Calculate volume (total weight lifted: sets × reps × weight)
export function calculateVolume(sets: Array<{ reps: number; weight: number; completed: boolean }>): number {
  return sets
    .filter(set => set.completed)
    .reduce((total, set) => total + (set.reps * set.weight), 0);
}

// Calculate warm-up sets based on working weight
export function calculateWarmupSets(workingWeight: number, workingReps: number): Array<{ weight: number; reps: number }> {
  const warmupPercentages = [0.4, 0.5, 0.6, 0.7, 0.8];
  const warmupReps = [10, 8, 5, 3, 2];
  
  return warmupPercentages
    .map((percentage, index) => ({
      weight: Math.round((workingWeight * percentage) / 5) * 5, // Round to nearest 5
      reps: warmupReps[index] || 5,
    }))
    .filter((set, index) => {
      // Only include sets that are progressively heavier
      return index === 0 || set.weight > warmupPercentages[index - 1] * workingWeight - 5;
    });
}

// Common muscle groups
export const MUSCLE_GROUPS = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Legs",
  "Quadriceps",
  "Hamstrings",
  "Glutes",
  "Calves",
  "Abs",
  "Forearms",
  "Traps",
  "Lats",
] as const;

export type MuscleGroup = typeof MUSCLE_GROUPS[number];

