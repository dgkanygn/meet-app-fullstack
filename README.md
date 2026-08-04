# MeetApp

MeetApp, modern web teknolojileri kullanılarak geliştirilmiş, uçtan uca şifreli (WebRTC tabanlı) eşler arası (P2P) görüntülü görüşme ve toplantı yönetimi uygulamasıdır.

## Proje Yapısı

Uygulama iki temel bileşenden oluşmaktadır: Frontend (Kullanıcı Arayüzü) ve API (Backend Servisleri). İki bileşenin de kendine ait bağımsız dokümantasyonları ve klasör yapıları mevcuttur.

- **`/frontend`**: Uygulamanın istemci tarafını barındırır.
  - **Teknoloji Yığını:** Next.js (App Router), React, TypeScript, Tailwind CSS
  - **Dokümantasyon:** `/frontend/docs` klasöründe tasarım sistemi, veri modeli ve sayfa yapıları yer almaktadır.
  - [Frontend Dokümanlarını Gör](./frontend/docs/README.md)

- **`/api`**: Uygulamanın sunucu tarafını barındırır.
  - **Teknoloji Yığını:** .NET 8 (Web API), Entity Framework Core, PostgreSQL, SignalR (WebRTC Sinyalleşmesi), JWT Authentication.
  - **Dokümantasyon:** `/api/docs` klasöründe mimari katmanlar, endpoint listesi ve anlık iletişim (real-time) detayları yer almaktadır.
  - [Backend Dokümanlarını Gör](./api/docs/README.md)

## Özellikler

- **Görüntülü Görüşme (WebRTC):** Anında, eşler arası (P2P) sesli ve görüntülü iletişim. WebRTC sinyalleşmesi SignalR kullanılarak sağlanır.
- **Toplantı Yönetimi:** İleri tarihli toplantı planlama, davet gönderme ve katılımcı yönetimi.
- **Kullanıcı Ağı:** Diğer kullanıcılarla bağlantı (arkadaşlık) kurma ve ağ oluşturma.
- **Bildirimler:** SignalR üzerinden gerçek zamanlı bildirim akışı (Toplantı davetleri, bağlantı istekleri vb.).
- **Güvenli Kimlik Doğrulama:** Access ve Refresh Token stratejisi ile korunan JWT tabanlı oturum yönetimi.

## Başlangıç

### Backend'i Çalıştırmak
Backend detayları için `api/docs/tech-stack-backend.md` dosyasına bakabilirsiniz. Temel olarak:
1. PostgreSQL kurulu olmalı ve `api/src/MeetApp.Api` içerisindeki connection string ayarlanmalı.
2. `dotnet ef database update` ile migration çalıştırılmalı.
3. `dotnet run` ile proje başlatılmalı (varsayılan: `http://localhost:5079`).

### Frontend'i Çalıştırmak
Frontend detayları için `frontend/docs/tech-stack.md` dosyasına bakabilirsiniz. Temel olarak:
1. `npm install` ile paketler yüklenmeli.
2. `npm run dev` ile geliştirme sunucusu başlatılmalı.

---
*Detaylı tasarım, mimari kararlar ve geliştirme kılavuzları için lütfen ilgili `docs` klasörlerine başvurunuz.*
