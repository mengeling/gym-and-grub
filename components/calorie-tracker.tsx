"use client";

import { useState } from "react";
import { Plus, Trash2, Target, TrendingUp } from "lucide-react";
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
import type { Meal, DailyCalories } from "@/lib/types";

export function CalorieTracker() {
  const [targetCalories, setTargetCalories] = useState(2000);
  const [todayMeals, setTodayMeals] = useState<Meal[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMeal, setNewMeal] = useState({
    name: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  const totalCalories = todayMeals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = todayMeals.reduce((sum, meal) => sum + (meal.protein || 0), 0);
  const totalCarbs = todayMeals.reduce((sum, meal) => sum + (meal.carbs || 0), 0);
  const totalFat = todayMeals.reduce((sum, meal) => sum + (meal.fat || 0), 0);
  const caloriesRemaining = targetCalories - totalCalories;
  const progress = Math.min((totalCalories / targetCalories) * 100, 100);

  const addMeal = () => {
    if (!newMeal.name || newMeal.calories <= 0) return;

    const meal: Meal = {
      id: Date.now().toString(),
      name: newMeal.name,
      calories: newMeal.calories,
      protein: newMeal.protein || undefined,
      carbs: newMeal.carbs || undefined,
      fat: newMeal.fat || undefined,
      time: new Date().toISOString(),
    };

    setTodayMeals([...todayMeals, meal]);
    setNewMeal({ name: "", calories: 0, protein: 0, carbs: 0, fat: 0 });
    setIsDialogOpen(false);
  };

  const removeMeal = (mealId: string) => {
    setTodayMeals(todayMeals.filter((m) => m.id !== mealId));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Calorie Tracker</h2>
          <p className="text-muted-foreground">Track your daily nutrition intake</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Meal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Meal</DialogTitle>
              <DialogDescription>Log your meal and nutritional information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meal-name">Meal Name</Label>
                <Input
                  id="meal-name"
                  value={newMeal.name}
                  onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                  placeholder="e.g., Grilled Chicken Breast"
                />
              </div>
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
                    value={newMeal.fat || ""}
                    onChange={(e) =>
                      setNewMeal({ ...newMeal, fat: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="0"
                  />
                </div>
              </div>
              <Button onClick={addMeal} className="w-full">
                Add Meal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Target Calories</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{targetCalories}</div>
            <div className="flex items-center space-x-2 mt-2">
              <Input
                type="number"
                value={targetCalories}
                onChange={(e) => setTargetCalories(parseInt(e.target.value) || 2000)}
                className="w-24 h-8 text-sm"
              />
              <span className="text-xs text-muted-foreground">cal/day</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consumed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCalories}</div>
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
            <CardTitle className="text-sm font-medium">Macros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Protein:</span>
                <span className="font-medium">{totalProtein}g</span>
              </div>
              <div className="flex justify-between">
                <span>Carbs:</span>
                <span className="font-medium">{totalCarbs}g</span>
              </div>
              <div className="flex justify-between">
                <span>Fat:</span>
                <span className="font-medium">{totalFat}g</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Meals</CardTitle>
          <CardDescription>{new Date().toLocaleDateString()}</CardDescription>
        </CardHeader>
        <CardContent>
          {todayMeals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No meals logged today. Add your first meal to get started!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Meal</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Calories</TableHead>
                  <TableHead>Protein</TableHead>
                  <TableHead>Carbs</TableHead>
                  <TableHead>Fat</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todayMeals.map((meal) => (
                  <TableRow key={meal.id}>
                    <TableCell className="font-medium">{meal.name}</TableCell>
                    <TableCell>
                      {new Date(meal.time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>{meal.calories}</TableCell>
                    <TableCell>{meal.protein || "-"}</TableCell>
                    <TableCell>{meal.carbs || "-"}</TableCell>
                    <TableCell>{meal.fat || "-"}</TableCell>
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
                <TableRow className="font-semibold">
                  <TableCell>Total</TableCell>
                  <TableCell></TableCell>
                  <TableCell>{totalCalories}</TableCell>
                  <TableCell>{totalProtein}</TableCell>
                  <TableCell>{totalCarbs}</TableCell>
                  <TableCell>{totalFat}</TableCell>
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

