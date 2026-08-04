# API Endpoints

Bu doküman REST API uçlarını listeler. Entity alanları için `data-model.md`, bu uçların hangi katmanda nasıl işlendiği için `layered-architecture.md` dosyasına bakılmalı. Anlık (SignalR üzerinden giden) akışlar bu dosyada değil, `realtime-communication.md` içinde anlatılıyor; örneğin bir bildirim veritabanına burada listelenen uçlardan biriyle değil, başka bir işlemin (davet, bağlantı isteği vb.) yan etkisi olarak oluşuyor ve anında SignalR ile push ediliyor.

Tüm uçlar (auth hariç) JWT ile korunuyor, istek başlığında geçerli bir access token bekleniyor.

## Auth

- `POST /api/auth/register` — yeni hesap oluşturma (username, email, fullname, password)
- `POST /api/auth/login` — email/username ve şifre ile giriş, access + refresh token döner
- `POST /api/auth/refresh` — refresh token ile yeni access token alma
- `POST /api/auth/logout` — refresh token'ı geçersiz kılma

## Profile

- `GET /api/profiles/me` — giriş yapmış kullanıcının kendi profilini getirir
- `PUT /api/profiles/me` — kendi profilini günceller (fullname, bio vb.)
- `GET /api/profiles/{id}` — başka bir kullanıcının herkese açık profil bilgisini getirir

## Meeting

- `POST /api/meetings` — yeni toplantı oluşturur, `is_instant` alanına göre anlık ya da planlanmış olur
- `GET /api/meetings` — kullanıcının host olduğu veya katılımcısı olduğu toplantıları listeler, `scope` query parametresiyle filtrelenebilir (örn. upcoming, past, hosted)
- `GET /api/meetings/{id}` — toplantı detayını getirir
- `PUT /api/meetings/{id}` — toplantıyı günceller (sadece host yapabilir)
- `DELETE /api/meetings/{id}` — toplantıyı iptal eder (sadece host yapabilir)
- `POST /api/meetings/{id}/join` — toplantıya katılım isteği; şifre gerekiyorsa kontrol edilir, `MeetingParticipant` kaydı oluşturulur ya da mevcut kaydın durumu güncellenir
- `POST /api/meetings/{id}/leave` — toplantıdan ayrılma/katılımı iptal etme

## Meeting Participants

- `GET /api/meetings/{id}/participants` — toplantının katılımcı listesini getirir
- `POST /api/meetings/{id}/participants` — host tarafından yeni katılımcı davet edilmesi
- `PUT /api/meetings/{id}/participants/{participantId}` — katılımcı durumunu günceller (accepted/rejected)
- `DELETE /api/meetings/{id}/participants/{participantId}` — katılımcıyı toplantıdan çıkarır (sadece host yapabilir)

## Connections

- `GET /api/connections` — kullanıcının bağlantı listesini getirir, `status` query parametresiyle filtrelenebilir
- `POST /api/connections` — başka bir kullanıcıya bağlantı isteği gönderir
- `PUT /api/connections/{id}` — bağlantı isteğinin durumunu günceller (accepted/rejected/blocked)
- `DELETE /api/connections/{id}` — mevcut bağlantıyı kaldırır

## Notifications

- `GET /api/notifications` — kullanıcının bildirimlerini listeler, `isRead` query parametresiyle filtrelenebilir
- `PUT /api/notifications/{id}/read` — tek bir bildirimi okundu olarak işaretler
- `PUT /api/notifications/read-all` — tüm bildirimleri okundu olarak işaretler

Not: Bildirim oluşturma işlemi client tarafından tetiklenmiyor; bir toplantı daveti, bağlantı isteği gibi işlemler Application katmanında yan etki olarak bildirim kaydı oluşturuyor ve aynı anda `NotificationHub` üzerinden push ediyor.

## Calendar Notes

- `GET /api/calendar-notes` — `month` ve `year` query parametreleriyle o aya ait notları listeler
- `POST /api/calendar-notes` — belirli bir güne not ekler
- `PUT /api/calendar-notes/{id}` — mevcut notu günceller
- `DELETE /api/calendar-notes/{id}` — notu siler
