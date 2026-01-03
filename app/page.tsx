"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GymLogbook } from "@/components/gym-logbook";
import { CalorieTracker } from "@/components/calorie-tracker";
import { PaymentComponent } from "@/components/payment";
import { Dumbbell, UtensilsCrossed, CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";
import { UserAccountMenu } from "@/components/user-account-menu";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Gym and Grub
            </h1>
            <p className="text-muted-foreground">
              Track your fitness journey with our comprehensive gym logbook and
              calorie tracker
            </p>
          </div>
          <UserAccountMenu />
        </div>

        <Tabs defaultValue="gym" className="w-full">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="gym" className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              Gym Logbook
            </TabsTrigger>
            <TabsTrigger value="calories" className="flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4" />
              Calorie Tracker
            </TabsTrigger>
            <TabsTrigger value="premium" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Premium
            </TabsTrigger>
          </TabsList>
          <TabsContent value="gym" className="mt-6">
            <GymLogbook />
          </TabsContent>
          <TabsContent value="calories" className="mt-6">
            <CalorieTracker />
          </TabsContent>
          <TabsContent value="premium" className="mt-6">
            <PaymentComponent />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
