# Proje Dokümanları

Bu klasördeki dokümanlar, meet uygulamasının frontend planlamasını oluşturuyor. Aşağıda her dosyanın ne işe yaradığı anlatılıyor.

## tech-stack.md

Projede kullanılan teknolojileri anlatır: Next.js, TypeScript, Tailwind, font/ikon/form kütüphaneleri, kod kalitesi araçları ve paket yöneticisi. Bir kütüphane veya araç eklenip eklenmeyeceği tartışılırken önce bu dosyaya bakılır.

## design-system.md

Görsel kimliği anlatır: renk paleti (light ve dark mod), fontlar, boşluk sistemi, köşe yuvarlaklığı, gölge ve border kuralları, buton stilleri, ikon kullanımı. Herhangi bir sayfa veya bileşen tasarlanırken renk ve font kararları burada tanımlı olanlarla sınırlı kalmalı, yeni bir renk/font buraya eklenmeden kullanılmamalı.

## pages-overview.md

Uygulamadaki tüm sayfaları tek tek tanıtır: her sayfanın amacı, düzeni, hangi bileşenlerden oluştuğu ve `design-system.md`'deki hangi renk/font kararlarının nerede kullanıldığı. Ayrıca `app/` klasörü altında sayfaların nasıl konumlandırılacağını (route group'lar, dosya yolları) gösterir. Yeni bir sayfa eklenmek istendiğinde önce bu dosyaya işlenir.

## data-model.md

Uygulamanın veri modelini anlatır: Profile, Meeting, MeetingParticipant, Connection, Notification, CalendarNote entity'lerinin alanları ve aralarındaki ilişkiler. Şu an gerçek bir backend olmasa da, sayfalardaki mock veriler bu şemadaki alan adlarına sadık kalmalı.

## tech-stack-backend.md

Backend'de kullanılan teknolojileri anlatır: .NET Web API, PostgreSQL, EF Core, JWT, SignalR, FluentValidation, AutoMapper gibi araç ve kütüphane kararları. `tech-stack.md`'nin backend karşılığı, frontend dosyasıyla karıştırılmamalı.

## layered-architecture.md

Backend'in katman yapısını anlatır: Domain / Application / Infrastructure / Api katmanları, her katmanın sorumluluğu, klasör yapısı ve bağımlılık yönü. Yeni bir sınıf veya dosya eklenirken önce bu dosyaya bakılıp doğru katmana yerleştirilmeli.

## api-endpoints.md

REST API uçlarının tam listesini verir: her entity için hangi HTTP metodu ve yol kullanılıyor, ne işe yarıyor. Yeni bir uç eklenmek istendiğinde önce bu dosyaya işlenmeli.

## realtime-communication.md

SignalR üzerinden giden anlık iletişimi anlatır: bildirimlerin anlık push edilmesi (NotificationHub) ve toplantı içi WebRTC sinyalleşmesi (MeetingHub). Ayrıca STUN/TURN yapılandırmasını ve mesh topolojisi kararının gerekçesini içerir.

## Okuma Sırası

Yeni katılan biri ya da yeni bir sohbette bu projeye devam edilecekse dosyalar şu sırayla okunmalı:

1. Bu dosya (README.md) — genel harita
2. tech-stack.md — frontend'de hangi teknolojilerle çalışılıyor
3. design-system.md — görsel kurallar neler
4. pages-overview.md — hangi sayfa nerede ve nasıl
5. data-model.md — veri modeli ve entity'ler neler
6. tech-stack-backend.md — backend'de hangi teknolojilerle çalışılıyor
7. layered-architecture.md — backend katman yapısı nasıl
8. api-endpoints.md — hangi REST ucu ne işe yarıyor
9. realtime-communication.md — anlık bildirim ve toplantı sinyalleşmesi nasıl işliyor

## Güncelleme Kuralı

Bu dokümanların hepsi birbirine bağlı çalışıyor. design-system.md'de bir renk veya font değişirse, pages-overview.md içindeki ilgili referanslar da gözden geçirilmeli. pages-overview.md'deki mock verilerde kullanılan alan adları data-model.md'deki şemayla tutarlı olmalı. api-endpoints.md'deki uçlar data-model.md'deki entity'lerle, layered-architecture.md'deki katman kararlarıyla uyumlu kalmalı. Yeni bir sayfa, teknoloji, entity ya da uç kararı alındığında ilgili dosyaya eklenmeli, dokümanlar dağınık notlara bölünmemeli.
