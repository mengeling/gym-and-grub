"use client";

import { useState } from "react";
import { CreditCard, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
}

const plans: PaymentPlan[] = [
  {
    id: "monthly",
    name: "Monthly Premium",
    price: 9.99,
    description: "Full access to all features",
    features: [
      "Unlimited workout logs",
      "Advanced calorie tracking",
      "Progress analytics",
      "Export data",
      "Priority support",
    ],
  },
  {
    id: "yearly",
    name: "Yearly Premium",
    price: 99.99,
    description: "Best value - Save 17%",
    features: [
      "Everything in Monthly",
      "Save $20/year",
      "Early access to new features",
      "Custom meal plans",
      "Personal trainer tips",
    ],
  },
];

export function PaymentComponent() {
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [bolt11Invoice, setBolt11Invoice] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handlePayment = async (plan: PaymentPlan) => {
    setSelectedPlan(plan);
    setIsProcessing(true);
    setIsDialogOpen(true);

    try {
      // Call API route to create payment invoice with bark SDK
      const response = await fetch("/api/payment/create-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: plan.price,
          planId: plan.id,
          description: `${plan.name} - Gym and Grub Subscription`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create invoice");
      }

      const data = await response.json();
      setBolt11Invoice(data.invoice);

      // Poll for payment status
      pollPaymentStatus(data.paymentId);
    } catch (error) {
      console.error("Payment error:", error);
      setIsProcessing(false);
      alert("Failed to create payment. Please try again.");
    }
  };

  const pollPaymentStatus = async (paymentId: string) => {
    const maxAttempts = 60; // 5 minutes max
    let attempts = 0;

    const interval = setInterval(async () => {
      attempts++;
      try {
        const response = await fetch(`/api/payment/status/${paymentId}`);
        const data = await response.json();

        if (data.status === "paid") {
          clearInterval(interval);
          setIsProcessing(false);
          setPaymentSuccess(true);
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          setIsProcessing(false);
          alert("Payment timeout. Please try again.");
        }
      } catch (error) {
        console.error("Status check error:", error);
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setIsProcessing(false);
        }
      }
    }, 5000); // Check every 5 seconds
  };

  const copyInvoice = () => {
    navigator.clipboard.writeText(bolt11Invoice);
    alert("Invoice copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Upgrade to Premium</h2>
        <p className="text-muted-foreground">
          Unlock advanced features with Lightning payments powered by Bark SDK
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {plans.map((plan) => (
          <Card key={plan.id} className="relative">
            {plan.id === "yearly" && (
              <Badge className="absolute right-4 top-4">Best Value</Badge>
            )}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">
                  {plan.id === "monthly" ? "/month" : "/year"}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                onClick={() => handlePayment(plan)}
                disabled={isProcessing}
              >
                {isProcessing && selectedPlan?.id === plan.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Subscribe with Lightning
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {paymentSuccess ? "Payment Successful!" : "Complete Payment"}
            </DialogTitle>
            <DialogDescription>
              {paymentSuccess
                ? "Your subscription is now active. Enjoy premium features!"
                : selectedPlan
                  ? `Pay $${selectedPlan.price} for ${selectedPlan.name}`
                  : ""}
            </DialogDescription>
          </DialogHeader>
          {paymentSuccess ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center p-6">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  setIsDialogOpen(false);
                  setPaymentSuccess(false);
                  setSelectedPlan(null);
                }}
              >
                Close
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {isProcessing && bolt11Invoice ? (
                <>
                  <div className="space-y-2">
                    <Label>Lightning Invoice (BOLT11)</Label>
                    <div className="flex gap-2">
                      <Input
                        value={bolt11Invoice}
                        readOnly
                        className="font-mono text-xs"
                      />
                      <Button variant="outline" onClick={copyInvoice}>
                        Copy
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Scan this invoice with your Lightning wallet or pay using Bark CLI
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-semibold mb-2">Pay with Bark CLI:</p>
                    <code className="text-xs bg-background p-2 rounded block">
                      bark send {bolt11Invoice}
                    </code>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Waiting for payment confirmation...</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center p-6">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setIsDialogOpen(false);
                  setIsProcessing(false);
                  setSelectedPlan(null);
                }}
                disabled={isProcessing}
              >
                Cancel
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

