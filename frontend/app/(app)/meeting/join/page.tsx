import JoinMeetingForm from "@/components/meeting/JoinMeetingForm";

export default function JoinMeetingPage() {
  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">
          Toplantıya Katıl
        </h1>
        <p className="text-sm text-muted mt-1">
          Toplantı kodunu ya da davet linkini gir.
        </p>
      </div>
      <div className="bg-surface border border-border rounded-[8px] p-6">
        <JoinMeetingForm />
      </div>
    </div>
  );
}
