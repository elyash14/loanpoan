import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import {
    contentTypeForAvatarFile,
    resolveAvatarFilePath,
} from "utils/uploads/avatars";

type RouteContext = {
    params: Promise<{ filename: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
    const { filename } = await context.params;
    const filePath = await resolveAvatarFilePath(filename);

    if (!filePath) {
        return new NextResponse("Not found", { status: 404 });
    }

    try {
        const buffer = await readFile(filePath);
        return new NextResponse(buffer, {
            status: 200,
            headers: {
                "Content-Type": contentTypeForAvatarFile(filename),
                "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
            },
        });
    } catch {
        return new NextResponse("Not found", { status: 404 });
    }
}
