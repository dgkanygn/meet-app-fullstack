using MeetApp.Application.Interfaces;
using MeetApp.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace MeetApp.Application;

public static class ApplicationServiceExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IProfileService, ProfileService>();
        services.AddScoped<IMeetingService, MeetingService>();
        services.AddScoped<IMeetingParticipantService, MeetingParticipantService>();
        services.AddScoped<IConnectionService, ConnectionService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<ICalendarNoteService, CalendarNoteService>();
        return services;
    }
}
