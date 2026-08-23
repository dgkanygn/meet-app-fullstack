import Link from "next/link";
import Button from "@/components/ui/Button";

export default function CtaSection() {
  return (
    <section className="w-full border-t border-border bg-[color-mix(in_srgb,var(--color-background)_85%,var(--color-border)_15%)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center space-y-6">
        <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">
          Hemen başlamaya hazır mısın?
        </h2>
        <p className="text-base text-muted max-w-md mx-auto">
          Ücretsiz hesap oluştur, dakikalar içinde ilk toplantını başlat.
        </p>
        <Link href="/register" id="cta-section-button">
          <Button size="lg" variant="primary">
            Ücretsiz Hesap Oluştur
          </Button>
        </Link>
      </div>
    </section>
  );
}
