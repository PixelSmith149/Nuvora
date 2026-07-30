// app/notifications/page.tsx
import { NotificationBell } from "@/components/NotificationBell";

export default function NotificationsPage() {
    return (
        <main className="min-h-screen bg-black text-white p-4 sm:p-8">
            <NotificationBell />
        </main>
    );
}