# Pages Overview

Bu doküman uygulamadaki sayfaları, her sayfanın düzenini ve `app/` klasörü içindeki konumunu anlatır. Renk ve font referansları için bkz. `design-system.md`. Genel teknoloji kararları için bkz. `tech-stack.md`.

## Klasör Yapısı

```
app/
  layout.tsx                          Kök layout, font ve tema tanımları burada
  page.tsx                            Landing page
  globals.css

  (auth)/
    layout.tsx                        Ortalanmış, tek kolonlu auth layout
    login/
      page.tsx                        Giriş yap
    register/
      page.tsx                        Kaydol

  (app)/
    layout.tsx                        Sidebar + topbar içeren layout, sadece üyeler erişebilir
    dashboard/
      page.tsx                        Genel dashboard
    calendar/
      page.tsx                        Takvim
    meeting/
      start/
        page.tsx                      Toplantı başlat
      join/
        page.tsx                      Toplantıya katıl

  (room)/
    meeting/
      [meetingId]/
        page.tsx                      Toplantı ekranı (tam ekran, sidebar yok)

components/
  ui/                                 Buton, input, kart, modal gibi temel bileşenler
  layout/                             Navbar, sidebar, footer
  landing/                            Landing page'e özel bileşenler
  auth/                               Login/register form bileşenleri
  dashboard/                          Dashboard'a özel bileşenler
  calendar/                           Takvim bileşenleri
  meeting/                            Toplantı başlat/katıl/ekran bileşenleri
```

Auth sayfaları ve uygulama içi sayfalar iki ayrı route group'ta (`(auth)` ve `(app)`) çünkü ikisinin layout'u tamamen farklı: auth sayfalarında sidebar yok, ortalanmış tek bir form var. Toplantı ekranı ise kendi route group'u olan `(room)` içinde, çünkü orada da sidebar/topbar istenmiyor, tam ekran bir deneyim kurgulanıyor.

---

## 1. Landing Page

**Konum:** `app/page.tsx`

Üye olmayan ziyaretçinin ilk gördüğü sayfa. 2-3 section'dan oluşuyor:

1. **Hero section:** Sol tarafta Instrument Serif ile büyük bir başlık (Display ölçeği, bkz. `design-system.md`), altında Geist Sans ile Body Large boyutunda kısa bir açıklama, altında Primary buton ("Ücretsiz Başla" gibi) ve Ghost/Outline buton ("Giriş Yap"). Sağ tarafta gerçek bir toplantı ekranı görünümünü ima eden sade bir arayüz illüstrasyonu ya da mockup (gradyan yok, düz Surface zemin üzerinde ince border'lı bir kart kompozisyonu).
2. **Özellikler section:** 3 sütunlu bir grid, her sütunda bir ikon (`lucide-react`, Muted Foreground renginde), bir H4 başlık ve kısa bir Body açıklama. Kartlar arası ayrım gölge değil, ince border ile yapılıyor.
3. **Kapanış/CTA section:** Zemin rengi Surface yerine hafif farklı bir ton (dark modda biraz daha açık, light modda biraz daha koyu Background varyasyonu) ile diğer section'lardan ayrılan, ortalanmış kısa bir başlık ve tek bir Primary buton içeren sade bir kapanış alanı.

Genel zemin Background rengi, section'lar arası ayrım renk değişimiyle değil çoğunlukla boşluk ve ince bir üst border ile sağlanıyor.

---

## 2. Giriş Yap / Kaydol

**Konum:** `app/(auth)/login/page.tsx` ve `app/(auth)/register/page.tsx`

Ortak `app/(auth)/layout.tsx` kullanıyorlar: sayfanın ortasında, maksimum ~400px genişliğinde tek kolonlu bir form alanı, Background zemin üzerinde. Formun kendisi Surface renginde, ince Border ile çevrili, 8px radius'lu bir kart içinde.

- Üstte küçük bir logo/marka alanı.
- H2 boyutunda başlık ("Giriş Yap" / "Hesap Oluştur").
- Form alanları (`react-hook-form` + `zod` ile), her biri Label + Input, hata durumunda Error rengiyle küçük bir mesaj.
- Alt kısımda tam genişlikte Primary buton.
- En altta diğer sayfaya geçiş linki ("Hesabın yok mu? Kaydol" gibi), Accent renginde, sadece bu link vurgulu.

Gradyanlı arka plan, dekoratif şekiller veya illüstrasyon kullanılmıyor; sayfa bilinçli olarak sade ve fonksiyonel tutuluyor.

---

## 3. Dashboard

**Konum:** `app/(app)/dashboard/page.tsx`

Sadece giriş yapmış üyelerin erişebildiği, `app/(app)/layout.tsx` içindeki sidebar + topbar yapısını kullanan genel bakış sayfası.

- **Sidebar (sol, `components/layout`):** Logo, ardından Dashboard / Takvim / Toplantı Başlat / Toplantıya Katıl linkleri, her biri `lucide-react` ikonuyla. Aktif sayfa Accent renkli ince bir sol şerit veya Accent renkli ikon/metin ile belirtiliyor.
- **Topbar:** Sağda kullanıcı avatarı ve isim, sade bir dropdown menü.
- **İçerik alanı:** Üstte kısa bir karşılama metni (H2). Altında, yaklaşan toplantıları listeleyen bir kart grubu — her kart Surface zemin, ince Border, içinde toplantı adı, saati ve katılımcı sayısı. Kartlarda gölge yok. Sayfanın bir tarafında da "Hızlı Başlat" ve "Katıl" için iki Primary/Outline buton bulunan kompakt bir alan var.

---

## 4. Toplantı Başlat / Toplantıya Katıl

**Konum:** `app/(app)/meeting/start/page.tsx` ve `app/(app)/meeting/join/page.tsx`

İkisi de `(app)` layout'u içinde, sidebar/topbar korunuyor.

**Toplantı Başlat:** Ortada, Surface renginde bir kart içinde toplantı adı girme alanı, kamera/mikrofon açık-kapalı önizleme alanı (şimdilik statik/mock görsel), ve altta büyük bir Primary "Toplantıyı Başlat" butonu.

**Toplantıya Katıl:** Benzer bir kart, bu sefer toplantı kodu/linki girilen tek bir Input alanı ve Primary "Katıl" butonu. Kod formatı Geist Mono ile gösteriliyor (bkz. `design-system.md` mono font tanımı), teknik bir veri olduğu için gövde fontundan ayrıştırılıyor.

İki sayfa da tek kolonlu, ortalanmış, form odaklı bir düzen kullanıyor; dashboard'daki çok kartlı yoğun görünümden bilinçli olarak sadeleştirilmiş.

---

## 5. Takvim

**Konum:** `app/(app)/calendar/page.tsx`

`(app)` layout'u içinde, sidebar/topbar korunuyor.

- Üstte ay/hafta görünümü arasında geçiş yapan sade bir Outline buton grubu ve ay adı (H3).
- Altında grid tabanlı takvim görünümü: her gün hücresi ince Border ile ayrılan, Surface zeminli kare bir alan. Bugünün tarihi Accent renginde ince bir çerçeve veya arka plan tonuyla vurgulanıyor (tek accent kullanımı kuralına uygun).
- Toplantısı olan günlerde hücre içinde küçük, Accent renginde bir nokta/etiket var; renk yoğunluğu artırılmıyor, sade bir işaretleyici.
- Bir güne tıklanınca sağda veya bir modal içinde o günün toplantı listesi açılıyor (Surface zemin, ince Border, gölge sadece bu floating panelde kullanılıyor).

---

## 6. Toplantı Ekranı

**Konum:** `app/(room)/meeting/[meetingId]/page.tsx`

Sidebar ve topbar yok; tam ekran, koyu zemine yakın bir düzen (bu sayfa için zemin varsayılan olarak dark mode paletine yakın tutulabilir, çünkü video görüşme ekranlarında koyu zemin göz yorgunluğunu azaltır ve video kutularının önüne çıkmaz).

- **Ana alan:** Katılımcı video kutularının (şimdilik mock/placeholder) yerleştiği grid. Kutular arası boşluk 8px sisteminden (`design-system.md`), köşe radius'u kart radius'una (8px) sadık.
- **Alt kontrol çubuğu:** Ortada sabit, Surface/Background'dan hafif ayrışan bir şerit içinde mikrofon, kamera, ekran paylaşımı, katılımcılar ve "Ayrıl" ikonları. "Ayrıl" butonu Error renginde, diğer tüm kontroller nötr Foreground/Muted tonlarında — tek bir renk yüklü aksiyonun (ayrılma) öne çıkması bilinçli bir tercih.
- **Üst köşe:** Toplantı adı ve süresi, küçük Body/Small ölçeğinde, düşük dikkat çeken bir konumda.
- **Yan panel (opsiyonel açılır):** Katılımcı listesi veya sohbet, Surface zemin üzerinde, ince Border ile ana alandan ayrılan bir panel; ana video alanının üzerine gölgeyle değil, yan yana konumlanarak ekleniyor.

Bu sayfa diğer tüm sayfalardan farklı olarak koyu zemin ağırlıklı tasarlanıyor; bu istisna `design-system.md`'deki genel light-mode-öncelik kuralına bilinçli bir sapma olarak not düşülüyor.
