import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { createClient } from "@/lib/supabase/server";

const execAsync = promisify(exec);

// Store payment status in memory (in production, use a database)
const paymentStatus = new Map<
  string,
  {
    status: string;
    planId: string;
    amount: number;
    invoice?: string;
    sats: number;
  }
>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, planId, description, userId } = body;

    if (!amount || !planId) {
      return NextResponse.json(
        { error: "Amount and planId are required" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      );
    }

    // Convert USD to sats (approximate: 1 USD ≈ 3000 sats)
    // In production, use a real-time exchange rate API
    const sats = Math.round(amount * 3000);

    // Generate a unique payment ID
    const paymentId = `pay_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Create Lightning invoice for receiving payment
    // Note: Lightning invoices have built-in payment tracking
    try {
      // Create a Lightning invoice using bark CLI
      const { stdout: invoiceStdout, stderr: invoiceStderr } = await execAsync(
        `bark lightning invoice "${sats} sats" --quiet 2>&1`
      );

      let invoiceData;
      try {
        // Parse JSON from stdout (may contain log messages, so find the JSON object)
        const jsonMatch = invoiceStdout.match(/\{[\s\S]*"invoice"[\s\S]*\}/);
        if (jsonMatch) {
          invoiceData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found in bark output");
        }
      } catch (parseError) {
        console.error("Failed to parse bark output:", parseError);
        console.error("Bark stdout:", invoiceStdout);
        console.error("Bark stderr:", invoiceStderr);
        return NextResponse.json(
          {
            error: "Failed to create invoice: Invalid response from bark CLI",
            details: invoiceStderr || invoiceStdout,
          },
          { status: 500 }
        );
      }

      // Validate that we got a real invoice
      const invoiceString = invoiceData.invoice || invoiceData.payment_request;
      if (
        !invoiceString ||
        invoiceString.includes("placeholder") ||
        invoiceString.includes("mock")
      ) {
        return NextResponse.json(
          {
            error:
              "Failed to create invoice: Invalid invoice received from bark",
            details: "Bark returned an invalid or placeholder invoice",
          },
          { status: 500 }
        );
      }

      // Calculate subscription expiration date
      const now = new Date();
      const expiresAt = new Date();
      if (planId === "monthly") {
        expiresAt.setMonth(now.getMonth() + 1);
      } else if (planId === "yearly") {
        expiresAt.setFullYear(now.getFullYear() + 1);
      }

      // Save subscription to database
      const supabase = await createClient();
      const { error: dbError } = await supabase.from("subscriptions").insert({
        user_id: userId,
        plan_id: planId,
        status: "pending",
        amount,
        payment_id: paymentId,
        invoice: invoiceString,
        expires_at: expiresAt.toISOString(),
      });

      if (dbError) {
        console.error("Failed to save subscription to database:", dbError);
        // Continue anyway - we'll still return the invoice
      }

      // Store payment status in memory (for backward compatibility)
      paymentStatus.set(paymentId, {
        status: "pending",
        planId,
        amount,
        invoice: invoiceString,
        sats,
      });

      console.log(
        `Payment ${paymentId} created: invoice=${invoiceString.substring(
          0,
          50
        )}..., sats=${sats}, userId=${userId}`
      );

      return NextResponse.json({
        paymentId,
        invoice: invoiceString,
        sats,
        amount,
      });
    } catch (error: any) {
      console.error("Bark address creation error:", error);

      // Check if it's a command not found error
      if (error.code === "ENOENT" || error.message?.includes("bark")) {
        return NextResponse.json(
          {
            error: "Bark CLI is not installed or not in PATH",
            details:
              "Please install bark CLI and ensure it's available in your PATH",
          },
          { status: 500 }
        );
      }

      // Return the actual error
      return NextResponse.json(
        {
          error: "Failed to get Ark address",
          details:
            error.message || "Unknown error occurred while getting address",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Payment creation error:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}

// Helper function to update payment status (called by webhook or polling service)
export function updatePaymentStatus(paymentId: string, status: string) {
  const payment = paymentStatus.get(paymentId);
  if (payment) {
    payment.status = status;
    paymentStatus.set(paymentId, payment);
  }
}

export function getPaymentStatus(paymentId: string) {
  return paymentStatus.get(paymentId);
}
