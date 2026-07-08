import { generateAllUndueInstallments } from "@database/installments/actions";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const authHeader = request.headers.get("authorization") ?? "";
    const [authType, token] = authHeader.split(" ");

    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
        console.error("CRON_SECRET environment variable is not defined");
        return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
    }

    if (authType !== "Bearer" || !token || token !== cronSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const result = await generateAllUndueInstallments();
        if (result.status === "SUCCESS") {
            return NextResponse.json({ success: true, message: result.message });
        } else {
            return NextResponse.json({ success: false, error: result.message }, { status: 500 });
        }
    } catch (error: any) {
        console.error("Error generating installments in cron endpoint:", error);
        return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
