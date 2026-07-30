import Link from "next/link";
import Button from "@/components/ui/Button";
import { Video, Users, Shield } from "lucide-react";

// Mock meeting room UI illustration
function MockMeetingUI() {
  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-surface border border-border rounded-[8px] p-4 space-y-3">
        {/* Top bar mock */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted font-mono">
            meet.app/a3f9k2
          </span>
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-error/60" />
            <span className="w-2 h-2 rounded-full bg-warning/60" />
            <span className="w-2 h-2 rounded-full bg-success/60" />
          </div>
        </div>

        {/* Video grid mock */}
        <div className="grid grid-cols-2 gap-2">
          {["D", "A", "M", "E"].map((initial, i) => (
            <div
              key={i}
              className="aspect-video bg-background border border-border rounded-[6px] flex items-center justify-center"
            >
              <div className="w-9 h-9 rounded-full bg-accent/15 flex items-center justify-center">
                <span className="text-sm font-semibold text-accent">
                  {initial}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Controls mock */}
        <div className="flex items-center justify-center gap-3 pt-1">
          {[Video, Users, Shield].map((Icon, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-[6px] border border-border flex items-center justify-center bg-background"
            >
              <Icon size={14} className="text-muted" />
            </div>
          ))}
          <div className="w-8 h-8 rounded-[6px] bg-error/10 border border-error/20 flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-error" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HeroSection() {
  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-20 lg:py-32">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left: Copy */}
        <div className="space-y-6">
          <h1
            className="text-[clamp(2.5rem,5vw,3.75rem)] leading-[1.1] font-normal text-foreground"
            style={{ fontFamily: "var(--font-instrument-serif)" }}
          >
            Toplantılar artık
            <br />
            <span className="text-accent">daha basit.</span>
          </h1>
          <p className="text-lg text-muted leading-relaxed max-w-md">
            Tek tıkla toplantı başlat, anında katıl. Karmaşık kurulum yok,
            hesap şartı yok — sadece bağlan.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/register" id="hero-cta-primary">
              <Button size="lg" variant="primary">Ücretsiz Başla</Button>
            </Link>
            <Link href="/login" id="hero-cta-secondary">
              <Button size="lg" variant="outline">Giriş Yap</Button>
            </Link>
          </div>
          <p className="text-xs text-muted">
            Kredi kartı gerekmez · Kurulum yok
          </p>
        </div>

        {/* Right: Mock UI */}
        <div className="flex items-center justify-center">
          <MockMeetingUI />
        </div>
      </div>
    </section>
  );
}
