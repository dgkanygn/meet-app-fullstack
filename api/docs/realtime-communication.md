# Realtime Communication

Bu doküman, REST API dışında kalan anlık (gerçek zamanlı) iletişim akışlarını anlatır: bildirim push'ları ve toplantı içi WebRTC sinyalleşmesi. İki ayrı SignalR hub kullanılıyor, ikisi de farklı yaşam döngüsüne sahip.

## Genel Prensip: Medya Hub'dan Geçmez

Ses ve görüntü verisi hiçbir zaman backend'e uğramıyor. En fazla 4 kişilik toplantılarda mesh topolojisi (her katılımcının diğer tüm katılımcılarla doğrudan P2P WebRTC bağlantısı kurması) kullanılıyor, bu ölçekte ayrı bir medya sunucusuna (SFU) ihtiyaç yok. Hub'lar sadece küçük JSON mesajları (SDP, ICE candidate, katılımcı durumu) taşıyor.

## NotificationHub

**Yol:** `/hubs/notifications`

Kullanıcı uygulamaya giriş yaptığı andan itibaren, hangi sayfada olursa olsun bağlı kalan bir hub. JWT access token, bağlantı kurulurken query string veya `accessTokenFactory` ile gönderiliyor.

- Kullanıcı bağlandığında, kendi `profile_id`'sine özel bir SignalR grubuna ekleniyor.
- Application katmanında bir bildirim oluşturulduğunda (toplantı daveti, bağlantı isteği vb.), veritabanına yazmanın yanında `ReceiveNotification` event'i ilgili kullanıcının grubuna push ediliyor.
- Bu push işlemi Application katmanındaki `INotificationPublisher` arayüzü üzerinden tetikleniyor; gerçek implementasyon (`IHubContext<NotificationHub>` kullanımı) Api katmanında, çünkü Application'ın SignalR'ı tanımaması gerekiyor (bkz. `layered-architecture.md`).
- Bağlantı koptuğunda bildirimler kaybolmuyor, kullanıcı tekrar bağlandığında ya da `GET /api/notifications` çağırdığında veritabanından okunuyor. Hub sadece "az önce oldu" anını anlık iletmek için var, tek doğruluk kaynağı hâlâ veritabanı.

## MeetingHub

**Yol:** `/hubs/meeting`

Kullanıcı sadece toplantı ekranına (`/meeting/{meetingId}`) girdiğinde bu hub'a bağlanıyor, sayfadan çıkınca bağlantı kapanıyor. NotificationHub'dan farklı olarak sürekli açık kalmıyor.

- Bağlanırken JWT ile kimlik doğrulanıyor, ardından `meetingId`'ye karşılık gelen bir SignalR grubuna katılıyor.
- Gruba katılmadan önce Api katmanı, Application'daki `IMeetingService` üzerinden kullanıcının bu toplantıya gerçekten katılımcı olup olmadığını kontrol ediyor; yetkisiz biri gruba giremiyor.

### Olaylar

- `UserJoined` — biri odaya girdiğinde diğer katılımcılara yayınlanıyor.
- `UserLeft` — biri ayrıldığında ya da bağlantısı koptuğunda diğerlerine yayınlanıyor.
- `SendOffer` / `SendAnswer` — WebRTC SDP offer/answer mesajlarının belirli bir katılımcıya iletilmesi.
- `SendIceCandidate` — ICE candidate mesajlarının belirli bir katılımcıya iletilmesi.

### Akış

1. Kullanıcı zaten `POST /api/meetings/{id}/join` ile katılımcı kaydını oluşturmuş durumda.
2. Toplantı ekranına girince frontend `MeetingHub`'a bağlanıyor ve `meetingId` grubuna katılıyor.
3. Sunucu `UserJoined` event'ini gruptaki diğer katılımcılara yayınlıyor.
4. Yeni katılımcı ile odadaki her mevcut katılımcı arasında WebRTC el sıkışması Hub üzerinden taşınan offer/answer/ICE mesajlarıyla kuruluyor. 4 kişilik bir odada bu, en fazla 6 ikili bağlantı anlamına geliyor.
5. Bağlantılar kurulduktan sonra ses/görüntü doğrudan tarayıcılar arası akıyor, Hub artık sadece yeni katılımcı/ayrılma gibi durumları taşıyor.
6. Kullanıcı sayfadan çıktığında ya da bağlantısı koptuğunda `UserLeft` yayınlanıyor, grup üyeliği düşüyor.

## STUN / TURN

WebRTC bağlantısının kurulabilmesi için bir STUN sunucusuna her zaman ihtiyaç var (NAT arkasındaki gerçek IP/port bilgisini öğrenmek için). Bazı ağlarda (simetrik NAT, kurumsal firewall) STUN yetmiyor, bu durumda TURN sunucusu devreye giriyor ve trafiği kendi üzerinden röle ediyor.

İlk fazda açık kaynak `coturn` kendi sunucumuzda barındırılabilir; ölçek büyürse bulut tabanlı bir TURN servisine geçilmesi değerlendirilebilir. STUN/TURN adresleri backend tarafından sabit kodlanmıyor, `appsettings.json` üzerinden yapılandırılıp frontend'e bir konfigürasyon ucuyla (örn. `GET /api/meetings/ice-servers`) ya da ortam değişkeniyle iletiliyor.
