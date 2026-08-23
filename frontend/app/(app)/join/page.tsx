import { Suspense } from "react";
import JoinMeetingForm from "@/components/meeting/JoinMeetingForm";

export default function JoinMeetingPage() {
  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">
          Toplantıya Katıl
        </h1>
        <p className="mt-1 text-sm text-muted">
          Toplantı kodunu ya da davet linkini gir.
        </p>
      </div>
      <div className="rounded-[8px] border border-border bg-surface p-4 sm:p-6">
        {/* Form useSearchParams kullanıyor; Suspense sınırı zorunlu. */}
        <Suspense
          fallback={<p className="text-sm text-muted">Yükleniyor...</p>}
        >
          <JoinMeetingForm />
        </Suspense>
      </div>
    </div>
  );
}
