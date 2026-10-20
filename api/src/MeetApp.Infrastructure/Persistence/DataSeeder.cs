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

        try
        {
            await context.Database.ExecuteSqlRawAsync("ALTER TABLE meetings ADD COLUMN IF NOT EXISTS \"EndedAt\" timestamp with time zone;");
            await context.Database.ExecuteSqlRawAsync(@"
                CREATE TABLE IF NOT EXISTS direct_messages (
                    ""Id"" uuid NOT NULL,
                    ""SenderId"" uuid NOT NULL,
                    ""ReceiverId"" uuid NOT NULL,
                    ""Content"" character varying(4000) NOT NULL,
                    ""IsRead"" boolean NOT NULL DEFAULT false,
                    ""CreatedAt"" timestamp with time zone NOT NULL,
                    CONSTRAINT ""PK_direct_messages"" PRIMARY KEY (""Id""),
                    CONSTRAINT ""FK_direct_messages_profiles_SenderId"" FOREIGN KEY (""SenderId"") REFERENCES profiles (""Id"") ON DELETE RESTRICT,
                    CONSTRAINT ""FK_direct_messages_profiles_ReceiverId"" FOREIGN KEY (""ReceiverId"") REFERENCES profiles (""Id"") ON DELETE RESTRICT
                );
                CREATE INDEX IF NOT EXISTS ""IX_direct_messages_SenderId_ReceiverId"" ON direct_messages (""SenderId"", ""ReceiverId"");
                CREATE INDEX IF NOT EXISTS ""IX_direct_messages_ReceiverId_SenderId"" ON direct_messages (""ReceiverId"", ""SenderId"");
                CREATE INDEX IF NOT EXISTS ""IX_direct_messages_CreatedAt"" ON direct_messages (""CreatedAt"");
            ");
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Could not alter meetings table or ensure direct_messages table exists.");
        }


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

        // 5. Seed sample direct messages if none exist
        try
        {
            if (!await context.DirectMessages.AnyAsync())
            {
                var dogukanUser = await context.Profiles.FirstOrDefaultAsync(p => p.Username == "dogukan");
                var testUser = await context.Profiles.FirstOrDefaultAsync(p => p.Username == "testuser");
                if (dogukanUser != null && testUser != null)
                {
                    await context.DirectMessages.AddRangeAsync(
                        new DirectMessage
                        {
                            Id = Guid.NewGuid(),
                            SenderId = testUser.Id,
                            ReceiverId = dogukanUser.Id,
                            Content = "Selam Doğukan! MeetApp projesine hoş geldin.",
                            IsRead = true,
                            CreatedAt = DateTime.UtcNow.AddHours(-3)
                        },
                        new DirectMessage
                        {
                            Id = Guid.NewGuid(),
                            SenderId = dogukanUser.Id,
                            ReceiverId = testUser.Id,
                            Content = "Selam! Teşekkürler, mesajlaşma modülü harika görünüyor.",
                            IsRead = true,
                            CreatedAt = DateTime.UtcNow.AddHours(-2)
                        },
                        new DirectMessage
                        {
                            Id = Guid.NewGuid(),
                            SenderId = testUser.Id,
                            ReceiverId = dogukanUser.Id,
                            Content = "Geliştirmeleri test edebilirsin, harika iş!",
                            IsRead = false,
                            CreatedAt = DateTime.UtcNow.AddMinutes(-15)
                        }
                    );
                    await context.SaveChangesAsync();
                    logger.LogInformation("Örnek mesajlar eklendi.");
                }
            }
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Could not seed sample direct messages.");
        }
    }
}

