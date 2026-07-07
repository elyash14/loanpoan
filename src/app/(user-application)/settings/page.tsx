import UserShell from "../components/shell/UserShell";
import SettingsView from "./components/SettingsView";

export default function SettingsPage() {
    return (
        <UserShell titleKey="pages.settings" descriptionKey="pages.settingsDesc" showBack backHref="/more">
            <SettingsView />
        </UserShell>
    );
}
