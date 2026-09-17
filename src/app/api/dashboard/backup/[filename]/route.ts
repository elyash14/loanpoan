import { getBackupFile, isValidBackupFilename } from "@database/backup/data";
import { getSession } from "utils/auth/dataAccessLayer";
import { NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{ filename: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
    const session = await getSession();
    if (session?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { filename } = await context.params;

    if (!isValidBackupFilename(filename)) {
        return NextResponse.json({ error: "Invalid backup filename" }, { status: 400 });
    }

    try {
        const { buffer, info } = await getBackupFile(filename);

        return new NextResponse(new Uint8Array(buffer), {
            status: 200,
            headers: {
                "Content-Type": "application/octet-stream",
                "Content-Disposition": `attachment; filename="${info.filename}"`,
                "Content-Length": String(info.sizeBytes),
                "Cache-Control": "private, no-cache, no-store",
            },
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error?.message || "Backup file not found" },
            { status: 404 },
        );
    }
}
