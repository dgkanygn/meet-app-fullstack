using MeetApp.Application.Dtos.CalendarNote;
using MeetApp.Application.Interfaces;
using MeetApp.Domain.Entities;
using MeetApp.Domain.Exceptions;
using MeetApp.Domain.Interfaces;

namespace MeetApp.Application.Services;

public class CalendarNoteService(ICalendarNoteRepository calendarNoteRepository) : ICalendarNoteService
{
    public async Task<IEnumerable<CalendarNoteResponse>> GetNotesByMonthAsync(Guid profileId, int year, int month, CancellationToken ct = default)
    {
        var notes = await calendarNoteRepository.GetByMonthAsync(profileId, year, month, ct);
        return notes.Select(ToResponse);
    }

    public async Task<CalendarNoteResponse> CreateNoteAsync(Guid profileId, CreateCalendarNoteRequest request, CancellationToken ct = default)
    {
        var note = new CalendarNote
        {
            Id = Guid.NewGuid(),
            ProfileId = profileId,
            Date = request.Date,
            Content = request.Content,
            CreatedAt = DateTime.UtcNow
        };

        await calendarNoteRepository.AddAsync(note, ct);
        await calendarNoteRepository.SaveChangesAsync(ct);
        return ToResponse(note);
    }

    public async Task<CalendarNoteResponse> UpdateNoteAsync(Guid id, Guid profileId, UpdateCalendarNoteRequest request, CancellationToken ct = default)
    {
        var note = await calendarNoteRepository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("CalendarNote", id);

        if (note.ProfileId != profileId)
            throw new ForbiddenException("Cannot update another user's note.");

        note.Content = request.Content;
        calendarNoteRepository.Update(note);
        await calendarNoteRepository.SaveChangesAsync(ct);
        return ToResponse(note);
    }

    public async Task DeleteNoteAsync(Guid id, Guid profileId, CancellationToken ct = default)
    {
        var note = await calendarNoteRepository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("CalendarNote", id);

        if (note.ProfileId != profileId)
            throw new ForbiddenException("Cannot delete another user's note.");

        calendarNoteRepository.Remove(note);
        await calendarNoteRepository.SaveChangesAsync(ct);
    }

    private static CalendarNoteResponse ToResponse(CalendarNote n) =>
        new(n.Id, n.ProfileId, n.Date, n.Content, n.CreatedAt);
}
