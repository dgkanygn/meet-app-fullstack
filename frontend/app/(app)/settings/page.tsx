import ProfileSettingsForm from "@/components/settings/ProfileSettingsForm";
import ChangePasswordForm from "@/components/settings/ChangePasswordForm";
import DeleteAccountSection from "@/components/settings/DeleteAccountSection";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-10 sm:space-y-12">
      <div>
        <h1 className="text-2xl font-semibold text-foreground mb-2">Ayarlar</h1>
        <p className="text-muted text-sm">Profil bilgilerinizi ve hesap ayarlarınızı buradan yönetebilirsiniz.</p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Profil Bilgileri</h2>
          <div className="rounded-[8px] border border-border bg-surface p-4 sm:p-6">
            <ProfileSettingsForm />
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Şifre Değiştir</h2>
          <div className="rounded-[8px] border border-border bg-surface p-4 sm:p-6">
            <ChangePasswordForm />
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Tehlikeli Bölge</h2>
          <DeleteAccountSection />
        </section>
      </div>
    </div>
  );
}
