# Layered Architecture

Bu doküman backend'in katman yapısını anlatır. Hafifletilmiş bir Clean Architecture yaklaşımı izleniyor: bağımlılıklar her zaman dışarıdan içeriye doğru akıyor, Domain hiçbir katmana bağımlı değil, Infrastructure ise Domain ve Application'daki arayüzleri implemente ediyor.

## Katmanlar ve Sorumlulukları

### Domain

En içteki katman. Hiçbir NuGet paketine (EF Core, ASP.NET Core vb.) bağımlı değil, saf C# sınıfları içeriyor.

- Entity sınıfları (Profile, Meeting, MeetingParticipant, Connection, Notification, CalendarNote) — bkz. `data-model.md`
- Enum'lar (MeetingParticipantStatus, ConnectionStatus, NotificationType gibi)
- Repository arayüzleri (IProfileRepository, IMeetingRepository vb.) — arayüz burada, implementasyon Infrastructure'da
- Domain'e özgü custom exception sınıfları (örn. MeetingNotFoundException)

### Application

Business logic'in yaşadığı katman. Sadece Domain'e bağımlı, EF Core veya ASP.NET Core'u tanımıyor.

- Servis arayüzleri ve implementasyonları (IMeetingService/MeetingService, IConnectionService/ConnectionService vb.) — Repository + Service pattern kullanılıyor, CQRS/MediatR kullanılmıyor
- DTO sınıfları (request/response modelleri, entity'lerin dışarı sızmaması için)
- FluentValidation validator sınıfları
- AutoMapper mapping profilleri
- Infrastructure tarafından implemente edilecek yardımcı arayüzler (ITokenService, IPasswordHasher, INotificationPublisher gibi) — bu arayüzler burada tanımlanıyor çünkü Application bunları kullanıyor, ama gerçek implementasyonu (JWT üretimi, SignalR'a erişim) Infrastructure/API katmanında

### Infrastructure

Dış dünyayla bağlantı kuran katman. Domain ve Application'daki arayüzleri implemente ediyor.

- `AppDbContext` ve EF Core entity konfigürasyonları (Fluent API ile, `OnModelCreating` içinde her entity için ayrı `IEntityTypeConfiguration` sınıfı)
- Repository implementasyonları (generic bir `Repository<T>` + gerekli yerlerde özel repository'ler)
- `TokenService` (JWT üretimi/doğrulaması) ve `PasswordHasher` (BCrypt) implementasyonları
- Migration dosyaları

### API

En dıştaki katman, uygulamanın giriş noktası. Diğer üç katmana da bağımlı, DI (dependency injection) kayıtlarının tamamı burada yapılıyor.

- Controller'lar (bkz. `api-endpoints.md`)
- SignalR Hub sınıfları (`MeetingHub`, `NotificationHub`) — bkz. `realtime-communication.md`
- `INotificationPublisher` gibi arayüzlerin Hub'a bağımlı implementasyonları burada yer alıyor (çünkü `IHubContext` kullanımı ASP.NET Core'a bağımlı, Application katmanına sızdırılmıyor)
- Middleware'ler (global exception handling, JWT authentication middleware)
- `Program.cs`, `appsettings.json`

## Klasör Yapısı

```
src/
  MeetApp.Domain/
    Entities/
    Enums/
    Interfaces/
    Exceptions/

  MeetApp.Application/
    Services/
    Interfaces/
    Dtos/
    Validators/
    Mappings/

  MeetApp.Infrastructure/
    Persistence/
      AppDbContext.cs
      Configurations/
      Repositories/
      Migrations/
    Security/
      TokenService.cs
      PasswordHasher.cs

  MeetApp.Api/
    Controllers/
    Hubs/
      MeetingHub.cs
      NotificationHub.cs
    Realtime/
      NotificationPublisher.cs
    Middleware/
    Program.cs
    appsettings.json

tests/
  MeetApp.Application.Tests/
```

## Bağımlılık Yönü

`Domain` ← `Application` ← `Infrastructure` ve `Domain` ← `Application` ← `Api`. Yani Application hem Infrastructure hem Api tarafından referans alınıyor, ama Application kendisi ne Infrastructure'ı ne Api'yi tanıyor. Bu sayede business logic, veritabanı veya SignalR gibi teknik detaylardan habersiz kalıyor; ileride EF Core yerine başka bir ORM'e geçilse ya da SignalR yerine başka bir real-time çözüm kullanılsa Application katmanı değişmeden kalabilir.

## Meeting Signaling'in Katmanlardaki Yeri

`MeetingHub`, taşıma (transport) sorumluluğu taşıdığı için Api katmanında duruyor. Ancak Hub içindeki metodlar (örneğin bir kullanıcının odaya girmeye yetkili olup olmadığı) doğrudan iş kuralı içermiyor, bu kontrolü Application katmanındaki `IMeetingService` üzerinden yapıyor. Yani Hub sadece mesajı taşıyor ve grup yönetimini yapıyor, yetki/iş kuralı kararını Application veriyor.
