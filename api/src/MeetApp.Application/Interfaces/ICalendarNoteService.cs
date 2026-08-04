using MeetApp.Application.Dtos.CalendarNote;

namespace MeetApp.Application.Interfaces;

public interface ICalendarNoteService
{
    Task<IEnumerable<CalendarNoteResponse>> GetNotesByMonthAsync(Guid profileId, int year, int month, CancellationToken ct = default);
    Task<CalendarNoteResponse> CreateNoteAsync(Guid profileId, CreateCalendarNoteRequest request, CancellationToken ct = default);
    Task<CalendarNoteResponse> UpdateNoteAsync(Guid id, Guid profileId, UpdateCalendarNoteRequest request, CancellationToken ct = default);
    Task DeleteNoteAsync(Guid id, Guid profileId, CancellationToken ct = default);
}
