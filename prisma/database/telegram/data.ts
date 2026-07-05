import prisma from "@database/prisma";
import { TelegramApiUser } from "utils/telegram/botApi";

export function formatTelegramMemberLabel(member: {
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    telegramId: bigint;
}): string {
    const name = [member.firstName, member.lastName].filter(Boolean).join(" ").trim();
    const handle = member.username ? `@${member.username}` : null;
    const id = member.telegramId.toString();
    if (name && handle) return `${name} (${handle}) — ${id}`;
    if (name) return `${name} — ${id}`;
    if (handle) return `${handle} — ${id}`;
    return id;
}

export async function upsertTelegramGroupMember(
    chatId: bigint,
    user: TelegramApiUser,
    status?: string,
) {
    if (user.is_bot) {
        return null;
    }

    return prisma.telegramGroupMember.upsert({
        where: { telegramId: BigInt(user.id) },
        create: {
            telegramId: BigInt(user.id),
            chatId,
            username: user.username ?? null,
            firstName: user.first_name ?? null,
            lastName: user.last_name ?? null,
            isBot: false,
            status: status ?? "member",
            lastSeenAt: new Date(),
        },
        update: {
            chatId,
            username: user.username ?? null,
            firstName: user.first_name ?? null,
            lastName: user.last_name ?? null,
            status: status ?? undefined,
            lastSeenAt: new Date(),
        },
    });
}

export async function paginatedTelegramMembers(
    page: number,
    limit: number,
    search?: string,
    unlinkedOnly = false,
) {
    const where: Record<string, unknown> = { isBot: false };

    if (unlinkedOnly) {
        const linked = await prisma.user.findMany({
            where: { telegramId: { not: null } },
            select: { telegramId: true },
        });
        const linkedIds = linked.map((u) => u.telegramId!);
        if (linkedIds.length) {
            where.telegramId = { notIn: linkedIds };
        }
    }

    if (search) {
        where.OR = [
            { username: { contains: search, mode: "insensitive" } },
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
        ];
    }

    const [members, total, linkedUsers] = await Promise.all([
        prisma.telegramGroupMember.findMany({
            where,
            orderBy: [{ lastSeenAt: "desc" }, { firstName: "asc" }],
            take: limit,
            skip: (page - 1) * limit,
        }),
        prisma.telegramGroupMember.count({ where }),
        prisma.user.findMany({
            where: { telegramId: { not: null } },
            select: {
                id: true,
                fullName: true,
                telegramId: true,
            },
        }),
    ]);

    const linkedByTelegramId = new Map(
        linkedUsers
            .filter((u) => u.telegramId != null)
            .map((u) => [u.telegramId!.toString(), u]),
    );

    const data = members.map((member) => {
        const linked = linkedByTelegramId.get(member.telegramId.toString());
        return {
            id: member.id,
            username: member.username,
            firstName: member.firstName,
            lastName: member.lastName,
            status: member.status,
            lastSeenAt: member.lastSeenAt,
            telegramId: member.telegramId.toString(),
            chatId: member.chatId.toString(),
            linkedUser: linked
                ? { id: linked.id, fullName: linked.fullName }
                : null,
        };
    });

    return { total, data };
}

export async function getTelegramMembersCount() {
    return prisma.telegramGroupMember.count({ where: { isBot: false } });
}

export async function listTelegramMembersForSelect(currentUserId?: number) {
    const [members, linkedUsers] = await Promise.all([
        prisma.telegramGroupMember.findMany({
            where: { isBot: false },
            orderBy: [{ firstName: "asc" }, { username: "asc" }],
        }),
        prisma.user.findMany({
            where: { telegramId: { not: null } },
            select: { id: true, fullName: true, telegramId: true },
        }),
    ]);

    const linkedByTelegramId = new Map(
        linkedUsers
            .filter((u) => u.telegramId != null)
            .map((u) => [u.telegramId!.toString(), u]),
    );

    return members.map((member) => {
        const linked = linkedByTelegramId.get(member.telegramId.toString());
        const isCurrentUser = linked?.id === currentUserId;
        const isTaken = Boolean(linked) && !isCurrentUser;

        return {
            value: member.telegramId.toString(),
            label: formatTelegramMemberLabel(member) + (isTaken ? ` (linked to ${linked!.fullName})` : ""),
            username: member.username ?? "",
            disabled: isTaken,
        };
    });
}
