using MeetApp.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MeetApp.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Profile> Profiles => Set<Profile>();
    public DbSet<Meeting> Meetings => Set<Meeting>();
    public DbSet<MeetingParticipant> MeetingParticipants => Set<MeetingParticipant>();
    public DbSet<Connection> Connections => Set<Connection>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<CalendarNote> CalendarNotes => Set<CalendarNote>();
    public DbSet<DirectMessage> DirectMessages => Set<DirectMessage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
