import SettingsForm from '@/components/settings/SettingsForm';

export default function SettingsPage() {
    return (
        <div className="animate-fade-in space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your dashboard preferences and configuration.</p>
            </div>

            <SettingsForm />
        </div>
    );
}
