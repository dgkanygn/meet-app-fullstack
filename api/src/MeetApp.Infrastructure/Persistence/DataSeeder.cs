using MeetApp.Application.Interfaces;
using MeetApp.Domain.Entities;
using MeetApp.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace MeetApp.Infrastructure.Persistence;

public static class DataSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("DataSeeder");

        if (!await context.Profiles.AnyAsync())
        {
            logger.LogInformation("Veritabanı boş, seed verileri ekleniyor...");

            // 1. Users
            var dogukan = new Profile
            {
                Id = Guid.NewGuid(),
                Username = "dogukan",
                Email = "dogukan@example.com",
                FullName = "Doğukan Y",
                Bio = "Software Engineer",
                PasswordHash = passwordHasher.Hash("123456"),
                CreatedAt = DateTime.UtcNow
            };

            var testUser = new Profile
            {
                Id = Guid.NewGuid(),
                Username = "testuser",
                Email = "test@example.com",
                FullName = "Test Kullanıcısı",
                Bio = "Test account for MeetApp",
                PasswordHash = passwordHasher.Hash("123456"),
                CreatedAt = DateTime.UtcNow
            };

            var jane = new Profile
            {
                Id = Guid.NewGuid(),
                Username = "janedoe",
                Email = "jane@example.com",
                FullName = "Jane Doe",
                Bio = "Product Manager",
                PasswordHash = passwordHasher.Hash("123456"),
                CreatedAt = DateTime.UtcNow
            };

            await context.Profiles.AddRangeAsync(dogukan, testUser, jane);

            // 2. Connections
            var connection1 = new Connection
            {
                Id = Guid.NewGuid(),
                RequesterId = dogukan.Id,
                AddresseeId = testUser.Id,
                Status = ConnectionStatus.Accepted,
                CreatedAt = DateTime.UtcNow
            };

            var connection2 = new Connection
            {
                Id = Guid.NewGuid(),
                RequesterId = jane.Id,
                AddresseeId = dogukan.Id,
                Status = ConnectionStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            await context.Connections.AddRangeAsync(connection1, connection2);

            // 3. Meetings
            var pastMeeting = new Meeting
            {
                Id = Guid.NewGuid(),
                HostId = dogukan.Id,
                Title = "Proje Planlama (Geçmiş)",
                Description = "Geçen haftaki planlama toplantısı",
                ScheduledAt = DateTime.UtcNow.AddDays(-2),
                IsInstant = false,
                MaxParticipants = 5,
                CreatedAt = DateTime.UtcNow.AddDays(-5)
            };

            var futureMeeting = new Meeting
            {
                Id = Guid.NewGuid(),
                HostId = testUser.Id,
                Title = "Haftalık Senkronizasyon",
                Description = "Genel durum değerlendirmesi",
                ScheduledAt = DateTime.UtcNow.AddDays(2),
                IsInstant = false,
                MaxParticipants = 10,
                CreatedAt = DateTime.UtcNow
            };

            await context.Meetings.AddRangeAsync(pastMeeting, futureMeeting);

            // Meeting Participants
            await context.MeetingParticipants.AddRangeAsync(
                new MeetingParticipant { Id = Guid.NewGuid(), MeetingId = pastMeeting.Id, ProfileId = testUser.Id, Status = MeetingParticipantStatus.Accepted, InvitedAt = DateTime.UtcNow, RespondedAt = DateTime.UtcNow },
                new MeetingParticipant { Id = Guid.NewGuid(), MeetingId = pastMeeting.Id, ProfileId = jane.Id, Status = MeetingParticipantStatus.Rejected, InvitedAt = DateTime.UtcNow, RespondedAt = DateTime.UtcNow },
                
                new MeetingParticipant { Id = Guid.NewGuid(), MeetingId = futureMeeting.Id, ProfileId = dogukan.Id, Status = MeetingParticipantStatus.Invited, InvitedAt = DateTime.UtcNow }
            );

            // 4. Notifications
            await context.Notifications.AddAsync(new Notification
            {
                Id = Guid.NewGuid(),
                RecipientId = dogukan.Id,
                Type = NotificationType.ConnectionRequest,
                Message = "Jane Doe sent you a connection request.",
                ReferenceId = connection2.Id,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            });

            await context.SaveChangesAsync();
            logger.LogInformation("Seed verileri başarıyla eklendi.");
        }
        else
        {
            logger.LogInformation("Veritabanında zaten veri var, seed atlandı.");
        }
    }
}
