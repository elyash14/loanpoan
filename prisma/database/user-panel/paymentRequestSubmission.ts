import "server-only";

import { getGlobalConfigs } from "@database/config/data";
import prisma from "@database/prisma";
import { revalidatePath } from "next/cache";
import { DASHBOARD_URL } from "utils/configs";
import type { GlobalConfigType } from "utils/types/configs";
import { sendTelegramPhoto, getTelegramGroupChatId, getTelegramPaymentsTopicId } from "utils/telegram/botApi";
import {
    buildPaymentRequestCaption,
    resolveTelegramMessageLocale,
} from "utils/telegram/paymentRequestMessages";
import {
    RECEIPT_ALLOWED_TYPES,
    RECEIPT_MAX_BYTES,
    type PaymentRequestResult,
} from "@user/utils/receiptUpload";

export async function processPaymentRequestSubmission(
    userId: number,
    formData: FormData,
): Promise<PaymentRequestResult> {
    const file = formData.get("receipt");
    const amountStr = formData.get("amount");
    const installmentIdsStr = formData.get("installments");
    const paymentIdsStr = formData.get("payments");

    if (!(file instanceof File) || file.size === 0) {
        return { status: "ERROR", code: "noScreenshot", message: "No screenshot uploaded" };
    }

    if (!RECEIPT_ALLOWED_TYPES.has(file.type)) {
        return {
            status: "ERROR",
            code: "invalidType",
            message: "Invalid image type. Please upload JPEG, PNG, or WebP.",
        };
    }

    if (file.size > RECEIPT_MAX_BYTES) {
        return {
            status: "ERROR",
            code: "tooLarge",
            message: "Image size must be smaller than 5MB",
        };
    }

    const amount = Number(amountStr);
    if (isNaN(amount) || amount <= 0) {
        return { status: "ERROR", code: "invalidAmount", message: "Invalid payment amount" };
    }

    let installmentIds: number[] = [];
    let paymentIds: number[] = [];
    try {
        installmentIds = installmentIdsStr ? JSON.parse(String(installmentIdsStr)) : [];
        paymentIds = paymentIdsStr ? JSON.parse(String(paymentIdsStr)) : [];
    } catch {
        return { status: "ERROR", code: "invalidPayload", message: "Invalid selection payload" };
    }

    if (installmentIds.length === 0 && paymentIds.length === 0) {
        return { status: "ERROR", code: "noItems", message: "Please select at least one item to pay" };
    }

    const [installments, payments] = await Promise.all([
        installmentIds.length
            ? prisma.installment.findMany({
                  where: { id: { in: installmentIds } },
                  include: {
                      account: { select: { userId: true } },
                      paymentRequest: { select: { status: true } },
                  },
              })
            : Promise.resolve([]),
        paymentIds.length
            ? prisma.payment.findMany({
                  where: { id: { in: paymentIds } },
                  include: {
                      loan: { include: { account: { select: { userId: true } } } },
                      paymentRequest: { select: { status: true } },
                  },
              })
            : Promise.resolve([]),
    ]);

    if (installments.length !== installmentIds.length || payments.length !== paymentIds.length) {
        return { status: "ERROR", code: "itemsNotFound", message: "One or more selected items were not found" };
    }

    for (const inst of installments) {
        if (inst.account?.userId !== userId) {
            return { status: "ERROR", code: "unauthorizedSelection", message: "Unauthorized selection" };
        }
        if (inst.paidAt) {
            return { status: "ERROR", code: "alreadyPaid", message: "One or more installments are already paid" };
        }
        if (inst.paymentRequest?.status === "PENDING") {
            return {
                status: "ERROR",
                code: "pendingRequest",
                message: "One or more installments already have a pending payment request",
            };
        }
    }

    for (const pay of payments) {
        if (pay.loan?.account?.userId !== userId) {
            return { status: "ERROR", code: "unauthorizedSelection", message: "Unauthorized selection" };
        }
        if (pay.paidAt) {
            return { status: "ERROR", code: "alreadyPaid", message: "One or more payments are already paid" };
        }
        if (pay.paymentRequest?.status === "PENDING") {
            return {
                status: "ERROR",
                code: "pendingRequest",
                message: "One or more payments already have a pending payment request",
            };
        }
    }

    const expectedAmount =
        installments.reduce((sum, inst) => sum + Number(inst.amount), 0) +
        payments.reduce((sum, pay) => sum + Number(pay.amount), 0);

    if (Math.abs(expectedAmount - amount) > 0.01) {
        return {
            status: "ERROR",
            code: "amountMismatch",
            message: "Payment amount does not match selected items",
        };
    }

    try {
        const buffer = Buffer.from(await file.arrayBuffer());

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { firstName: true, lastName: true },
        });
        const fullName = user ? `${user.firstName} ${user.lastName}` : `User #${userId}`;

        let paymentRequest: { id: number } | undefined;
        let messageId: number | undefined;

        try {
            paymentRequest = await prisma.paymentRequest.create({
                data: {
                    userId,
                    amount,
                    status: "PENDING",
                    installments: {
                        connect: installmentIds.map((id) => ({ id })),
                    },
                    payments: {
                        connect: paymentIds.map((id) => ({ id })),
                    },
                },
            });

            const chatId = getTelegramGroupChatId();
            const topicId = getTelegramPaymentsTopicId();
            const globalConfig = (await getGlobalConfigs()) as GlobalConfigType;
            const locale = resolveTelegramMessageLocale(globalConfig);

            const caption = buildPaymentRequestCaption(
                {
                    requestId: paymentRequest.id,
                    fullName,
                    amount,
                    installments: installments.map((inst) => ({
                        id: inst.id,
                        amount: Number(inst.amount),
                    })),
                    payments: payments.map((pay) => ({
                        id: pay.id,
                        amount: Number(pay.amount),
                    })),
                },
                locale,
            );

            const tgResult = await sendTelegramPhoto(
                chatId.toString(),
                buffer,
                caption,
                topicId,
            );

            if (!tgResult.file_id) {
                throw new Error("Telegram did not return a receipt file id");
            }

            await prisma.paymentRequest.update({
                where: { id: paymentRequest.id },
                data: {
                    receiptFileId: tgResult.file_id,
                    messageId: tgResult.message_id,
                },
            });
            messageId = tgResult.message_id;
        } catch (tgError) {
            if (paymentRequest) {
                await prisma.paymentRequest.update({
                    where: { id: paymentRequest.id },
                    data: {
                        installments: { set: [] },
                        payments: { set: [] },
                    },
                });
                await prisma.paymentRequest.delete({ where: { id: paymentRequest.id } });
            }
            console.error("Failed to forward payment request to Telegram:", tgError);
            return {
                status: "ERROR",
                code: "telegramFailed",
                message: "Failed to send receipt to Telegram. Please try again.",
            };
        }

        revalidatePath(`/${DASHBOARD_URL}/payment-requests`);
        revalidatePath("/installments");
        revalidatePath("/payments");
        revalidatePath("/home");
        return {
            status: "SUCCESS",
            message: "Payment request submitted successfully. It will be reviewed by administrators.",
            paymentRequest: { id: paymentRequest!.id, messageId },
        };
    } catch (error) {
        console.error("Failed to submit payment request:", error);
        return { status: "ERROR", code: "unknown", message: "Failed to submit payment request" };
    }
}
