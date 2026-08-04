using MeetApp.Domain.Entities;
using MeetApp.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MeetApp.Infrastructure.Persistence.Repositories;

public class CalendarNoteRepository(AppDbContext context) : GenericRepository<CalendarNote>(context), ICalendarNoteRepository
{
    public async Task<IEnumerable<CalendarNote>> GetByMonthAsync(Guid profileId, int year, int month, CancellationToken ct = default) =>
        await _set
            .Where(cn => cn.ProfileId == profileId && cn.Date.Year == year && cn.Date.Month == month)
            .OrderBy(cn => cn.Date)
            .ToListAsync(ct);
}
