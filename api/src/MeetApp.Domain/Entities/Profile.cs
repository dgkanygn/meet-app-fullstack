namespace MeetApp.Domain.Entities;

public class Profile
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
    public string PasswordHash { get; set; } = string.Empty;
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation
    public ICollection<Meeting> HostedMeetings { get; set; } = [];
    public ICollection<MeetingParticipant> MeetingParticipants { get; set; } = [];
    public ICollection<Connection> SentConnections { get; set; } = [];
    public ICollection<Connection> ReceivedConnections { get; set; } = [];
    public ICollection<Notification> Notifications { get; set; } = [];
    public ICollection<CalendarNote> CalendarNotes { get; set; } = [];
}
