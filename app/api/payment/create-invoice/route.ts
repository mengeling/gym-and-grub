import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Store payment status in memory (in production, use a database)
const paymentStatus = new Map<string, { status: string; planId: string; amount: number }>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, planId, description } = body;

    if (!amount || !planId) {
      return NextResponse.json(
        { error: "Amount and planId are required" },
        { status: 400 }
      );
    }

    // Convert USD to sats (approximate: 1 USD ≈ 3000 sats)
    // In production, use a real-time exchange rate API
    const sats = Math.round(amount * 3000);

    // Generate a unique payment ID
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create invoice using bark CLI
    // Note: This requires bark to be installed and configured
    // For production, you might want to use a bark API wrapper or service
    try {
      // This is a placeholder - actual implementation depends on bark SDK/API
      // You may need to configure bark server endpoint and credentials
      const { stdout } = await execAsync(
        `bark invoice ${sats} "${description}" --json || echo '{"invoice":"lnbc_placeholder_invoice"}'`
      );

      let invoiceData;
      try {
        invoiceData = JSON.parse(stdout);
      } catch {
        // Fallback if bark is not available - create a mock invoice
        invoiceData = {
          invoice: `lnbc${sats.toString()}u1p${Date.now().toString()}...mock_invoice`,
          payment_hash: paymentId,
        };
      }

      // Store payment status
      paymentStatus.set(paymentId, {
        status: "pending",
        planId,
        amount,
      });

      // In production, you would:
      // 1. Store the payment in a database
      // 2. Set up a webhook listener for payment confirmations
      // 3. Poll bark service for payment status

      return NextResponse.json({
        paymentId,
        invoice: invoiceData.invoice || invoiceData.payment_request,
        sats,
        amount,
      });
    } catch (error) {
      console.error("Bark invoice creation error:", error);
      // Return mock invoice for development
      return NextResponse.json({
        paymentId,
        invoice: `lnbc${sats.toString()}u1p${Date.now().toString()}...mock_invoice`,
        sats,
        amount,
        warning: "Bark CLI not configured. Using mock invoice for development.",
      });
    }
  } catch (error) {
    console.error("Payment creation error:", error);
    return NextResponse.json(
      { error: "Failed to create payment invoice" },
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

