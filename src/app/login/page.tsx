import LoginForm from "./components/LoginForm";
import TelegramLoginRedirect from "./components/TelegramLoginRedirect";

export default function LoginPage() {
    return (
        <>
            <TelegramLoginRedirect />
            <LoginForm />
        </>
    );
}