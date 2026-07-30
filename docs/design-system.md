# Design System

Bu doküman uygulamanın görsel kimliğini tanımlar: renkler, fontlar, boşluk kuralları ve genel bileşen prensipleri. Sayfa tasarımları planlanırken buradaki değerlere referans verilecek.

## Tasarım Felsefesi

Amaç, tipik yapay zeka üretimi arayüzlerin (mor-mavi gradyanlar, aşırı yuvarlatılmış köşeler, parlak gölgeler) tam tersi bir görünüm. Bunun yerine:

- Gradyan kullanılmıyor, düz renkler tercih ediliyor.
- Gölge minimum düzeyde, sadece modal/dropdown gibi gerçekten yüzen elemanlarda ince bir gölge var. Kartlarda gölge yerine ince border kullanılıyor.
- Köşeler keskine yakın, aşırı yuvarlak "bubble" görünümden kaçınılıyor.
- Tek bir vurgu (accent) rengi var ve bu renk sadece gerçekten dikkat çekmesi gereken yerlerde (birincil buton, aktif durum, link) kullanılıyor. Her yer renkli değil.
- Genel his editöryel ve sakin: bol boşluk, net tipografik hiyerarşi, az ama doğru yerde renk.

## Tema

Light mode öncelikli tasarlanıyor, dark mode da destekleniyor. Tüm renk değişkenleri hem light hem dark için ayrı tanımlanacak ve CSS değişkeni olarak `globals.css` içinde tutulacak, Tailwind config bu değişkenlere referans verecek.

## Renk Paleti — Light Mode

- Background (sayfa zemini): `#FAF9F6` — sıcak, hafif kırık beyaz (kağıt tonu, steril beyaz değil)
- Surface (kart, panel zemini): `#FFFFFF`
- Foreground (ana metin): `#1C1B1A` — sıcak, mürekkebe yakın siyah
- Muted Foreground (ikincil metin): `#6B6560`
- Border: `#E5E1DA` — sıcak açık gri
- Accent: `#C1541F` — kavrulmuş turuncu/terracotta tonu
- Accent Foreground (accent üzerindeki yazı): `#FFFFFF`
- Success: `#2F6F4E` — soluk orman yeşili
- Error: `#B23A2E` — tuğla kırmızısı
- Warning: `#B8862E` — soluk hardal/altın

## Renk Paleti — Dark Mode

- Background: `#171512`
- Surface: `#201E1B`
- Foreground: `#F2EFEA`
- Muted Foreground: `#A39C93`
- Border: `#332F2A`
- Accent: `#E07A45` — light moddakinden biraz daha açık, kontrast için
- Accent Foreground: `#171512`
- Success: `#4C9770`
- Error: `#D9695C`
- Warning: `#D7A24A`

## Rengin Kullanım Kuralı

Accent rengi bir ekranda genelde tek bir yerde baskın olmalı: birincil aksiyon butonu, aktif sekme/link, veya küçük bir vurgu detayı (örneğin aktif takvim günü). İki farklı doygun rengin yan yana durduğu kompozisyonlardan kaçınılıyor. Success/Error/Warning renkleri sadece durum bildirimi (toast, form hatası, rozet) için kullanılıyor, dekoratif amaçla kullanılmıyor.

## Tipografi

İki font ailesi kullanılıyor:

**UI Font (gövde metni, butonlar, formlar, navigasyon):** Geist Sans. `next/font` üzerinden `geist` paketi ile yükleniyor. Modern, nötr, okunaklı bir sans-serif.

**Editöryel Font (büyük başlıklar, landing page hero metni):** Instrument Serif. Google Fonts üzerinden `next/font/google` ile yükleniyor. İnce, karakterli bir serif, sadece büyük vurgulu başlıklarda kullanılıyor; gövde metninde asla kullanılmıyor. Bu font, arayüze tek düze "SaaS sans-serif" hissinden çıkan editöryel bir karakter katıyor.

**Mono Font (opsiyonel, toplantı kodu/linki gibi teknik veriler için):** Geist Mono.

### Font Ölçek Kademeleri

- Display (sadece hero başlıklarda, Instrument Serif): 56–64px, normal ağırlık
- H1 (Geist Sans): 40px, semibold
- H2 (Geist Sans): 32px, semibold
- H3 (Geist Sans): 24px, semibold
- H4 (Geist Sans): 20px, medium
- Body Large (Geist Sans): 18px, normal
- Body (Geist Sans): 16px, normal
- Small (Geist Sans): 14px, normal
- Caption (Geist Sans): 12px, medium, biraz harf aralığı açık

## Boşluk Sistemi

8px temel birim kullanılıyor: 4, 8, 12, 16, 24, 32, 48, 64, 96. Bileşenler arası boşluklar bu ölçeğe sadık kalacak, keyfi piksel değerleri kullanılmayacak.

## Köşe Yuvarlaklığı (Radius)

- Küçük elemanlar (input, badge, buton): 6px
- Kartlar, paneller: 8px
- Büyük yüzeyler (modal): 12px
- Avatar ve pill etiketler: tam yuvarlak (`9999px`)

Genel olarak aşırı yuvarlak köşelerden kaçınılıyor, keskinliğe yakın duruluyor.

## Gölge Kullanımı

Sadece iki seviye gölge var:

- Yok (varsayılan): Kartlar ve paneller sadece border ile ayrılıyor, gölge yok.
- Floating (tek seviye, sadece dropdown/modal/popover için): çok ince, düşük opaklıkta tek bir gölge. Renkli veya çok katmanlı gölgeler kullanılmıyor.

## Border Kullanımı

Ayrım için renk kontrastı yerine çoğunlukla 1px ince border tercih ediliyor. Border rengi her zaman yukarıdaki `Border` token'ı, keyfi gri tonlar kullanılmıyor.

## Buton Stilleri

- Primary: Accent renginde dolu zemin, üzerinde Accent Foreground rengi yazı.
- Secondary/Outline: Şeffaf zemin, Border rengiyle ince çerçeve, Foreground rengiyle yazı.
- Ghost: Zemin ve çerçeve yok, sadece hover'da hafif Surface tonu belirir.

Butonlarda gradyan, parlama efekti veya gölgeli "kabartma" görünümü kullanılmıyor.

## İkon Kullanımı

`lucide-react` setinden, 1.5–2px çizgi kalınlığında, dolgusuz (outline) ikonlar kullanılıyor. İkonlar varsayılan olarak Foreground veya Muted Foreground renginde; sadece aktif/seçili durumlarda Accent rengine geçiyor.
