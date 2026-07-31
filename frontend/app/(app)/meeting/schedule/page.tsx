import ScheduleMeetingForm from "@/components/meeting/ScheduleMeetingForm";

export default function ScheduleMeetingPage() {
    return (
        <div className="max-w-lg mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-foreground">
                    Toplantı Planla
                </h1>
                <p className="text-sm text-muted mt-1">
                    İleri bir tarih için toplantı planlayın.
                </p>
            </div>
            <div className="bg-surface border border-border rounded-[8px] p-6">
                <ScheduleMeetingForm />
            </div>
        </div>
    );
}
