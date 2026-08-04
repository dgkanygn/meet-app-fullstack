using MeetApp.Domain.Entities;

namespace MeetApp.Domain.Interfaces;

public interface ICalendarNoteRepository : IRepository<CalendarNote>
{
    Task<IEnumerable<CalendarNote>> GetByMonthAsync(Guid profileId, int year, int month, CancellationToken ct = default);
}
