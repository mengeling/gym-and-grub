"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Edit, Save, X, Loader2, Timer, TrendingUp, Download, Calculator, BarChart3, Clock, Gauge, Copy, FileText, Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import type { Workout, Exercise, Set, WorkoutTemplate, TemplateExercise, BodyMeasurement, ExerciseDatabase } from "@/lib/types";
import { calculate1RM, calculateVolume, calculateWarmupSets, MUSCLE_GROUPS } from "@/lib/utils";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export function GymLogbook() {
  const { user } = useAuth();
  const supabase = createClient();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);
  const [newExercise, setNewExercise] = useState({ name: "", sets: 3, reps: 10, weight: 0, muscleGroups: [] as string[], supersetGroup: undefined as number | undefined });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("workouts");
  const [workoutTemplates, setWorkoutTemplates] = useState<WorkoutTemplate[]>([]);
  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurement[]>([]);
  const [activeTimers, setActiveTimers] = useState<Record<string, { seconds: number; interval: NodeJS.Timeout | null }>>({});
  const [showWarmupCalculator, setShowWarmupCalculator] = useState<string | null>(null);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateNotes, setTemplateNotes] = useState("");
  const [isNewTemplateDialogOpen, setIsNewTemplateDialogOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<WorkoutTemplate | null>(null);
  const [newTemplateExercise, setNewTemplateExercise] = useState({ name: "", sets: 3, reps: 10, weight: 0, muscleGroups: [] as string[], supersetGroup: undefined as number | undefined });
  const [exerciseDatabase, setExerciseDatabase] = useState<ExerciseDatabase[]>([]);
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState("");
  const [exerciseSearchQueryTemplate, setExerciseSearchQueryTemplate] = useState("");
  const [showExerciseDropdown, setShowExerciseDropdown] = useState(false);
  const [showExerciseDropdownTemplate, setShowExerciseDropdownTemplate] = useState(false);
  const [exerciseSearchFilter, setExerciseSearchFilter] = useState("");
  const [exerciseCategoryFilter, setExerciseCategoryFilter] = useState<string>("all");

  // Load workouts and templates from Supabase
  useEffect(() => {
    if (user) {
      loadWorkouts();
      loadTemplates();
      loadExerciseDatabase();
    }
  }, [user]);

  const loadExerciseDatabase = async () => {
    try {
      const { data, error } = await supabase
        .from("exercise_database")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setExerciseDatabase(data || []);
    } catch (error) {
      console.error("Error loading exercise database:", error);
    }
  };

  const filteredExercises = exerciseDatabase.filter((ex) =>
    ex.name.toLowerCase().includes(exerciseSearchQuery.toLowerCase()) ||
    ex.category.toLowerCase().includes(exerciseSearchQuery.toLowerCase()) ||
    (ex.muscleGroups || []).some((mg) => mg.toLowerCase().includes(exerciseSearchQuery.toLowerCase()))
  ).slice(0, 10);

  const filteredExercisesTemplate = exerciseDatabase.filter((ex) =>
    ex.name.toLowerCase().includes(exerciseSearchQueryTemplate.toLowerCase()) ||
    ex.category.toLowerCase().includes(exerciseSearchQueryTemplate.toLowerCase()) ||
    (ex.muscleGroups || []).some((mg) => mg.toLowerCase().includes(exerciseSearchQueryTemplate.toLowerCase()))
  ).slice(0, 10);

  const selectExerciseFromDatabase = (exercise: ExerciseDatabase) => {
    setNewExercise({
      name: exercise.name,
      sets: 3,
      reps: 10,
      weight: 0,
      muscleGroups: exercise.muscleGroups || [],
      supersetGroup: undefined,
    });
    setExerciseSearchQuery("");
    setShowExerciseDropdown(false);
  };

  const selectExerciseFromDatabaseTemplate = (exercise: ExerciseDatabase) => {
    setNewTemplateExercise({
      name: exercise.name,
      sets: 3,
      reps: 10,
      weight: 0,
      muscleGroups: exercise.muscleGroups || [],
      supersetGroup: undefined,
    });
    setExerciseSearchQueryTemplate("");
    setShowExerciseDropdownTemplate(false);
  };

  const loadWorkouts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      // Fetch workouts with exercises and sets (including new fields)
      const { data: workoutsData, error: workoutsError } = await supabase
        .from("workouts")
        .select(`
          id,
          name,
          date,
          duration,
          exercises (
            id,
            name,
            notes,
            muscle_groups,
            superset_group,
            exercise_order,
            sets (
              id,
              reps,
              weight,
              completed,
              rpe,
              rest_seconds
            )
          )
        `)
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (workoutsError) throw workoutsError;

      // Transform Supabase data to our Workout type
      const transformedWorkouts: Workout[] = (workoutsData || []).map((w: any) => ({
        id: w.id,
        name: w.name,
        date: w.date,
        duration: w.duration,
        exercises: (w.exercises || []).sort((a: any, b: any) => (a.exercise_order || 0) - (b.exercise_order || 0)).map((ex: any) => ({
          id: ex.id,
          name: ex.name,
          notes: ex.notes,
          muscleGroups: ex.muscle_groups || [],
          supersetGroup: ex.superset_group,
          exerciseOrder: ex.exercise_order || 0,
          sets: (ex.sets || []).map((s: any) => ({
            id: s.id,
            reps: s.reps,
            weight: parseFloat(s.weight),
            completed: s.completed,
            rpe: s.rpe ? parseFloat(s.rpe) : undefined,
            restSeconds: s.rest_seconds || undefined,
          })),
        })),
      }));

      setWorkouts(transformedWorkouts);
    } catch (error) {
      console.error("Error loading workouts:", error);
    } finally {
      setLoading(false);
    }
  };

  const createWorkout = () => {
    const workout: Workout = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      name: `Workout ${workouts.length + 1}`,
      exercises: [],
    };
    setCurrentWorkout(workout);
    setEditingWorkoutId(null);
    setIsDialogOpen(true);
  };

  const editWorkout = (workout: Workout) => {
    setCurrentWorkout({ ...workout });
    setEditingWorkoutId(workout.id);
    setIsDialogOpen(true);
  };

  const saveWorkout = async () => {
    if (!currentWorkout || !user) return;

    try {
      setSaving(true);

      if (editingWorkoutId) {
        // Update existing workout
        await updateWorkoutInDb(currentWorkout);
      } else {
        // Create new workout
        await createWorkoutInDb(currentWorkout);
      }

      // Reload workouts from database
      await loadWorkouts();
      
      setCurrentWorkout(null);
      setEditingWorkoutId(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving workout:", error);
      alert("Failed to save workout. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const createWorkoutInDb = async (workout: Workout) => {
    // Create workout
    const { data: workoutData, error: workoutError } = await supabase
      .from("workouts")
      .insert({
        id: workout.id,
        user_id: user!.id,
        name: workout.name,
        date: workout.date,
        duration: workout.duration,
      })
      .select()
      .single();

    if (workoutError) throw workoutError;

      // Create exercises and sets
      for (let i = 0; i < workout.exercises.length; i++) {
        const exercise = workout.exercises[i];
        const { data: exerciseData, error: exerciseError } = await supabase
          .from("exercises")
          .insert({
            id: exercise.id,
            workout_id: workout.id,
            name: exercise.name,
            notes: exercise.notes,
            muscle_groups: exercise.muscleGroups || [],
            superset_group: exercise.supersetGroup,
            exercise_order: exercise.exerciseOrder !== undefined ? exercise.exerciseOrder : i,
          })
          .select()
          .single();

        if (exerciseError) throw exerciseError;

        // Create sets
        if (exercise.sets.length > 0) {
          const setsToInsert = exercise.sets.map((set) => ({
            id: set.id,
            exercise_id: exercise.id,
            reps: set.reps,
            weight: set.weight,
            completed: set.completed,
            rpe: set.rpe,
            rest_seconds: set.restSeconds,
          }));

          const { error: setsError } = await supabase
            .from("sets")
            .insert(setsToInsert);

          if (setsError) throw setsError;
        }
      }
  };

  const updateWorkoutInDb = async (workout: Workout) => {
    // Update workout
    const { error: workoutError } = await supabase
      .from("workouts")
      .update({
        name: workout.name,
        date: workout.date,
        duration: workout.duration,
        updated_at: new Date().toISOString(),
      })
      .eq("id", workout.id);

    if (workoutError) throw workoutError;

    // Delete existing exercises and sets (cascade will handle sets)
    const { error: deleteError } = await supabase
      .from("exercises")
      .delete()
      .eq("workout_id", workout.id);

    if (deleteError) throw deleteError;

      // Recreate exercises and sets
      for (let i = 0; i < workout.exercises.length; i++) {
        const exercise = workout.exercises[i];
        const { error: exerciseError } = await supabase
          .from("exercises")
          .insert({
            id: exercise.id,
            workout_id: workout.id,
            name: exercise.name,
            notes: exercise.notes,
            muscle_groups: exercise.muscleGroups || [],
            superset_group: exercise.supersetGroup,
            exercise_order: exercise.exerciseOrder !== undefined ? exercise.exerciseOrder : i,
          });

        if (exerciseError) throw exerciseError;

        // Create sets
        if (exercise.sets.length > 0) {
          const setsToInsert = exercise.sets.map((set) => ({
            id: set.id,
            exercise_id: exercise.id,
            reps: set.reps,
            weight: set.weight,
            completed: set.completed,
            rpe: set.rpe,
            rest_seconds: set.restSeconds,
          }));

          const { error: setsError } = await supabase
            .from("sets")
            .insert(setsToInsert);

          if (setsError) throw setsError;
        }
      }
  };

  const cancelEdit = () => {
    setCurrentWorkout(null);
    setEditingWorkoutId(null);
    setIsDialogOpen(false);
  };

  const addExercise = () => {
    if (!currentWorkout || !newExercise.name) return;

    const exercise: Exercise = {
      id: crypto.randomUUID(),
      name: newExercise.name,
      muscleGroups: newExercise.muscleGroups,
      supersetGroup: newExercise.supersetGroup,
      exerciseOrder: currentWorkout.exercises.length,
      sets: Array.from({ length: newExercise.sets }, (_, i) => ({
        id: crypto.randomUUID(),
        reps: newExercise.reps,
        weight: newExercise.weight,
        completed: false,
      })),
    };

    setCurrentWorkout({
      ...currentWorkout,
      exercises: [...currentWorkout.exercises, exercise],
    });

    setNewExercise({ name: "", sets: 3, reps: 10, weight: 0, muscleGroups: [], supersetGroup: undefined });
    setExerciseSearchQuery("");
    setShowExerciseDropdown(false);
  };

  const updateSet = (exerciseId: string, setId: string, updates: Partial<Set>) => {
    if (!currentWorkout) return;

    const updatedExercises = currentWorkout.exercises.map((exercise) => {
      if (exercise.id === exerciseId) {
        return {
          ...exercise,
          sets: exercise.sets.map((set) =>
            set.id === setId ? { ...set, ...updates } : set
          ),
        };
      }
      return exercise;
    });

    setCurrentWorkout({ ...currentWorkout, exercises: updatedExercises });
  };

  const removeExercise = (exerciseId: string) => {
    if (!currentWorkout) return;
    setCurrentWorkout({
      ...currentWorkout,
      exercises: currentWorkout.exercises.filter((ex) => ex.id !== exerciseId),
    });
  };

  const deleteWorkout = async (workoutId: string) => {
    if (!confirm("Are you sure you want to delete this workout?")) return;

    try {
      const { error } = await supabase
        .from("workouts")
        .delete()
        .eq("id", workoutId);

      if (error) throw error;

      // Reload workouts
      await loadWorkouts();
    } catch (error) {
      console.error("Error deleting workout:", error);
      alert("Failed to delete workout. Please try again.");
    }
  };

  // Rest timer functions
  const startRestTimer = (setId: string, seconds: number) => {
    if (activeTimers[setId]?.interval) {
      clearInterval(activeTimers[setId].interval!);
    }
    
    const interval = setInterval(() => {
      setActiveTimers((prev) => {
        const current = prev[setId];
        if (!current || current.seconds <= 1) {
          clearInterval(interval);
          const newTimers = { ...prev };
          delete newTimers[setId];
          return newTimers;
        }
        return { ...prev, [setId]: { ...current, seconds: current.seconds - 1 } };
      });
    }, 1000);

    setActiveTimers((prev) => ({ ...prev, [setId]: { seconds, interval } }));
  };

  const stopRestTimer = (setId: string) => {
    if (activeTimers[setId]?.interval) {
      clearInterval(activeTimers[setId].interval!);
      setActiveTimers((prev) => {
        const newTimers = { ...prev };
        delete newTimers[setId];
        return newTimers;
      });
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // CSV Export
  const exportWorkoutsToCSV = () => {
    const headers = ["Workout Name", "Date", "Exercise", "Set", "Reps", "Weight (lbs)", "RPE", "Rest (s)", "Completed", "Muscle Groups"];
    const rows = workouts.flatMap((workout) =>
      workout.exercises.flatMap((exercise) =>
        exercise.sets.map((set, index) => [
          workout.name,
          new Date(workout.date).toLocaleDateString(),
          exercise.name,
          index + 1,
          set.reps,
          set.weight,
          set.rpe || "",
          set.restSeconds || "",
          set.completed ? "Yes" : "No",
          (exercise.muscleGroups || []).join(", "),
        ])
      )
    );

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workouts-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate volume and 1RM for an exercise
  const getExerciseStats = (exercise: Exercise) => {
    const completedSets = exercise.sets.filter((s) => s.completed);
    const volume = calculateVolume(completedSets);
    const bestSet = completedSets.reduce((best, set) => {
      const current1RM = calculate1RM(set.weight, set.reps);
      const best1RM = best ? calculate1RM(best.weight, best.reps) : 0;
      return current1RM > best1RM ? set : best;
    }, null as Set | null);
    const estimated1RM = bestSet ? calculate1RM(bestSet.weight, bestSet.reps) : 0;
    return { volume, estimated1RM, completedSets: completedSets.length };
  };

  // Template management functions
  const loadTemplates = async () => {
    if (!user) return;
    
    try {
      const { data: templatesData, error: templatesError } = await supabase
        .from("workout_templates")
        .select(`
          id,
          name,
          notes,
          created_at,
          updated_at,
          template_exercises (
            id,
            name,
            muscle_groups,
            superset_group,
            exercise_order,
            default_sets,
            default_reps,
            default_weight,
            notes
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (templatesError) throw templatesError;

      const transformedTemplates: WorkoutTemplate[] = (templatesData || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        notes: t.notes,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
        exercises: (t.template_exercises || []).sort((a: any, b: any) => (a.exercise_order || 0) - (b.exercise_order || 0)).map((ex: any) => ({
          id: ex.id,
          name: ex.name,
          muscleGroups: ex.muscle_groups || [],
          supersetGroup: ex.superset_group,
          exerciseOrder: ex.exercise_order || 0,
          defaultSets: ex.default_sets || 3,
          defaultReps: ex.default_reps || 10,
          defaultWeight: parseFloat(ex.default_weight) || 0,
          notes: ex.notes,
        })),
      }));

      setWorkoutTemplates(transformedTemplates);
    } catch (error) {
      console.error("Error loading templates:", error);
    }
  };

  const saveTemplate = async (workout: Workout, templateName: string, templateNotes?: string) => {
    if (!user || !workout) return;

    try {
      // Create template
      const { data: templateData, error: templateError } = await supabase
        .from("workout_templates")
        .insert({
          user_id: user.id,
          name: templateName,
          notes: templateNotes,
        })
        .select()
        .single();

      if (templateError) throw templateError;

      // Create template exercises
      for (let i = 0; i < workout.exercises.length; i++) {
        const exercise = workout.exercises[i];
        const firstSet = exercise.sets[0];
        
        const { error: exerciseError } = await supabase
          .from("template_exercises")
          .insert({
            template_id: templateData.id,
            name: exercise.name,
            muscle_groups: exercise.muscleGroups || [],
            superset_group: exercise.supersetGroup,
            exercise_order: exercise.exerciseOrder !== undefined ? exercise.exerciseOrder : i,
            default_sets: exercise.sets.length,
            default_reps: firstSet?.reps || 10,
            default_weight: firstSet?.weight || 0,
            notes: exercise.notes,
          });

        if (exerciseError) throw exerciseError;
      }

      await loadTemplates();
      return templateData.id;
    } catch (error) {
      console.error("Error saving template:", error);
      throw error;
    }
  };

  const deleteTemplate = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const { error } = await supabase
        .from("workout_templates")
        .delete()
        .eq("id", templateId);

      if (error) throw error;
      await loadTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
      alert("Failed to delete template. Please try again.");
    }
  };

  const useTemplate = (template: WorkoutTemplate) => {
    const workout: Workout = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      name: template.name,
      exercises: template.exercises.map((templateEx) => ({
        id: crypto.randomUUID(),
        name: templateEx.name,
        muscleGroups: templateEx.muscleGroups,
        supersetGroup: templateEx.supersetGroup,
        exerciseOrder: templateEx.exerciseOrder,
        notes: templateEx.notes,
        sets: Array.from({ length: templateEx.defaultSets || 3 }, () => ({
          id: crypto.randomUUID(),
          reps: templateEx.defaultReps || 10,
          weight: templateEx.defaultWeight || 0,
          completed: false,
        })),
      })),
    };

    setCurrentWorkout(workout);
    setEditingWorkoutId(null);
    setIsDialogOpen(true);
  };

  const createNewTemplate = () => {
    const template: WorkoutTemplate = {
      id: crypto.randomUUID(),
      name: "",
      exercises: [],
    };
    setCurrentTemplate(template);
    setIsNewTemplateDialogOpen(true);
  };

  const addTemplateExercise = () => {
    if (!currentTemplate || !newTemplateExercise.name) return;

    const exercise: TemplateExercise = {
      id: crypto.randomUUID(),
      name: newTemplateExercise.name,
      muscleGroups: newTemplateExercise.muscleGroups,
      supersetGroup: newTemplateExercise.supersetGroup,
      exerciseOrder: currentTemplate.exercises.length,
      defaultSets: newTemplateExercise.sets,
      defaultReps: newTemplateExercise.reps,
      defaultWeight: newTemplateExercise.weight,
    };

    setCurrentTemplate({
      ...currentTemplate,
      exercises: [...currentTemplate.exercises, exercise],
    });

    setNewTemplateExercise({ name: "", sets: 3, reps: 10, weight: 0, muscleGroups: [], supersetGroup: undefined });
    setExerciseSearchQueryTemplate("");
    setShowExerciseDropdownTemplate(false);
  };

  const removeTemplateExercise = (exerciseId: string) => {
    if (!currentTemplate) return;
    setCurrentTemplate({
      ...currentTemplate,
      exercises: currentTemplate.exercises.filter((ex) => ex.id !== exerciseId),
    });
  };

  const saveNewTemplate = async () => {
    if (!currentTemplate || !currentTemplate.name.trim() || currentTemplate.exercises.length === 0) return;

    try {
      await saveTemplate(
        {
          id: "",
          date: new Date().toISOString(),
          name: currentTemplate.name,
          exercises: currentTemplate.exercises.map((ex) => ({
            id: "",
            name: ex.name,
            muscleGroups: ex.muscleGroups,
            supersetGroup: ex.supersetGroup,
            exerciseOrder: ex.exerciseOrder,
            notes: ex.notes,
            sets: Array.from({ length: ex.defaultSets || 3 }, () => ({
              id: "",
              reps: ex.defaultReps || 10,
              weight: ex.defaultWeight || 0,
              completed: false,
            })),
          })),
        },
        currentTemplate.name,
        currentTemplate.notes
      );
      setIsNewTemplateDialogOpen(false);
      setCurrentTemplate(null);
      alert("Template created successfully!");
    } catch (error) {
      alert("Failed to create template. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gym Logbook</h2>
          <p className="text-muted-foreground">Track your workouts and progress</p>
        </div>
        <div className="flex gap-2">
          {workouts.length > 0 && (
            <Button variant="outline" onClick={exportWorkoutsToCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={createWorkout}>
                <Plus className="mr-2 h-4 w-4" />
                New Workout
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingWorkoutId ? "Edit Workout" : "Create New Workout"}</DialogTitle>
              <DialogDescription>
                {editingWorkoutId ? "Update your workout details" : "Add exercises and track your sets and reps"}
              </DialogDescription>
            </DialogHeader>
            {currentWorkout && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="workout-name">Workout Name</Label>
                    <Input
                      id="workout-name"
                      value={currentWorkout.name}
                      onChange={(e) =>
                        setCurrentWorkout({ ...currentWorkout, name: e.target.value })
                      }
                      placeholder="e.g., Push Day, Leg Day"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workout-date">Date</Label>
                    <Input
                      id="workout-date"
                      type="date"
                      value={new Date(currentWorkout.date).toISOString().split('T')[0]}
                      onChange={(e) =>
                        setCurrentWorkout({
                          ...currentWorkout,
                          date: new Date(e.target.value).toISOString(),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-lg font-semibold">Add Exercise</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="md:col-span-2 relative">
                      <Label htmlFor="exercise-name">Exercise Name</Label>
                      <div className="relative">
                        <Input
                          id="exercise-name"
                          value={newExercise.name}
                          onChange={(e) => {
                            setNewExercise({ ...newExercise, name: e.target.value });
                            setExerciseSearchQuery(e.target.value);
                            setShowExerciseDropdown(e.target.value.length > 0);
                          }}
                          onFocus={() => {
                            setExerciseSearchQuery(newExercise.name);
                            setShowExerciseDropdown(true);
                          }}
                          onBlur={() => {
                            // Delay to allow clicking on dropdown items
                            setTimeout(() => setShowExerciseDropdown(false), 200);
                          }}
                          placeholder="Search or type exercise name"
                        />
                        {showExerciseDropdown && filteredExercises.length > 0 && (
                          <div 
                            className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto"
                            onMouseDown={(e) => e.preventDefault()}
                          >
                            {filteredExercises.map((ex) => (
                              <div
                                key={ex.id}
                                className="px-4 py-2 hover:bg-accent cursor-pointer border-b last:border-b-0"
                                onClick={() => selectExerciseFromDatabase(ex)}
                              >
                                <div className="font-medium">{ex.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {ex.category} • {(ex.muscleGroups || []).join(", ")}
                                  {ex.equipment && ` • ${ex.equipment}`}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="sets">Sets</Label>
                      <Input
                        id="sets"
                        type="number"
                        value={newExercise.sets}
                        onChange={(e) =>
                          setNewExercise({ ...newExercise, sets: parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="reps">Reps</Label>
                      <Input
                        id="reps"
                        type="number"
                        value={newExercise.reps}
                        onChange={(e) =>
                          setNewExercise({ ...newExercise, reps: parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="weight">Weight (lbs)</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={newExercise.weight}
                        onChange={(e) =>
                          setNewExercise({ ...newExercise, weight: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Muscle Groups</Label>
                    <div className="flex flex-wrap gap-2">
                      {MUSCLE_GROUPS.map((mg) => (
                        <Badge
                          key={mg}
                          variant={newExercise.muscleGroups.includes(mg) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            const updated = newExercise.muscleGroups.includes(mg)
                              ? newExercise.muscleGroups.filter((m) => m !== mg)
                              : [...newExercise.muscleGroups, mg];
                            setNewExercise({ ...newExercise, muscleGroups: updated });
                          }}
                        >
                          {mg}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button onClick={addExercise} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Exercise
                  </Button>
                </div>

                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-lg font-semibold">Exercises</h3>
                  {currentWorkout.exercises.map((exercise) => (
                    <Card key={exercise.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{exercise.name}</CardTitle>
                          <div className="flex gap-2">
                            {exercise.sets.length > 0 && exercise.sets[0].weight > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowWarmupCalculator(showWarmupCalculator === exercise.id ? null : exercise.id)}
                              >
                                <Calculator className="h-4 w-4 mr-2" />
                                Warm-up
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeExercise(exercise.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        {showWarmupCalculator === exercise.id && exercise.sets.length > 0 && exercise.sets[0].weight > 0 && (
                          <div className="mt-4 p-3 bg-muted rounded-md">
                            <h4 className="text-sm font-semibold mb-2">Warm-up Sets</h4>
                            <div className="space-y-1 text-sm">
                              {calculateWarmupSets(exercise.sets[0].weight, exercise.sets[0].reps).map((warmup, idx) => (
                                <div key={idx} className="flex justify-between">
                                  <span>{warmup.weight} lbs × {warmup.reps} reps</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Set</TableHead>
                              <TableHead>Reps</TableHead>
                              <TableHead>Weight (lbs)</TableHead>
                              <TableHead>RPE</TableHead>
                              <TableHead>Rest</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {exercise.sets.map((set, index) => {
                              const timerKey = `${exercise.id}-${set.id}`;
                              const activeTimer = activeTimers[timerKey];
                              return (
                                <TableRow key={set.id}>
                                  <TableCell>{index + 1}</TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      value={set.reps}
                                      onChange={(e) =>
                                        updateSet(exercise.id, set.id, {
                                          reps: parseInt(e.target.value) || 0,
                                        })
                                      }
                                      className="w-20"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      value={set.weight}
                                      onChange={(e) =>
                                        updateSet(exercise.id, set.id, {
                                          weight: parseFloat(e.target.value) || 0,
                                        })
                                      }
                                      className="w-20"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      min="0"
                                      max="10"
                                      step="0.5"
                                      value={set.rpe || ""}
                                      onChange={(e) =>
                                        updateSet(exercise.id, set.id, {
                                          rpe: e.target.value ? parseFloat(e.target.value) : undefined,
                                        })
                                      }
                                      className="w-16"
                                      placeholder="RPE"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1">
                                      <Input
                                        type="number"
                                        value={set.restSeconds || ""}
                                        onChange={(e) =>
                                          updateSet(exercise.id, set.id, {
                                            restSeconds: e.target.value ? parseInt(e.target.value) : undefined,
                                          })
                                        }
                                        className="w-16"
                                        placeholder="s"
                                      />
                                      {set.restSeconds && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            if (activeTimer) {
                                              stopRestTimer(timerKey);
                                            } else {
                                              startRestTimer(timerKey, set.restSeconds || 60);
                                            }
                                          }}
                                          className="h-8 w-8 p-0"
                                        >
                                          {activeTimer ? (
                                            <Pause className="h-3 w-3" />
                                          ) : (
                                            <Play className="h-3 w-3" />
                                          )}
                                        </Button>
                                      )}
                                      {activeTimer && (
                                        <span className="text-sm font-mono">{formatTimer(activeTimer.seconds)}</span>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={set.completed ? "default" : "outline"}
                                      className="cursor-pointer"
                                      onClick={() =>
                                        updateSet(exercise.id, set.id, {
                                          completed: !set.completed,
                                        })
                                      }
                                    >
                                      {set.completed ? "Done" : "Pending"}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                        {exercise.sets.some((s) => s.completed) && (
                          <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
                            <span>Volume: {getExerciseStats(exercise).volume.toLocaleString()} lbs</span>
                            {getExerciseStats(exercise).estimated1RM > 0 && (
                              <span>1RM: {getExerciseStats(exercise).estimated1RM.toFixed(1)} lbs</span>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {currentWorkout.exercises.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No exercises added yet. Add your first exercise above.
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-center border-t pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (currentWorkout && currentWorkout.exercises.length > 0) {
                        setTemplateName(currentWorkout.name);
                        setTemplateNotes("");
                        setIsTemplateDialogOpen(true);
                      }
                    }}
                    disabled={!currentWorkout || currentWorkout.exercises.length === 0}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Save as Template
                  </Button>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={cancelEdit}>
                      Cancel
                    </Button>
                    <Button onClick={saveWorkout} disabled={currentWorkout.exercises.length === 0 || saving}>
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          {editingWorkoutId ? "Update Workout" : "Save Workout"}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Workout as Template</DialogTitle>
              <DialogDescription>
                Save this workout structure to reuse later. Default sets, reps, and weights will be saved.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Push Day Template"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-notes">Notes (Optional)</Label>
                <Input
                  id="template-notes"
                  value={templateNotes}
                  onChange={(e) => setTemplateNotes(e.target.value)}
                  placeholder="Add any notes about this template"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    if (!currentWorkout || !templateName.trim()) return;
                    try {
                      await saveTemplate(currentWorkout, templateName, templateNotes || undefined);
                      setIsTemplateDialogOpen(false);
                      setTemplateName("");
                      setTemplateNotes("");
                      alert("Template saved successfully!");
                    } catch (error) {
                      alert("Failed to save template. Please try again.");
                    }
                  }}
                  disabled={!templateName.trim()}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="workouts">Workouts</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
        </TabsList>
        <TabsContent value="workouts" className="space-y-4">
        {workouts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <p className="text-muted-foreground mb-4">No workouts logged yet</p>
              <Button onClick={createWorkout}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Workout
              </Button>
            </CardContent>
          </Card>
        ) : (
          workouts.map((workout) => (
            <Card key={workout.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{workout.name}</CardTitle>
                    <CardDescription>
                      {new Date(workout.date).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => editWorkout(workout)}
                      title="Edit workout"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteWorkout(workout.id)}
                      title="Delete workout"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workout.exercises.map((exercise) => (
                    <div key={exercise.id} className="space-y-2">
                      <h4 className="font-semibold">{exercise.name}</h4>
                      <div className="space-y-2">
                        {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {exercise.muscleGroups.map((mg) => (
                              <Badge key={mg} variant="secondary" className="text-xs">
                                {mg}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Set</TableHead>
                              <TableHead>Reps</TableHead>
                              <TableHead>Weight</TableHead>
                              <TableHead>RPE</TableHead>
                              <TableHead>Rest</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {exercise.sets.map((set, index) => (
                              <TableRow key={set.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{set.reps}</TableCell>
                                <TableCell>{set.weight} lbs</TableCell>
                                <TableCell>{set.rpe || "-"}</TableCell>
                                <TableCell>{set.restSeconds ? `${set.restSeconds}s` : "-"}</TableCell>
                                <TableCell>
                                  <Badge variant={set.completed ? "default" : "outline"}>
                                    {set.completed ? "Done" : "Pending"}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        {exercise.sets.some((s) => s.completed) && (
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>Volume: {getExerciseStats(exercise).volume.toLocaleString()} lbs</span>
                            {getExerciseStats(exercise).estimated1RM > 0 && (
                              <span>1RM: {getExerciseStats(exercise).estimated1RM.toFixed(1)} lbs</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {workout.exercises.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No exercises in this workout
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
        </TabsContent>
        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Workout Templates</h3>
            <Dialog open={isNewTemplateDialogOpen} onOpenChange={setIsNewTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={createNewTemplate}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Template</DialogTitle>
                  <DialogDescription>
                    Create a workout template with exercises, sets, reps, and weights
                  </DialogDescription>
                </DialogHeader>
                {currentTemplate && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="template-name-input">Template Name</Label>
                        <Input
                          id="template-name-input"
                          value={currentTemplate.name}
                          onChange={(e) =>
                            setCurrentTemplate({ ...currentTemplate, name: e.target.value })
                          }
                          placeholder="e.g., Push Day Template"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="template-notes-input">Notes (Optional)</Label>
                        <Input
                          id="template-notes-input"
                          value={currentTemplate.notes || ""}
                          onChange={(e) =>
                            setCurrentTemplate({ ...currentTemplate, notes: e.target.value })
                          }
                          placeholder="Add notes about this template"
                        />
                      </div>
                    </div>

                    <div className="space-y-4 border-t pt-4">
                      <h3 className="text-lg font-semibold">Add Exercise</h3>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="md:col-span-2 relative">
                          <Label htmlFor="template-exercise-name">Exercise Name</Label>
                          <div className="relative">
                            <Input
                              id="template-exercise-name"
                              value={newTemplateExercise.name}
                              onChange={(e) => {
                                setNewTemplateExercise({ ...newTemplateExercise, name: e.target.value });
                                setExerciseSearchQueryTemplate(e.target.value);
                                setShowExerciseDropdownTemplate(e.target.value.length > 0);
                              }}
                              onFocus={() => {
                                setExerciseSearchQueryTemplate(newTemplateExercise.name);
                                setShowExerciseDropdownTemplate(true);
                              }}
                              onBlur={() => {
                                // Delay to allow clicking on dropdown items
                                setTimeout(() => setShowExerciseDropdownTemplate(false), 200);
                              }}
                              placeholder="Search or type exercise name"
                            />
                            {showExerciseDropdownTemplate && filteredExercisesTemplate.length > 0 && (
                              <div 
                                className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto"
                                onMouseDown={(e) => e.preventDefault()}
                              >
                                {filteredExercisesTemplate.map((ex) => (
                                  <div
                                    key={ex.id}
                                    className="px-4 py-2 hover:bg-accent cursor-pointer border-b last:border-b-0"
                                    onClick={() => selectExerciseFromDatabaseTemplate(ex)}
                                  >
                                    <div className="font-medium">{ex.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {ex.category} • {(ex.muscleGroups || []).join(", ")}
                                      {ex.equipment && ` • ${ex.equipment}`}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="template-sets">Sets</Label>
                          <Input
                            id="template-sets"
                            type="number"
                            value={newTemplateExercise.sets}
                            onChange={(e) =>
                              setNewTemplateExercise({ ...newTemplateExercise, sets: parseInt(e.target.value) || 0 })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="template-reps">Reps</Label>
                          <Input
                            id="template-reps"
                            type="number"
                            value={newTemplateExercise.reps}
                            onChange={(e) =>
                              setNewTemplateExercise({ ...newTemplateExercise, reps: parseInt(e.target.value) || 0 })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="template-weight">Weight (lbs)</Label>
                          <Input
                            id="template-weight"
                            type="number"
                            value={newTemplateExercise.weight}
                            onChange={(e) =>
                              setNewTemplateExercise({ ...newTemplateExercise, weight: parseFloat(e.target.value) || 0 })
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Muscle Groups</Label>
                        <div className="flex flex-wrap gap-2">
                          {MUSCLE_GROUPS.map((mg) => (
                            <Badge
                              key={mg}
                              variant={newTemplateExercise.muscleGroups.includes(mg) ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => {
                                const updated = newTemplateExercise.muscleGroups.includes(mg)
                                  ? newTemplateExercise.muscleGroups.filter((m) => m !== mg)
                                  : [...newTemplateExercise.muscleGroups, mg];
                                setNewTemplateExercise({ ...newTemplateExercise, muscleGroups: updated });
                              }}
                            >
                              {mg}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button onClick={addTemplateExercise} className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Exercise
                      </Button>
                    </div>

                    <div className="space-y-4 border-t pt-4">
                      <h3 className="text-lg font-semibold">Exercises</h3>
                      {currentTemplate.exercises.map((exercise) => (
                        <Card key={exercise.id}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">{exercise.name}</CardTitle>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeTemplateExercise(exercise.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                            {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
                              <div className="flex gap-1 flex-wrap mt-2">
                                {exercise.muscleGroups.map((mg) => (
                                  <Badge key={mg} variant="secondary" className="text-xs">
                                    {mg}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </CardHeader>
                          <CardContent>
                            <div className="text-sm text-muted-foreground">
                              <p>
                                {exercise.defaultSets} sets × {exercise.defaultReps} reps @ {exercise.defaultWeight} lbs
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {currentTemplate.exercises.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                          No exercises added yet. Add your first exercise above.
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end space-x-2 border-t pt-4">
                      <Button variant="outline" onClick={() => {
                        setIsNewTemplateDialogOpen(false);
                        setCurrentTemplate(null);
                      }}>
                        Cancel
                      </Button>
                      <Button onClick={saveNewTemplate} disabled={!currentTemplate.name.trim() || currentTemplate.exercises.length === 0}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Template
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
          {workoutTemplates.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <p className="text-muted-foreground mb-4">No templates saved yet</p>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Create a template to plan your workouts ahead of time
                </p>
                <Button onClick={createNewTemplate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Template
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {workoutTemplates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    {template.notes && (
                      <CardDescription>{template.notes}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        <p>{template.exercises.length} exercise{template.exercises.length !== 1 ? 's' : ''}</p>
                      </div>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {template.exercises.slice(0, 5).map((ex) => (
                          <div key={ex.id} className="text-sm flex items-center justify-between">
                            <span className="truncate">{ex.name}</span>
                            <span className="text-muted-foreground ml-2">
                              {ex.defaultSets}×{ex.defaultReps} @ {ex.defaultWeight}lbs
                            </span>
                          </div>
                        ))}
                        {template.exercises.length > 5 && (
                          <p className="text-xs text-muted-foreground">
                            +{template.exercises.length - 5} more
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1"
                          onClick={() => useTemplate(template)}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Use Template
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteTemplate(template.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="exercises" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Exercise Database</h3>
          </div>
          <div className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="exercise-search">Search Exercises</Label>
              <Input
                id="exercise-search"
                value={exerciseSearchFilter}
                onChange={(e) => setExerciseSearchFilter(e.target.value)}
                placeholder="Search by name, category, or muscle group..."
              />
            </div>
            <div className="w-48 space-y-2">
              <Label htmlFor="exercise-category">Category</Label>
              <Select value={exerciseCategoryFilter} onValueChange={setExerciseCategoryFilter}>
                <SelectTrigger id="exercise-category">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Chest">Chest</SelectItem>
                  <SelectItem value="Back">Back</SelectItem>
                  <SelectItem value="Shoulders">Shoulders</SelectItem>
                  <SelectItem value="Arms">Arms</SelectItem>
                  <SelectItem value="Legs">Legs</SelectItem>
                  <SelectItem value="Core">Core</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {(() => {
            const filtered = exerciseDatabase.filter((ex) => {
              const matchesSearch = !exerciseSearchFilter || 
                ex.name.toLowerCase().includes(exerciseSearchFilter.toLowerCase()) ||
                ex.category.toLowerCase().includes(exerciseSearchFilter.toLowerCase()) ||
                (ex.muscleGroups || []).some((mg) => mg.toLowerCase().includes(exerciseSearchFilter.toLowerCase())) ||
                (ex.equipment || "").toLowerCase().includes(exerciseSearchFilter.toLowerCase());
              const matchesCategory = exerciseCategoryFilter === "all" || ex.category === exerciseCategoryFilter;
              return matchesSearch && matchesCategory;
            });

            const groupedByCategory = filtered.reduce((acc, ex) => {
              if (!acc[ex.category]) {
                acc[ex.category] = [];
              }
              acc[ex.category].push(ex);
              return acc;
            }, {} as Record<string, ExerciseDatabase[]>);

            const categories = Object.keys(groupedByCategory).sort();

            if (filtered.length === 0) {
              return (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <p className="text-muted-foreground">No exercises found</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Try adjusting your search or category filter
                    </p>
                  </CardContent>
                </Card>
              );
            }

            return (
              <div className="space-y-6">
                {categories.map((category) => (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle>{category}</CardTitle>
                      <CardDescription>
                        {groupedByCategory[category].length} exercise{groupedByCategory[category].length !== 1 ? 's' : ''}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {groupedByCategory[category].map((ex) => (
                          <div key={ex.id} className="p-4 border rounded-lg space-y-2">
                            <div className="font-semibold">{ex.name}</div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              {(ex.muscleGroups || []).length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {(ex.muscleGroups || []).map((mg) => (
                                    <Badge key={mg} variant="secondary" className="text-xs">
                                      {mg}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              {ex.equipment && (
                                <div className="text-xs">
                                  Equipment: {ex.equipment}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <div className="text-center text-sm text-muted-foreground">
                  Showing {filtered.length} of {exerciseDatabase.length} exercises
                </div>
              </div>
            );
          })()}
        </TabsContent>
      </Tabs>
    </div>
  );
}

