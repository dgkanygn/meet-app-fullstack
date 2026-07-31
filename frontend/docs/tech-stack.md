# Tech Stack

Bu doküman, meet uygulamasının frontend tarafında ilk aşamada kullanılacak teknolojileri ve temel araç kararlarını anlatır.

## Framework

Next.js kullanılıyor, App Router yapısı ile. Sayfa ve layout organizasyonu `app/` klasörü altında route group'lar ile yönetilecek. Sürüm olarak Next.js 14 veya üzeri hedefleniyor.

React 18 üzerinde çalışılacak, Server Component'ler varsayılan olacak, sadece etkileşim (state, event handler, form) gereken yerlerde `"use client"` kullanılacak.

## Dil

Tüm proje TypeScript ile yazılacak. `strict` mod açık olacak. Herhangi bir `.js` dosyası olmayacak, tip güvenliği baştan itibaren korunacak.

## Stil

Tailwind CSS kullanılacak. Renkler ve tipografi elle Tailwind class'larına gömülmek yerine `tailwind.config.ts` içinde tanımlı design token'lar üzerinden kullanılacak. Bu token'ların kaynağı `design-system.md` dosyasıdır, oradaki her değer config'e birebir yansıtılacak.

Global stiller `app/globals.css` içinde tutulacak, burada sadece font tanımları, temel reset ve CSS değişkenleri (light/dark mod için) bulunacak.

## Font Yönetimi

Fontlar `next/font` üzerinden yüklenecek, harici `<link>` etiketi kullanılmayacak. Hangi fontların kullanılacağı `design-system.md` içinde belirtiliyor.

## İkon Seti

`lucide-react` kullanılacak. Sade, çizgisel (line-based) ikonlar tercih ediliyor, dolgulu veya renkli ikon setlerinden kaçınılıyor.

## Form ve Doğrulama

`react-hook-form` ile form state yönetimi, `zod` ile şema doğrulaması yapılacak. Giriş/kayıt ve toplantıya katılma gibi formlarda bu ikili kullanılacak.

## Durum Yönetimi

İlk aşamada global bir state kütüphanesine (Redux, Zustand vb.) ihtiyaç yok. React'in kendi `useState`/`useContext` yapısı yeterli. İhtiyaç büyürse ileride Zustand eklenmesi değerlendirilebilir.

## Kod Kalitesi

ESLint ve Prettier projeye dahil edilecek. Next.js'in varsayılan ESLint config'i temel alınacak, Prettier ile satır uzunluğu ve tırnak/boşluk kuralları sabitlenecek.

## Paket Yöneticisi

`pnpm` öneriliyor, hızlı kurulum ve disk alanı verimliliği için.

## Kapsam Notu

Bu aşamada sadece frontend ve arayüz kurgusu yapılıyor. Gerçek video/ses aktarımı (WebRTC, signaling sunucusu vb.) ve backend/auth altyapısı bu dokümanın kapsamı dışında, ileride ayrı olarak planlanacak. Şu an için toplantı ekranı da dahil tüm sayfalar statik/mock veri ile arayüz seviyesinde kurgulanacak.
