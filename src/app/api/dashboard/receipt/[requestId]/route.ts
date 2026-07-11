import prisma from "@database/prisma";
import { fetchTelegramFile } from "utils/telegram/botApi";
import { getSession } from "utils/auth/dataAccessLayer";
import { NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{ requestId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
    const session = await getSession();
    if (session?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requestId } = await context.params;
    const id = Number(requestId);
    if (!Number.isFinite(id)) {
        return NextResponse.json({ error: "Invalid request id" }, { status: 400 });
    }

    const paymentRequest = await prisma.paymentRequest.findUnique({
        where: { id },
        select: { receiptFileId: true },
    });

    if (!paymentRequest?.receiptFileId) {
        return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    try {
        const { buffer, contentType } = await fetchTelegramFile(paymentRequest.receiptFileId);
        return new NextResponse(new Uint8Array(buffer), {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "private, max-age=3600",
            },
        });
    } catch (error) {
        console.error("Failed to fetch Telegram receipt:", error);
        return NextResponse.json({ error: "Failed to load receipt" }, { status: 502 });
    }
}
