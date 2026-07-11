'use client';

import { useState, useTransition, useRef } from "react";
import { useUserPreferences } from "../preferences/UserPreferencesProvider";
import { useLocaleFormat } from "../preferences/useLocaleFormat";
import BottomDrawer from "../ui/BottomDrawer";
import { Button } from "../ui/button";
import { UploadCloud, CheckCircle2, AlertCircle } from "lucide-react";
import Money from "../preferences/Money";
import {
    formatReceiptFileSize,
    RECEIPT_MAX_BYTES,
    resolvePaymentRequestError,
    submitPaymentReceipt,
    validateReceiptFile,
} from "../../utils/receiptUpload";

type Props = {
    open: boolean;
    onClose: () => void;
    selectedInstallments: number[];
    selectedPayments: number[];
    totalAmount: number;
    onSuccess: () => void;
};

export default function PaymentSubmissionDrawer({
    open,
    onClose,
    selectedInstallments,
    selectedPayments,
    totalAmount,
    onSuccess,
}: Props) {
    const { t } = useUserPreferences();
    const { formatNumber } = useLocaleFormat();
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [isSuccess, setIsSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const maxSizeLabel = formatReceiptFileSize(RECEIPT_MAX_BYTES);

    const setValidationError = (code: NonNullable<ReturnType<typeof validateReceiptFile>>) => {
        setError(resolvePaymentRequestError(t, code));
        setFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;

        setError(null);

        const validationCode = validateReceiptFile(selected);
        if (validationCode) {
            setValidationError(validationCode);
            return;
        }

        setFile(selected);
        setPreviewUrl(URL.createObjectURL(selected));
    };

    const handleSubmit = () => {
        if (!file) {
            setError(resolvePaymentRequestError(t, "noScreenshot"));
            return;
        }

        const validationCode = validateReceiptFile(file);
        if (validationCode) {
            setValidationError(validationCode);
            return;
        }

        if (selectedInstallments.length === 0 && selectedPayments.length === 0) {
            setError(resolvePaymentRequestError(t, "noItems"));
            return;
        }

        setError(null);
        startTransition(async () => {
            const formData = new FormData();
            formData.append("receipt", file);
            formData.append("amount", String(totalAmount));
            formData.append("installments", JSON.stringify(selectedInstallments));
            formData.append("payments", JSON.stringify(selectedPayments));

            const result = await submitPaymentReceipt(formData);
            if (result.status === "SUCCESS") {
                setIsSuccess(true);
                setTimeout(() => {
                    setIsSuccess(false);
                    setFile(null);
                    setPreviewUrl(null);
                    onSuccess();
                    onClose();
                }, 3000);
            } else {
                setError(resolvePaymentRequestError(t, result.code, result.message));
            }
        });
    };

    const handleClose = () => {
        if (isPending) return;
        setFile(null);
        setPreviewUrl(null);
        setError(null);
        setIsSuccess(false);
        onClose();
    };

    return (
        <BottomDrawer
            open={open}
            onClose={handleClose}
            title={t("receipt.title")}
            description={t("receipt.description")}
        >
            <div className="space-y-4 pt-2">
                {isSuccess ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                        <CheckCircle2 className="h-16 w-16 text-emerald-500 animate-bounce" />
                        <h4 className="text-lg font-bold text-foreground">{t("receipt.success")}</h4>
                    </div>
                ) : (
                    <>
                        <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">{t("receipt.selectItems")}</span>
                                <span className="font-semibold text-foreground">
                                    {formatNumber(selectedInstallments.length + selectedPayments.length)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between border-t border-border/40 pt-2 text-base">
                                <span className="font-medium text-muted-foreground">{t("receipt.total")}</span>
                                <span className="font-bold text-primary tabular-nums">
                                    <Money value={String(totalAmount)} />
                                </span>
                            </div>
                        </div>

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="relative flex h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors bg-muted/10 overflow-hidden group"
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                disabled={isPending}
                            />

                            {previewUrl ? (
                                <>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={previewUrl}
                                        alt="Receipt Preview"
                                        className="h-full w-full object-cover transition-transform group-hover:scale-102"
                                    />
                                    <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white text-xs font-semibold flex items-center gap-1.5">
                                            <UploadCloud className="h-4 w-4" />
                                            {t("receipt.selectScreenshot")}
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center p-6 space-y-2 text-muted-foreground group-hover:text-primary transition-colors">
                                    <UploadCloud className="mx-auto h-10 w-10 stroke-1" />
                                    <p className="text-sm font-semibold">{t("receipt.selectScreenshot")}</p>
                                    <p className="text-[11px] text-muted-foreground/80">
                                        {t("receipt.maxSizeHint", { size: maxSizeLabel })}
                                    </p>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="flex items-start gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3.5 text-xs text-destructive">
                                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                <p className="font-medium">{error}</p>
                            </div>
                        )}

                        <div className="pt-2 flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                className="flex-1 rounded-xl"
                                disabled={isPending}
                            >
                                {t("receipt.cancel")}
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                className="flex-1 rounded-xl bg-primary text-primary-foreground font-semibold"
                                disabled={isPending || !file}
                            >
                                {isPending ? t("receipt.uploading") : t("receipt.submit")}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </BottomDrawer>
    );
}
