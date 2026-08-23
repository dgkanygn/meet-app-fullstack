import StartMeetingForm from "@/components/meeting/StartMeetingForm";

export default function StartMeetingPage() {
  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">
          Toplantı Başlat
        </h1>
        <p className="text-sm text-muted mt-1">
          Toplantı adını belirle ve bağlantıyı ekibinle paylaş.
        </p>
      </div>
      <div className="rounded-[8px] border border-border bg-surface p-4 sm:p-6">
        <StartMeetingForm />
      </div>
    </div>
  );
}
