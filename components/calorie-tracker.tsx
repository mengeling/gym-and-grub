"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Target, TrendingUp, Search, Utensils } from "lucide-react";
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
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import type { Meal, FoodDatabase, NutritionPreferences, DailyNutrition } from "@/lib/types";

export function CalorieTracker() {
  const { user } = useAuth();
  const supabase = createClient();

  // State
  const [preferences, setPreferences] = useState<NutritionPreferences | null>(null);
  const [todayMeals, setTodayMeals] = useState<Meal[]>([]);
  const [dailyNutrition, setDailyNutrition] = useState<DailyNutrition | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Food search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FoodDatabase[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodDatabase | null>(null);

  // New meal form
  const [newMeal, setNewMeal] = useState({
    meal_name: "",
    meal_type: "snack" as "breakfast" | "lunch" | "dinner" | "snack",
    serving_multiplier: 1,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
  });

  const today = new Date().toISOString().split('T')[0];

  // Load user preferences and today's meals
  useEffect(() => {
    if (user) {
      loadPreferences();
      loadTodaysMeals();
      loadDailyNutrition();
    }
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('nutrition_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setPreferences(data);
    } else if (error && error.code === 'PGRST116') {
      // No preferences exist, create default ones
      const defaultPrefs = {
        user_id: user.id,
        daily_calorie_goal: 2000,
        daily_protein_goal: 150,
        daily_carbs_goal: 200,
        daily_fat_goal: 65,
        daily_water_goal_ml: 2000,
      };

      const { data: newPrefs } = await supabase
        .from('nutrition_preferences')
        .insert(defaultPrefs)
        .select()
        .single();

      if (newPrefs) setPreferences(newPrefs);
    }
  };

  const loadTodaysMeals = async () => {
    if (!user) return;

    setIsLoading(true);
    const todayStart = new Date(today);
    const todayEnd = new Date(today);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', user.id)
      .gte('logged_at', todayStart.toISOString())
      .lt('logged_at', todayEnd.toISOString())
      .order('logged_at', { ascending: true });

    if (data) {
      setTodayMeals(data);
    }
    setIsLoading(false);
  };

  const loadDailyNutrition = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('daily_nutrition')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    if (data) {
      setDailyNutrition(data);
    } else if (error && error.code === 'PGRST116' && preferences) {
      // Create daily nutrition record
      const defaultDaily = {
        user_id: user.id,
        date: today,
        calorie_goal: preferences.daily_calorie_goal,
        protein_goal: preferences.daily_protein_goal,
        carbs_goal: preferences.daily_carbs_goal,
        fat_goal: preferences.daily_fat_goal,
        total_calories: 0,
        total_protein: 0,
        total_carbs: 0,
        total_fat: 0,
        water_intake_ml: 0,
      };

      const { data: newDaily } = await supabase
        .from('daily_nutrition')
        .insert(defaultDaily)
        .select()
        .single();

      if (newDaily) setDailyNutrition(newDaily);
    }
  };

  const searchFoods = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    const { data, error } = await supabase
      .from('food_database')
      .select('*')
      .or(`name.ilike.%${query}%,brand.ilike.%${query}%,category.ilike.%${query}%`)
      .limit(20);

    if (data) {
      setSearchResults(data);
    }
  };

  const selectFood = (food: FoodDatabase) => {
    setSelectedFood(food);
    setNewMeal({
      meal_name: food.brand ? `${food.brand} ${food.name}` : food.name,
      meal_type: newMeal.meal_type,
      serving_multiplier: 1,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber || 0,
      sugar: food.sugar || 0,
      sodium: food.sodium || 0,
    });
    setSearchQuery("");
    setSearchResults([]);
  };

  const updateServingMultiplier = (multiplier: number) => {
    if (!selectedFood || multiplier <= 0) return;

    setNewMeal({
      ...newMeal,
      serving_multiplier: multiplier,
      calories: Math.round(selectedFood.calories * multiplier),
      protein: parseFloat((selectedFood.protein * multiplier).toFixed(2)),
      carbs: parseFloat((selectedFood.carbs * multiplier).toFixed(2)),
      fat: parseFloat((selectedFood.fat * multiplier).toFixed(2)),
      fiber: parseFloat(((selectedFood.fiber || 0) * multiplier).toFixed(2)),
      sugar: parseFloat(((selectedFood.sugar || 0) * multiplier).toFixed(2)),
      sodium: Math.round((selectedFood.sodium || 0) * multiplier),
    });
  };

  const addMeal = async () => {
    if (!user || !newMeal.meal_name || newMeal.calories <= 0) return;

    const meal = {
      user_id: user.id,
      food_id: selectedFood?.id,
      meal_name: newMeal.meal_name,
      meal_type: newMeal.meal_type,
      serving_multiplier: newMeal.serving_multiplier,
      calories: newMeal.calories,
      protein: newMeal.protein,
      carbs: newMeal.carbs,
      fat: newMeal.fat,
      fiber: newMeal.fiber,
      sugar: newMeal.sugar,
      sodium: newMeal.sodium,
      logged_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('meals')
      .insert(meal)
      .select()
      .single();

    if (data) {
      setTodayMeals([...todayMeals, data]);
      await updateDailyNutrition();
      resetForm();
    }
  };

  const removeMeal = async (mealId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('meals')
      .delete()
      .eq('id', mealId)
      .eq('user_id', user.id);

    if (!error) {
      setTodayMeals(todayMeals.filter((m) => m.id !== mealId));
      await updateDailyNutrition();
    }
  };

  const updateDailyNutrition = async () => {
    if (!user || !dailyNutrition) return;

    const totals = todayMeals.reduce((acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    await supabase
      .from('daily_nutrition')
      .update({
        total_calories: totals.calories,
        total_protein: totals.protein,
        total_carbs: totals.carbs,
        total_fat: totals.fat,
      })
      .eq('id', dailyNutrition.id);

    setDailyNutrition({
      ...dailyNutrition,
      total_calories: totals.calories,
      total_protein: totals.protein,
      total_carbs: totals.carbs,
      total_fat: totals.fat,
    });
  };

  const updateGoals = async (field: string, value: number) => {
    if (!user || !preferences) return;

    const updates = { [field]: value };
    await supabase
      .from('nutrition_preferences')
      .update(updates)
      .eq('user_id', user.id);

    setPreferences({ ...preferences, ...updates });

    // Also update today's goals
    if (dailyNutrition) {
      const goalField = field.replace('daily_', '') as keyof DailyNutrition;
      await supabase
        .from('daily_nutrition')
        .update({ [goalField]: value })
        .eq('id', dailyNutrition.id);

      setDailyNutrition({ ...dailyNutrition, [goalField]: value });
    }
  };

  const resetForm = () => {
    setNewMeal({
      meal_name: "",
      meal_type: "snack",
      serving_multiplier: 1,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    });
    setSelectedFood(null);
    setSearchQuery("");
    setSearchResults([]);
    setIsDialogOpen(false);
  };

  const totalCalories = dailyNutrition?.total_calories || 0;
  const totalProtein = dailyNutrition?.total_protein || 0;
  const totalCarbs = dailyNutrition?.total_carbs || 0;
  const totalFat = dailyNutrition?.total_fat || 0;
  const calorieGoal = dailyNutrition?.calorie_goal || 2000;
  const proteinGoal = dailyNutrition?.protein_goal || 150;
  const carbsGoal = dailyNutrition?.carbs_goal || 200;
  const fatGoal = dailyNutrition?.fat_goal || 65;
  const caloriesRemaining = calorieGoal - totalCalories;
  const progress = Math.min((totalCalories / calorieGoal) * 100, 100);

  const getMealTypeColor = (type: string) => {
    switch (type) {
      case 'breakfast': return 'bg-yellow-500';
      case 'lunch': return 'bg-blue-500';
      case 'dinner': return 'bg-purple-500';
      case 'snack': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Please log in to track your nutrition.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Nutrition Tracker</h2>
          <p className="text-muted-foreground">Track your daily nutrition and reach your goals</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Log Meal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Log Meal</DialogTitle>
              <DialogDescription>Search for a food or enter nutritional information manually</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Food Search */}
              <div className="space-y-2">
                <Label>Search Food Database</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search foods..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      searchFoods(e.target.value);
                    }}
                    className="pl-9"
                  />
                </div>
                {searchResults.length > 0 && (
                  <div className="border rounded-md max-h-60 overflow-y-auto">
                    {searchResults.map((food) => (
                      <div
                        key={food.id}
                        className="p-3 hover:bg-accent cursor-pointer border-b last:border-b-0"
                        onClick={() => selectFood(food)}
                      >
                        <div className="font-medium">{food.brand ? `${food.brand} - ` : ''}{food.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {food.calories} cal | {food.serving_size} {food.serving_unit}
                          {food.category && <Badge variant="outline" className="ml-2">{food.category}</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedFood && (
                <div className="p-3 bg-accent rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{selectedFood.brand ? `${selectedFood.brand} - ` : ''}{selectedFood.name}</div>
                    <Badge>{selectedFood.category}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Serving: {selectedFood.serving_size} {selectedFood.serving_unit}
                  </div>
                </div>
              )}

              {/* Meal Type */}
              <div className="space-y-2">
                <Label htmlFor="meal-type">Meal Type</Label>
                <Select
                  value={newMeal.meal_type}
                  onValueChange={(value: "breakfast" | "lunch" | "dinner" | "snack") =>
                    setNewMeal({ ...newMeal, meal_type: value })
                  }
                >
                  <SelectTrigger id="meal-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Serving Multiplier */}
              {selectedFood && (
                <div className="space-y-2">
                  <Label htmlFor="serving-multiplier">Number of Servings</Label>
                  <Input
                    id="serving-multiplier"
                    type="number"
                    step="0.25"
                    min="0.25"
                    value={newMeal.serving_multiplier}
                    onChange={(e) => updateServingMultiplier(parseFloat(e.target.value) || 1)}
                  />
                </div>
              )}

              {/* Meal Name */}
              <div className="space-y-2">
                <Label htmlFor="meal-name">Meal Name</Label>
                <Input
                  id="meal-name"
                  value={newMeal.meal_name}
                  onChange={(e) => setNewMeal({ ...newMeal, meal_name: e.target.value })}
                  placeholder="e.g., Grilled Chicken Breast"
                />
              </div>

              {/* Nutrition Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="calories">Calories</Label>
                  <Input
                    id="calories"
                    type="number"
                    value={newMeal.calories || ""}
                    onChange={(e) =>
                      setNewMeal({ ...newMeal, calories: parseInt(e.target.value) || 0 })
                    }
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="protein">Protein (g)</Label>
                  <Input
                    id="protein"
                    type="number"
                    step="0.1"
                    value={newMeal.protein || ""}
                    onChange={(e) =>
                      setNewMeal({ ...newMeal, protein: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carbs">Carbs (g)</Label>
                  <Input
                    id="carbs"
                    type="number"
                    step="0.1"
                    value={newMeal.carbs || ""}
                    onChange={(e) =>
                      setNewMeal({ ...newMeal, carbs: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fat">Fat (g)</Label>
                  <Input
                    id="fat"
                    type="number"
                    step="0.1"
                    value={newMeal.fat || ""}
                    onChange={(e) =>
                      setNewMeal({ ...newMeal, fat: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={addMeal} className="flex-1">
                  <Utensils className="mr-2 h-4 w-4" />
                  Log Meal
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calories</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCalories} / {calorieGoal}</div>
            <p className="text-xs text-muted-foreground">
              {caloriesRemaining > 0 ? `${caloriesRemaining} remaining` : `${Math.abs(caloriesRemaining)} over`}
            </p>
            <div className="w-full bg-secondary rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  progress > 100 ? "bg-destructive" : "bg-primary"
                }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protein</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProtein.toFixed(1)}g</div>
            <p className="text-xs text-muted-foreground">Goal: {proteinGoal}g</p>
            <div className="w-full bg-secondary rounded-full h-2 mt-2">
              <div
                className="h-2 rounded-full bg-blue-500 transition-all"
                style={{ width: `${Math.min((totalProtein / proteinGoal) * 100, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carbs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCarbs.toFixed(1)}g</div>
            <p className="text-xs text-muted-foreground">Goal: {carbsGoal}g</p>
            <div className="w-full bg-secondary rounded-full h-2 mt-2">
              <div
                className="h-2 rounded-full bg-yellow-500 transition-all"
                style={{ width: `${Math.min((totalCarbs / carbsGoal) * 100, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFat.toFixed(1)}g</div>
            <p className="text-xs text-muted-foreground">Goal: {fatGoal}g</p>
            <div className="w-full bg-secondary rounded-full h-2 mt-2">
              <div
                className="h-2 rounded-full bg-orange-500 transition-all"
                style={{ width: `${Math.min((totalFat / fatGoal) * 100, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Meals</CardTitle>
          <CardDescription>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : todayMeals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No meals logged today. Start tracking your nutrition!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Meal</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-right">Calories</TableHead>
                  <TableHead className="text-right">Protein</TableHead>
                  <TableHead className="text-right">Carbs</TableHead>
                  <TableHead className="text-right">Fat</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todayMeals.map((meal) => (
                  <TableRow key={meal.id}>
                    <TableCell>
                      <Badge className={getMealTypeColor(meal.meal_type)}>
                        {meal.meal_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{meal.meal_name}</TableCell>
                    <TableCell>
                      {new Date(meal.logged_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="text-right">{meal.calories}</TableCell>
                    <TableCell className="text-right">{meal.protein.toFixed(1)}g</TableCell>
                    <TableCell className="text-right">{meal.carbs.toFixed(1)}g</TableCell>
                    <TableCell className="text-right">{meal.fat.toFixed(1)}g</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMeal(meal.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-semibold bg-accent">
                  <TableCell>Total</TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell className="text-right">{totalCalories}</TableCell>
                  <TableCell className="text-right">{totalProtein.toFixed(1)}g</TableCell>
                  <TableCell className="text-right">{totalCarbs.toFixed(1)}g</TableCell>
                  <TableCell className="text-right">{totalFat.toFixed(1)}g</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
