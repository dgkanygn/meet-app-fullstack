# MeetApp Backend Dokümanları

Bu klasördeki dokümanlar, MeetApp uygulamasının backend (API) mimarisini, uçlarını ve tasarım kararlarını içerir.

## tech-stack-backend.md

Backend'de kullanılan teknolojileri anlatır: .NET Web API, PostgreSQL, EF Core, JWT, SignalR, FluentValidation, AutoMapper gibi araç ve kütüphane kararları. 

## layered-architecture.md

Backend'in katman yapısını (Clean Architecture) anlatır: Domain, Application, Infrastructure, Api katmanları. Her katmanın sorumluluğu, klasör yapısı ve bağımlılık yönü. Yeni bir sınıf veya dosya eklenirken önce bu dosyaya bakılıp doğru katmana yerleştirilmelidir.

## api-endpoints.md

REST API uçlarının tam listesini verir: her entity için hangi HTTP metodu ve yol kullanılıyor, ne işe yarıyor. Yeni bir uç ekleneceğinde önce bu dosyaya işlenmelidir.

## realtime-communication.md

SignalR üzerinden giden anlık iletişimi anlatır: bildirimlerin anlık push edilmesi (NotificationHub) ve toplantı içi WebRTC sinyalleşmesi (MeetingHub). STUN/TURN yapılandırmasını ve mesh topolojisi kararının gerekçesini içerir.

## Okuma Sırası

Yeni katılan biri ya da projeye devam edilecekse dosyalar şu sırayla okunmalı:

1. Bu dosya (README.md) — genel harita
2. tech-stack-backend.md — teknolojiler
3. layered-architecture.md — katman yapısı
4. api-endpoints.md — REST uçları
5. realtime-communication.md — anlık iletişim

## Güncelleme Kuralı

API üzerinde mimari bir karar verildiğinde, yeni bir endpoint eklendiğinde veya kullanılan bir teknoloji değiştiğinde ilgili doküman mutlaka güncellenmelidir. Dokümantasyon her zaman güncel kod ile uyumlu kalmalıdır.
