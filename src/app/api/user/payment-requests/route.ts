import { processPaymentRequestSubmission } from "@database/user-panel/paymentRequestSubmission";
import { getPanelUserSession } from "utils/auth/userSession";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
    const session = await getPanelUserSession();
    if (!session?.userId) {
        return NextResponse.json(
            { status: "ERROR", code: "unauthorized", message: "Unauthorized" },
            { status: 401 },
        );
    }

    try {
        const formData = await request.formData();
        const result = await processPaymentRequestSubmission(Number(session.userId), formData);
        const status = result.status === "SUCCESS" ? 200 : 400;
        return NextResponse.json(result, { status });
    } catch (error) {
        console.error("Payment request API error:", error);
        return NextResponse.json(
            { status: "ERROR", code: "unknown", message: "Failed to submit payment request" },
            { status: 500 },
        );
    }
}
