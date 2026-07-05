interface TelegramWebApp {
    ready: () => void;
    expand: () => void;
    initData: string;
    themeParams: { bg_color?: string; text_color?: string };
    setHeaderColor: (color: string) => void;
    setBackgroundColor: (color: string) => void;
    BackButton: {
        show: () => void;
        hide: () => void;
        onClick: (cb: () => void) => void;
        offClick: (cb: () => void) => void;
    };
    HapticFeedback?: {
        notificationOccurred: (type: "error" | "success" | "warning") => void;
    };
}

interface TelegramNamespace {
    WebApp: TelegramWebApp;
}

declare global {
    interface Window {
        Telegram?: TelegramNamespace;
    }
}

export {};
