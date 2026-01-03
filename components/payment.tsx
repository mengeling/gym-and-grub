"use client";

import { useState, useRef, useEffect } from "react";
import { CreditCard, CheckCircle2, Loader2 } from "lucide-react";
import { QRCode } from "react-qr-code";
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
import { useAuth } from "@/contexts/auth-context";

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
  const { user, refreshSubscription } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [bolt11Invoice, setBolt11Invoice] = useState("");
  const [paymentSats, setPaymentSats] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handlePayment = async (plan: PaymentPlan) => {
    if (!user?.id) {
      alert("Please sign in to make a payment");
      return;
    }

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
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.details || "Failed to create invoice";
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Validate that we got a real invoice
      if (!data.invoice || data.invoice.includes("placeholder") || data.invoice.includes("mock")) {
        throw new Error("Invalid invoice received from server");
      }
      
      setBolt11Invoice(data.invoice);
      setPaymentSats(data.sats || 0);

      // Poll for payment status
      pollPaymentStatus(data.paymentId);
    } catch (error) {
      console.error("Payment error:", error);
      setIsProcessing(false);
      const errorMessage = error instanceof Error ? error.message : "Failed to create payment. Please try again.";
      alert(errorMessage);
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
          pollingIntervalRef.current = null;
          setIsProcessing(false);
          setPaymentSuccess(true);
          // Refresh subscription status to update premium status
          refreshSubscription();
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          pollingIntervalRef.current = null;
          setIsProcessing(false);
          alert("Payment timeout. Please try again.");
        }
      } catch (error) {
        console.error("Status check error:", error);
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          pollingIntervalRef.current = null;
          setIsProcessing(false);
        }
      }
    }, 5000); // Check every 5 seconds

    pollingIntervalRef.current = interval;
  };

  const cancelPayment = () => {
    // Clear polling interval if it exists
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    // Reset all state
    setIsProcessing(false);
    setPaymentSuccess(false);
    setBolt11Invoice("");
    setPaymentSats(0);
    setSelectedPlan(null);
    setIsDialogOpen(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const copyInvoice = () => {
    navigator.clipboard.writeText(bolt11Invoice);
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

      <Dialog 
        open={isDialogOpen} 
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          // If dialog is being closed and payment is in progress, cancel it
          if (!open && isProcessing) {
            cancelPayment();
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg max-w-[95vw] sm:translate-y-[-50%] translate-y-0 top-[5%] sm:top-[50%]">
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
                  setBolt11Invoice("");
                  setPaymentSats(0);
                }}
              >
                Close
              </Button>
            </div>
          ) : (
            <div className="space-y-4 min-w-0">
              {isProcessing && bolt11Invoice ? (
                <>
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-3 sm:p-4 bg-white rounded-lg border-2 border-border w-[160px] sm:w-[200px]">
                      <QRCode
                        value={bolt11Invoice}
                        size={200}
                        level="M"
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Scan with your Lightning wallet
                    </p>
                  </div>
                  <div className="space-y-2 min-w-0">
                    <Label>Lightning Invoice (BOLT11)</Label>
                    <div className="flex gap-2 min-w-0">
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="overflow-x-auto border border-input rounded-md bg-background h-10 flex items-center">
                          <div className="font-mono text-xs px-3 py-2 whitespace-nowrap text-foreground">
                            {bolt11Invoice}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" onClick={copyInvoice} className="flex-shrink-0">
                        Copy
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg min-w-0 overflow-hidden">
                    <p className="text-sm font-semibold mb-2">Pay with Bark CLI:</p>
                    <div className="overflow-x-auto">
                      <code className="text-xs bg-background p-2 rounded block whitespace-nowrap">
                        bark send "{bolt11Invoice}"
                      </code>
                    </div>
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
                onClick={cancelPayment}
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

