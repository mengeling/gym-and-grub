import { NextRequest, NextResponse } from "next/server";
import {
  getPaymentStatus,
  updatePaymentStatus,
} from "../../create-invoice/route";
import { exec } from "child_process";
import { promisify } from "util";
import { createClient } from "@/lib/supabase/server";

const execAsync = promisify(exec);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { paymentId } = await params;
    const payment = getPaymentStatus(paymentId);

    // If payment not found (e.g., server restarted, in-memory storage cleared),
    // return pending status instead of 404 to allow polling to continue gracefully
    if (!payment) {
      return NextResponse.json({
        paymentId,
        status: "pending",
        planId: null,
        amount: null,
      });
    }

    // Check payment status with bark
    // In production, you would:
    // 1. Check payment status via bark API
    // 2. Use webhooks for real-time updates
    // 3. Query your database for payment status

    // Check payment status using Lightning invoice status (most reliable method)
    try {
      // Use the invoice string stored with the payment to check status
      if (payment.invoice) {
        // First, run maintain to claim any pending payments
        try {
          await execAsync(`bark maintain --quiet 2>&1 || true`);
        } catch (maintainError) {
          // Silently ignore maintain errors (wallet might not be configured)
        }

        // Check the invoice status directly
        const { stdout } = await execAsync(
          `bark lightning status "${payment.invoice}" --quiet 2>&1 || echo '{"status":"pending"}'`
        );

        let statusData;
        try {
          // Parse JSON from stdout (may contain log messages, so find the JSON object)
          const jsonMatch = stdout.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            statusData = JSON.parse(jsonMatch[0]);
            // Check if invoice is paid (bark may return different status fields)
            if (
              statusData.status === "paid" ||
              statusData.paid === true ||
              statusData.settled === true ||
              statusData.preimage_revealed_at !== null
            ) {
              console.log(
                `Payment ${paymentId} marked as paid! Invoice status:`,
                statusData
              );
              updatePaymentStatus(paymentId, "paid");
              payment.status = "paid";

              // Update subscription in database to active
              const supabase = await createClient();
              const { error: updateError } = await supabase
                .from("subscriptions")
                .update({
                  status: "active",
                  started_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq("payment_id", paymentId);

              if (updateError) {
                console.error(
                  "Failed to update subscription status:",
                  updateError
                );
              } else {
                console.log(
                  `Subscription activated for payment ${paymentId}`
                );
              }
            } else {
              console.log(
                `Payment ${paymentId} still pending. Invoice status:`,
                statusData
              );
            }
          }
        } catch (parseError) {
          console.error(
            "Failed to parse invoice status:",
            parseError,
            "stdout:",
            stdout
          );
        }
      }
    } catch (error: any) {
      // Bark not available - silently handle (expected in development)
      // Only log if it's an unexpected error (not command not found)
      if (
        error?.code !== "ENOENT" &&
        error?.message &&
        !error.message.includes("bark")
      ) {
        console.error("Bark status check error:", error);
      }
    }

    return NextResponse.json({
      paymentId,
      status: payment.status,
      planId: payment.planId,
      amount: payment.amount,
    });
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json(
      { error: "Failed to check payment status" },
      { status: 500 }
    );
  }
}
