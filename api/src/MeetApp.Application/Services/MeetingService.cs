using MeetApp.Application.Dtos.Meeting;
using MeetApp.Application.Interfaces;
using MeetApp.Domain.Entities;
using MeetApp.Domain.Enums;
using MeetApp.Domain.Exceptions;
using MeetApp.Domain.Interfaces;

namespace MeetApp.Application.Services;

public class MeetingService(
    IMeetingRepository meetingRepository,
    IMeetingParticipantRepository participantRepository,
    IProfileRepository profileRepository) : IMeetingService
{
    public async Task<MeetingResponse> CreateMeetingAsync(Guid hostId, CreateMeetingRequest request, CancellationToken ct = default)
    {
        var host = await profileRepository.GetByIdAsync(hostId, ct)
            ?? throw new NotFoundException("Profile", hostId);

        var meeting = new Meeting
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            HostId = hostId,
            ScheduledAt = request.ScheduledAt,
            IsInstant = request.IsInstant,
            Password = request.Password,
            MaxParticipants = request.MaxParticipants,
            CreatedAt = DateTime.UtcNow
        };

        await meetingRepository.AddAsync(meeting, ct);
        await meetingRepository.SaveChangesAsync(ct);

        // Host da katilimci olarak eklenir; boylece katilimci listeleri ve
        // "toplantilarim" sorgulari host'u de kapsar.
        await participantRepository.AddAsync(new MeetingParticipant
        {
            Id = Guid.NewGuid(),
            MeetingId = meeting.Id,
            ProfileId = hostId,
            Status = MeetingParticipantStatus.Accepted,
            InvitedAt = DateTime.UtcNow,
            RespondedAt = DateTime.UtcNow
        }, ct);
        await participantRepository.SaveChangesAsync(ct);

        return ToResponse(meeting, host.FullName);
    }

    public async Task<IEnumerable<MeetingResponse>> GetMyMeetingsAsync(Guid profileId, string? scope = null, CancellationToken ct = default)
    {
        var meetings = await meetingRepository.GetByProfileIdAsync(profileId, scope, ct);
        return meetings.Select(m => ToResponse(m, m.Host?.FullName ?? string.Empty));
    }

    public async Task<MeetingDetailResponse> GetMeetingByIdAsync(Guid id, Guid requesterId, CancellationToken ct = default)
    {
        var meeting = await meetingRepository.GetByIdWithParticipantsAsync(id, ct)
            ?? throw new NotFoundException("Meeting", id);

        var participants = meeting.Participants.Select(p => new ParticipantResponse(
            p.Id, p.MeetingId, p.ProfileId,
            p.Profile.FullName, p.Profile.Username, p.Profile.AvatarUrl,
            p.Status, p.InvitedAt, p.RespondedAt));

        return new MeetingDetailResponse(
            meeting.Id, meeting.Title, meeting.Description,
            meeting.HostId, meeting.Host?.FullName ?? string.Empty,
            meeting.ScheduledAt, meeting.IsInstant,
            meeting.Password is not null, meeting.MaxParticipants,
            meeting.CreatedAt, participants);
    }

    public async Task<MeetingResponse> UpdateMeetingAsync(Guid id, Guid hostId, UpdateMeetingRequest request, CancellationToken ct = default)
    {
        var meeting = await meetingRepository.GetByIdWithParticipantsAsync(id, ct)
            ?? throw new NotFoundException("Meeting", id);

        if (meeting.HostId != hostId)
            throw new ForbiddenException("Only the host can update this meeting.");

        if (request.Title is not null) meeting.Title = request.Title;
        if (request.Description is not null) meeting.Description = request.Description;
        if (request.ScheduledAt is not null) meeting.ScheduledAt = request.ScheduledAt;
        if (request.Password is not null) meeting.Password = request.Password;
        if (request.MaxParticipants is not null) meeting.MaxParticipants = request.MaxParticipants.Value;

        meetingRepository.Update(meeting);
        await meetingRepository.SaveChangesAsync(ct);

        return ToResponse(meeting, meeting.Host?.FullName ?? string.Empty);
    }

    public async Task DeleteMeetingAsync(Guid id, Guid hostId, CancellationToken ct = default)
    {
        var meeting = await meetingRepository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Meeting", id);

        if (meeting.HostId != hostId)
            throw new ForbiddenException("Only the host can delete this meeting.");

        meetingRepository.Remove(meeting);
        await meetingRepository.SaveChangesAsync(ct);
    }

    public async Task JoinMeetingAsync(Guid id, Guid profileId, string? password = null, CancellationToken ct = default)
    {
        var meeting = await meetingRepository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Meeting", id);

        if (meeting.Password is not null && meeting.Password != password)
            throw new ForbiddenException("Incorrect meeting password.");

        var existing = await participantRepository.GetByMeetingAndProfileAsync(id, profileId, ct);
        if (existing is not null)
        {
            existing.Status = MeetingParticipantStatus.Accepted;
            existing.RespondedAt = DateTime.UtcNow;
            participantRepository.Update(existing);
        }
        else
        {
            var participant = new MeetingParticipant
            {
                Id = Guid.NewGuid(),
                MeetingId = id,
                ProfileId = profileId,
                Status = MeetingParticipantStatus.Accepted,
                InvitedAt = DateTime.UtcNow,
                RespondedAt = DateTime.UtcNow
            };
            await participantRepository.AddAsync(participant, ct);
        }

        await participantRepository.SaveChangesAsync(ct);
    }

    public async Task LeaveMeetingAsync(Guid id, Guid profileId, CancellationToken ct = default)
    {
        var participant = await participantRepository.GetByMeetingAndProfileAsync(id, profileId, ct)
            ?? throw new NotFoundException("Participant not found in meeting.");

        participant.Status = MeetingParticipantStatus.Rejected;
        participant.RespondedAt = DateTime.UtcNow;
        participantRepository.Update(participant);
        await participantRepository.SaveChangesAsync(ct);
    }

    public async Task<bool> IsParticipantAsync(Guid meetingId, Guid profileId, CancellationToken ct = default)
    {
        var meeting = await meetingRepository.GetByIdAsync(meetingId, ct);
        if (meeting is null) return false;
        if (meeting.HostId == profileId) return true;

        var participant = await participantRepository.GetByMeetingAndProfileAsync(meetingId, profileId, ct);
        return participant?.Status == MeetingParticipantStatus.Accepted;
    }

    private static MeetingResponse ToResponse(Meeting m, string hostFullName) =>
        new(m.Id, m.Title, m.Description, m.HostId, hostFullName,
            m.ScheduledAt, m.IsInstant, m.Password is not null,
            m.MaxParticipants, m.CreatedAt);
}
