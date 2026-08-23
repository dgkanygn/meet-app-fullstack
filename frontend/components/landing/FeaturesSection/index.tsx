import { Shield, Video, Users } from "lucide-react";

const features = [
  {
    icon: Video,
    title: "Anında Başlat",
    description:
      "Tek tıkla toplantı oluştur ve bağlantıyı paylaş. Kayıt ya da kurulum gerektirmez.",
  },
  {
    icon: Users,
    title: "Ekibinle Bağlantıda Kal",
    description:
      "Katılımcı listesi, sohbet paneli ve takvim entegrasyonu ile ekip koordinasyonu kolaylaşır.",
  },
  {
    icon: Shield,
    title: "Güvenli Oturumlar",
    description:
      "Her toplantı oturum kodlu ve şifrelenmiş bağlantıyla korunur. Gizliliğin önce gelir.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="w-full border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="space-y-3">
              <div className="w-9 h-9 rounded-[6px] border border-border flex items-center justify-center">
                <Icon size={18} className="text-muted" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                {title}
              </h3>
              <p className="text-sm text-muted leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
