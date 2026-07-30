# Proje Dokümanları

Bu klasördeki dokümanlar, meet uygulamasının frontend planlamasını oluşturuyor. Aşağıda her dosyanın ne işe yaradığı anlatılıyor.

## tech-stack.md

Projede kullanılan teknolojileri anlatır: Next.js, TypeScript, Tailwind, font/ikon/form kütüphaneleri, kod kalitesi araçları ve paket yöneticisi. Bir kütüphane veya araç eklenip eklenmeyeceği tartışılırken önce bu dosyaya bakılır.

## design-system.md

Görsel kimliği anlatır: renk paleti (light ve dark mod), fontlar, boşluk sistemi, köşe yuvarlaklığı, gölge ve border kuralları, buton stilleri, ikon kullanımı. Herhangi bir sayfa veya bileşen tasarlanırken renk ve font kararları burada tanımlı olanlarla sınırlı kalmalı, yeni bir renk/font buraya eklenmeden kullanılmamalı.

## pages-overview.md

Uygulamadaki tüm sayfaları tek tek tanıtır: her sayfanın amacı, düzeni, hangi bileşenlerden oluştuğu ve `design-system.md`'deki hangi renk/font kararlarının nerede kullanıldığı. Ayrıca `app/` klasörü altında sayfaların nasıl konumlandırılacağını (route group'lar, dosya yolları) gösterir. Yeni bir sayfa eklenmek istendiğinde önce bu dosyaya işlenir.

## Okuma Sırası

Yeni katılan biri ya da yeni bir sohbette bu projeye devam edilecekse dosyalar şu sırayla okunmalı:

1. Bu dosya (README.md) — genel harita
2. tech-stack.md — hangi teknolojilerle çalışılıyor
3. design-system.md — görsel kurallar neler
4. pages-overview.md — hangi sayfa nerede ve nasıl

## Güncelleme Kuralı

Bu dört dosya birbirine bağlı çalışıyor. design-system.md'de bir renk veya font değişirse, pages-overview.md içindeki ilgili referanslar da gözden geçirilmeli. Yeni bir sayfa ya da teknoloji kararı alındığında ilgili dosyaya eklenmeli, dokümanlar dağınık notlara bölünmemeli.