"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, TrendingUp, Scale, Ruler, Activity } from "lucide-react";
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
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import type { BodyMeasurement } from "@/lib/types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function BodyMeasurements() {
  const { user } = useAuth();
  const supabase = createClient();

  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newMeasurement, setNewMeasurement] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: 0,
    bodyFatPercentage: 0,
    chest: 0,
    waist: 0,
    hips: 0,
    arms: 0,
    thighs: 0,
    calves: 0,
    notes: "",
  });

  useEffect(() => {
    if (user) {
      loadMeasurements();
    }
  }, [user]);

  const loadMeasurements = async () => {
    if (!user) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from('body_measurements')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (data) {
      const formattedData = data.map(m => ({
        id: m.id,
        date: m.date,
        weight: m.weight,
        bodyFatPercentage: m.body_fat_percentage,
        measurements: {
          chest: m.chest,
          waist: m.waist,
          hips: m.hips,
          arms: m.arms,
          thighs: m.thighs,
          calves: m.calves,
        },
        notes: m.notes,
      }));
      setMeasurements(formattedData);
    }
    setIsLoading(false);
  };

  const addMeasurement = async () => {
    if (!user) return;

    const measurement = {
      user_id: user.id,
      date: newMeasurement.date,
      weight: newMeasurement.weight || null,
      body_fat_percentage: newMeasurement.bodyFatPercentage || null,
      chest: newMeasurement.chest || null,
      waist: newMeasurement.waist || null,
      hips: newMeasurement.hips || null,
      arms: newMeasurement.arms || null,
      thighs: newMeasurement.thighs || null,
      calves: newMeasurement.calves || null,
      notes: newMeasurement.notes || null,
    };

    const { data, error } = await supabase
      .from('body_measurements')
      .insert(measurement)
      .select()
      .single();

    if (data) {
      await loadMeasurements();
      resetForm();
    }
  };

  const removeMeasurement = async (measurementId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('body_measurements')
      .delete()
      .eq('id', measurementId)
      .eq('user_id', user.id);

    if (!error) {
      setMeasurements(measurements.filter(m => m.id !== measurementId));
    }
  };

  const resetForm = () => {
    setNewMeasurement({
      date: new Date().toISOString().split('T')[0],
      weight: 0,
      bodyFatPercentage: 0,
      chest: 0,
      waist: 0,
      hips: 0,
      arms: 0,
      thighs: 0,
      calves: 0,
      notes: "",
    });
    setIsDialogOpen(false);
  };

  // Calculate stats
  const latestMeasurement = measurements[0];
  const weightChange = measurements.length >= 2
    ? (measurements[0].weight || 0) - (measurements[1].weight || 0)
    : 0;
  const bodyFatChange = measurements.length >= 2
    ? (measurements[0].bodyFatPercentage || 0) - (measurements[1].bodyFatPercentage || 0)
    : 0;

  // Prepare chart data (last 10 measurements)
  const chartData = measurements
    .slice(0, 10)
    .reverse()
    .map(m => ({
      date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: m.weight || 0,
      bodyFat: m.bodyFatPercentage || 0,
    }));

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Please log in to track your body measurements.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Body Measurements</h2>
          <p className="text-muted-foreground">Track your physical progress over time</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Measurement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Body Measurement</DialogTitle>
              <DialogDescription>Record your current body measurements and weight</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newMeasurement.date}
                  onChange={(e) => setNewMeasurement({ ...newMeasurement, date: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (lbs)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={newMeasurement.weight || ""}
                    onChange={(e) => setNewMeasurement({ ...newMeasurement, weight: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bodyFat">Body Fat %</Label>
                  <Input
                    id="bodyFat"
                    type="number"
                    step="0.1"
                    value={newMeasurement.bodyFatPercentage || ""}
                    onChange={(e) => setNewMeasurement({ ...newMeasurement, bodyFatPercentage: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Body Measurements (inches)</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="chest" className="text-xs">Chest</Label>
                    <Input
                      id="chest"
                      type="number"
                      step="0.25"
                      value={newMeasurement.chest || ""}
                      onChange={(e) => setNewMeasurement({ ...newMeasurement, chest: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="waist" className="text-xs">Waist</Label>
                    <Input
                      id="waist"
                      type="number"
                      step="0.25"
                      value={newMeasurement.waist || ""}
                      onChange={(e) => setNewMeasurement({ ...newMeasurement, waist: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hips" className="text-xs">Hips</Label>
                    <Input
                      id="hips"
                      type="number"
                      step="0.25"
                      value={newMeasurement.hips || ""}
                      onChange={(e) => setNewMeasurement({ ...newMeasurement, hips: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="arms" className="text-xs">Arms</Label>
                    <Input
                      id="arms"
                      type="number"
                      step="0.25"
                      value={newMeasurement.arms || ""}
                      onChange={(e) => setNewMeasurement({ ...newMeasurement, arms: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="thighs" className="text-xs">Thighs</Label>
                    <Input
                      id="thighs"
                      type="number"
                      step="0.25"
                      value={newMeasurement.thighs || ""}
                      onChange={(e) => setNewMeasurement({ ...newMeasurement, thighs: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="calves" className="text-xs">Calves</Label>
                    <Input
                      id="calves"
                      type="number"
                      step="0.25"
                      value={newMeasurement.calves || ""}
                      onChange={(e) => setNewMeasurement({ ...newMeasurement, calves: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={newMeasurement.notes}
                  onChange={(e) => setNewMeasurement({ ...newMeasurement, notes: e.target.value })}
                  placeholder="Optional notes..."
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={addMeasurement} className="flex-1">
                  <Scale className="mr-2 h-4 w-4" />
                  Add Measurement
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
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestMeasurement?.weight ? `${latestMeasurement.weight} lbs` : '-'}
            </div>
            {weightChange !== 0 && (
              <p className={`text-xs ${weightChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
                {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} lbs from last
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Body Fat %</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestMeasurement?.bodyFatPercentage ? `${latestMeasurement.bodyFatPercentage}%` : '-'}
            </div>
            {bodyFatChange !== 0 && (
              <p className={`text-xs ${bodyFatChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
                {bodyFatChange > 0 ? '+' : ''}{bodyFatChange.toFixed(1)}% from last
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <Ruler className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{measurements.length}</div>
            <p className="text-xs text-muted-foreground">Measurements recorded</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Weight Progress</CardTitle>
            <CardDescription>Your weight and body fat trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="weight" stroke="#8884d8" name="Weight (lbs)" />
                <Line yAxisId="right" type="monotone" dataKey="bodyFat" stroke="#82ca9d" name="Body Fat %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Measurements Table */}
      <Card>
        <CardHeader>
          <CardTitle>Measurement History</CardTitle>
          <CardDescription>All your recorded body measurements</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : measurements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No measurements recorded yet. Add your first measurement to start tracking!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Body Fat %</TableHead>
                  <TableHead>Chest</TableHead>
                  <TableHead>Waist</TableHead>
                  <TableHead>Hips</TableHead>
                  <TableHead>Arms</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {measurements.map((measurement) => (
                  <TableRow key={measurement.id}>
                    <TableCell className="font-medium">
                      {new Date(measurement.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{measurement.weight ? `${measurement.weight} lbs` : '-'}</TableCell>
                    <TableCell>{measurement.bodyFatPercentage ? `${measurement.bodyFatPercentage}%` : '-'}</TableCell>
                    <TableCell>{measurement.measurements?.chest ? `${measurement.measurements.chest}"` : '-'}</TableCell>
                    <TableCell>{measurement.measurements?.waist ? `${measurement.measurements.waist}"` : '-'}</TableCell>
                    <TableCell>{measurement.measurements?.hips ? `${measurement.measurements.hips}"` : '-'}</TableCell>
                    <TableCell>{measurement.measurements?.arms ? `${measurement.measurements.arms}"` : '-'}</TableCell>
                    <TableCell className="max-w-xs truncate">{measurement.notes || '-'}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMeasurement(measurement.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
