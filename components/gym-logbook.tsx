"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Save, X, Loader2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import type { Workout, Exercise, Set } from "@/lib/types";

export function GymLogbook() {
  const { user } = useAuth();
  const supabase = createClient();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);
  const [newExercise, setNewExercise] = useState({ name: "", sets: 3, reps: 10, weight: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load workouts from Supabase
  useEffect(() => {
    if (user) {
      loadWorkouts();
    }
  }, [user]);

  const loadWorkouts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      // Fetch workouts with exercises and sets
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
            sets (
              id,
              reps,
              weight,
              completed
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
        exercises: (w.exercises || []).map((ex: any) => ({
          id: ex.id,
          name: ex.name,
          notes: ex.notes,
          sets: (ex.sets || []).map((s: any) => ({
            id: s.id,
            reps: s.reps,
            weight: parseFloat(s.weight),
            completed: s.completed,
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
    for (const exercise of workout.exercises) {
      const { data: exerciseData, error: exerciseError } = await supabase
        .from("exercises")
        .insert({
          id: exercise.id,
          workout_id: workout.id,
          name: exercise.name,
          notes: exercise.notes,
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
    for (const exercise of workout.exercises) {
      const { error: exerciseError } = await supabase
        .from("exercises")
        .insert({
          id: exercise.id,
          workout_id: workout.id,
          name: exercise.name,
          notes: exercise.notes,
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

    setNewExercise({ name: "", sets: 3, reps: 10, weight: 0 });
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
                    <div className="md:col-span-2">
                      <Label htmlFor="exercise-name">Exercise Name</Label>
                      <Input
                        id="exercise-name"
                        value={newExercise.name}
                        onChange={(e) =>
                          setNewExercise({ ...newExercise, name: e.target.value })
                        }
                        placeholder="e.g., Bench Press"
                      />
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
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeExercise(exercise.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Set</TableHead>
                              <TableHead>Reps</TableHead>
                              <TableHead>Weight (lbs)</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {exercise.sets.map((set, index) => (
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
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  ))}
                  {currentWorkout.exercises.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No exercises added yet. Add your first exercise above.
                    </p>
                  )}
                </div>

                <div className="flex justify-end space-x-2 border-t pt-4">
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
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
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
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Set</TableHead>
                            <TableHead>Reps</TableHead>
                            <TableHead>Weight</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {exercise.sets.map((set, index) => (
                            <TableRow key={set.id}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>{set.reps}</TableCell>
                              <TableCell>{set.weight} lbs</TableCell>
                              <TableCell>
                                <Badge variant={set.completed ? "default" : "outline"}>
                                  {set.completed ? "Done" : "Pending"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
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
      </div>
    </div>
  );
}

