# Tech Stack (Backend)

Bu doküman, meet uygulamasının backend tarafında kullanılacak teknolojileri anlatır. Frontend teknolojileri için `tech-stack.md` dosyasına bakılmalı, bu ikisi birbirinden bağımsız ama birlikte çalışan iki ayrı doküman.

## Framework

.NET 8 (LTS) üzerinde ASP.NET Core Web API kullanılacak. Proje `dotnet new webapi` şablonundan değil, katmanlı mimariye uygun olarak sıfırdan, birden fazla class library projesinden oluşacak (bkz. `layered-architecture.md`).

## Veritabanı

PostgreSQL kullanılacak. Yerelde Docker üzerinden çalıştırılması öneriliyor, böylece geliştirme ortamı herkes için aynı sürümde kalıyor.

## ORM

Entity Framework Core, `Npgsql.EntityFrameworkCore.PostgreSQL` paketi ile PostgreSQL'e bağlanacak. Migration'lar `dotnet ef migrations` komutlarıyla, Infrastructure katmanındaki `AppDbContext` üzerinden yönetilecek.

## Kimlik Doğrulama

JWT (access token + refresh token) kullanılacak. ASP.NET Core Identity'nin hazır kullanıcı tablosu kullanılmıyor, çünkü `Profile` entity'si zaten kendi `password_hash` alanıyla bu işi karşılıyor. Şifreler `BCrypt.Net-Next` paketiyle hash'lenecek. Token üretimi ve doğrulaması `System.IdentityModel.Tokens.Jwt` ile yapılacak.

## Gerçek Zamanlı İletişim

SignalR (`Microsoft.AspNetCore.SignalR`) kullanılacak. İki ayrı hub olacak: biri anlık bildirimler için, biri toplantı sırasındaki WebRTC sinyalleşmesi için. Detaylar `realtime-communication.md` dosyasında.

## Doğrulama (Validation)

FluentValidation kullanılacak. Her request DTO'su için ayrı bir validator sınıfı yazılacak, validation kuralları controller içine gömülmeyecek.

## Nesne Eşleme (Mapping)

AutoMapper kullanılacak. Entity ile DTO arasındaki dönüşümler mapping profillerinde toplanacak, controller veya servis içinde elle property kopyalama yapılmayacak.

## Loglama

Serilog kullanılacak, konsola ve dosyaya yazacak şekilde yapılandırılacak.

## API Dokümantasyonu

Swashbuckle (Swagger/OpenAPI) kullanılacak, geliştirme ortamında `/swagger` üzerinden API'nin denenebilmesi sağlanacak.

## Test

İlk fazda test kapsamı zorunlu tutulmuyor, ancak ileride xUnit ile birim testleri eklenmesi planlanıyor. Servis katmanının interface üzerinden çalışması bu yüzden önemli, test edilebilirliği baştan garantiliyor.

## Ortam Yönetimi

Geliştirme ortamında `dotnet user-secrets` ile bağlantı dizesi ve JWT anahtarı gibi gizli değerler saklanacak. `appsettings.json` sadece ortam bağımsız, gizli olmayan ayarları tutacak.
