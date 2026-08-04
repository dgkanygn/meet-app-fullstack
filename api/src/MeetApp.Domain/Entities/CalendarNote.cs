namespace MeetApp.Domain.Entities;

public class CalendarNote
{
    public Guid Id { get; set; }
    public Guid ProfileId { get; set; }
    public DateOnly Date { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    // Navigation
    public Profile Profile { get; set; } = null!;
}
