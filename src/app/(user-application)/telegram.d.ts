interface TelegramWebApp {
    ready: () => void;
    expand: () => void;
    initData: string;
    themeParams: {
        bg_color?: string;
        text_color?: string;
        hint_color?: string;
        link_color?: string;
        button_color?: string;
        button_text_color?: string;
        secondary_bg_color?: string;
    };
    colorScheme?: "light" | "dark";
    setHeaderColor: (color: string) => void;
    setBackgroundColor: (color: string) => void;
    onEvent?: (eventType: "themeChanged", callback: () => void) => void;
    offEvent?: (eventType: "themeChanged", callback: () => void) => void;
    BackButton: {
        show: () => void;
        hide: () => void;
        onClick: (cb: () => void) => void;
        offClick: (cb: () => void) => void;
    };
    HapticFeedback?: {
        impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
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
