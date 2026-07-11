export const RECEIPT_MAX_BYTES = 5 * 1024 * 1024;
export const RECEIPT_ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export type ReceiptValidationCode = "invalidType" | "tooLarge" | "empty";

export function formatReceiptFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateReceiptFile(file: File): ReceiptValidationCode | null {
    if (file.size === 0) return "empty";
    if (!RECEIPT_ALLOWED_TYPES.has(file.type)) return "invalidType";
    if (file.size > RECEIPT_MAX_BYTES) return "tooLarge";
    return null;
}

export type PaymentRequestErrorCode =
    | "unauthorized"
    | "noScreenshot"
    | "invalidType"
    | "tooLarge"
    | "empty"
    | "invalidAmount"
    | "invalidPayload"
    | "noItems"
    | "itemsNotFound"
    | "unauthorizedSelection"
    | "alreadyPaid"
    | "pendingRequest"
    | "amountMismatch"
    | "telegramFailed"
    | "networkError"
    | "serverTooLarge"
    | "unknown";

export type PaymentRequestResult = {
    status: "SUCCESS" | "ERROR";
    message?: string;
    code?: PaymentRequestErrorCode;
    paymentRequest?: { id: number; messageId?: number };
};

export function mapHttpErrorToPaymentResult(status: number, body?: PaymentRequestResult): PaymentRequestResult {
    if (body?.code || body?.message) {
        return body;
    }
    if (status === 401 || status === 403) {
        return { status: "ERROR", code: "unauthorized", message: "Unauthorized" };
    }
    if (status === 413) {
        return {
            status: "ERROR",
            code: "serverTooLarge",
            message: "The upload was too large for the server. Try a smaller screenshot (under 5 MB).",
        };
    }
    return { status: "ERROR", code: "unknown", message: "Submission failed" };
}

export function resolvePaymentRequestError(
    t: (key: string, params?: Record<string, string | number>) => string,
    code?: PaymentRequestErrorCode,
    fallback?: string,
): string {
    if (code) {
        const key = `receipt.errors.${code}`;
        const translated = t(key);
        if (translated !== key) return translated;
    }
    return fallback ?? t("receipt.error");
}

export async function submitPaymentReceipt(formData: FormData): Promise<PaymentRequestResult> {
    try {
        const response = await fetch("/api/user/payment-requests", {
            method: "POST",
            body: formData,
        });

        let body: PaymentRequestResult | undefined;
        try {
            body = (await response.json()) as PaymentRequestResult;
        } catch {
            // Response body is not JSON (e.g. HTML error page).
        }

        if (!response.ok) {
            return mapHttpErrorToPaymentResult(response.status, body);
        }

        return body ?? { status: "ERROR", code: "unknown", message: "Submission failed" };
    } catch {
        return { status: "ERROR", code: "networkError", message: "Network error" };
    }
}
