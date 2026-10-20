import Link from "next/link";
import Logo from "@/components/ui/Logo";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import CtaSection from "@/components/landing/CtaSection";

function LandingNav() {
  return (
    <header className="w-full border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Logo href="/" size="md" />
        <nav className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm text-muted hover:text-foreground transition-colors cursor-pointer"
          >
            Giriş Yap
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium text-accent hover:opacity-80 transition-opacity cursor-pointer"
          >
            Kaydol
          </Link>
        </nav>
      </div>
    </header>
  );
}

function LandingFooter() {
  return (
    <footer className="border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Logo href="/" size="sm" />
        <p className="text-xs text-muted">
          © {new Date().getFullYear()} PulseMeet. Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-dvh">
      <LandingNav />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
