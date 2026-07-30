import MeetingCard from "@/components/dashboard/MeetingCard";
import QuickActions from "@/components/dashboard/QuickActions";

const mockMeetings = [
  {
    id: "a3f9k2",
    title: "Haftalık Ekip Toplantısı",
    time: "Bugün, 14:00",
    participants: 6,
    status: "live" as const,
  },
  {
    id: "b7x1p4",
    title: "Ürün Demo — Q3",
    time: "Yarın, 10:00",
    participants: 12,
    status: "upcoming" as const,
  },
  {
    id: "c2m8n9",
    title: "Tasarım İncelemesi",
    time: "Perşembe, 16:30",
    participants: 4,
    status: "upcoming" as const,
  },
];

export default function DashboardPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Karşılama */}
      <div>
        <h1 className="text-3xl font-semibold text-foreground">
          Merhaba, Dogukan 👋
        </h1>
        <p className="text-sm text-muted mt-1">
          Yaklaşan toplantılarına göz at veya hemen bir tane başlat.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-6 items-start">
        {/* Toplantı listesi */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">
            Yaklaşan Toplantılar
          </h2>
          {mockMeetings.map((meeting) => (
            <MeetingCard key={meeting.id} {...meeting} />
          ))}
        </div>

        {/* Quick Actions */}
        <QuickActions />
      </div>
    </div>
  );
}
