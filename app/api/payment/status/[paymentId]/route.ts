import { NextRequest, NextResponse } from "next/server";
import { getPaymentStatus, updatePaymentStatus } from "../../create-invoice/route";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { paymentId } = await params;
    const payment = getPaymentStatus(paymentId);

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Check payment status with bark
    // In production, you would:
    // 1. Check payment status via bark API
    // 2. Use webhooks for real-time updates
    // 3. Query your database for payment status

    // For now, we'll simulate checking with bark CLI
    try {
      // This is a placeholder - actual implementation depends on bark SDK
      // You might check: bark status <payment_hash> or use bark API
      const { stdout } = await execAsync(
        `bark status ${paymentId} --json 2>/dev/null || echo '{"status":"pending"}'`
      );

      let statusData;
      try {
        statusData = JSON.parse(stdout);
        if (statusData.status === "paid" || statusData.paid) {
          updatePaymentStatus(paymentId, "paid");
          payment.status = "paid";
        }
      } catch {
        // If bark is not available, keep current status
      }
    } catch (error) {
      // Bark not available, return stored status
      console.error("Bark status check error:", error);
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

