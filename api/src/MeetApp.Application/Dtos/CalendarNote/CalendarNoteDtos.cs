namespace MeetApp.Application.Dtos.CalendarNote;

public record CreateCalendarNoteRequest(DateOnly Date, string Content);

public record UpdateCalendarNoteRequest(string Content);

public record CalendarNoteResponse(
    Guid Id,
    Guid ProfileId,
    DateOnly Date,
    string Content,
    DateTime CreatedAt
);
