using MeetApp.Application.Interfaces;
using MeetApp.Domain.Interfaces;
using MeetApp.Infrastructure.Persistence;
using MeetApp.Infrastructure.Persistence.Repositories;
using MeetApp.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MeetApp.Infrastructure;

public static class InfrastructureServiceExtensions
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        // Repositories
        services.AddScoped<IProfileRepository, ProfileRepository>();
        services.AddScoped<IMeetingRepository, MeetingRepository>();
        services.AddScoped<IMeetingParticipantRepository, MeetingParticipantRepository>();
        services.AddScoped<IConnectionRepository, ConnectionRepository>();
        services.AddScoped<INotificationRepository, NotificationRepository>();
        services.AddScoped<ICalendarNoteRepository, CalendarNoteRepository>();
        services.AddScoped<IDirectMessageRepository, DirectMessageRepository>();

        // Security
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();

        return services;
    }
}
