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
    IProfileRepository profileRepository,
    IMeetingRoomTracker? roomTracker = null,
    IMeetingRealtimeNotifier? meetingNotifier = null) : IMeetingService
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
        var hostParticipant = new MeetingParticipant
        {
            Id = Guid.NewGuid(),
            MeetingId = meeting.Id,
            ProfileId = hostId,
            Status = MeetingParticipantStatus.Accepted,
            InvitedAt = DateTime.UtcNow,
            RespondedAt = DateTime.UtcNow
        };
        await participantRepository.AddAsync(hostParticipant, ct);
        await participantRepository.SaveChangesAsync(ct);

        meeting.Participants = [hostParticipant];
        hostParticipant.Profile = host;

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
            p.Status, p.InvitedAt, p.RespondedAt)).ToList();

        var activeIds = roomTracker?.GetConnectedUserIds(meeting.Id);

        return new MeetingDetailResponse(
            meeting.Id, meeting.Title, meeting.Description,
            meeting.HostId, meeting.Host?.FullName ?? string.Empty,
            meeting.ScheduledAt, meeting.IsInstant,
            meeting.Password is not null, meeting.MaxParticipants,
            meeting.CreatedAt, meeting.EndedAt, participants, activeIds);
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

    public async Task<MeetingParticipantStatus> JoinMeetingAsync(Guid id, Guid profileId, string? password = null, CancellationToken ct = default)
    {
        var meeting = await meetingRepository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Meeting", id);

        if (meeting.EndedAt is not null)
            throw new BusinessException("Bu davet bağlantısı eskimiş.");

        var existing = await participantRepository.GetByMeetingAndProfileAsync(id, profileId, ct);
        var isHost = meeting.HostId == profileId;
        var isAlreadyAccepted = existing?.Status == MeetingParticipantStatus.Accepted;

        // Host veya zaten odaya kabul edilmiş katılımcılardan şifre istenmez
        if (!isHost && !isAlreadyAccepted)
        {
            if (meeting.Password is not null && meeting.Password != password)
                throw new ForbiddenException("Incorrect meeting password.");
        }

        // Host her zaman Accepted durumundadır.
        // Katılımcı zaten bu oturumda kabul edilmişse (sayfa yenileme) Accepted kalır, değilse Waiting olur.
        var targetStatus = isHost
            ? MeetingParticipantStatus.Accepted
            : (isAlreadyAccepted ? MeetingParticipantStatus.Accepted : MeetingParticipantStatus.Waiting);

        Guid participantId;
        if (existing is not null)
        {
            participantId = existing.Id;
            existing.Status = targetStatus;
            existing.RespondedAt = DateTime.UtcNow;
            participantRepository.Update(existing);
        }
        else
        {
            participantId = Guid.NewGuid();
            var participant = new MeetingParticipant
            {
                Id = participantId,
                MeetingId = id,
                ProfileId = profileId,
                Status = targetStatus,
                InvitedAt = DateTime.UtcNow,
                RespondedAt = DateTime.UtcNow
            };
            await participantRepository.AddAsync(participant, ct);
        }

        await participantRepository.SaveChangesAsync(ct);

        if (targetStatus == MeetingParticipantStatus.Waiting && meetingNotifier != null)
        {
            var profile = await profileRepository.GetByIdAsync(profileId, ct);
            if (profile != null)
            {
                await meetingNotifier.NotifyUserWaitingAsync(
                    id, profileId, participantId, profile.FullName, profile.Username, profile.AvatarUrl);
            }
        }

        return targetStatus;
    }

    public async Task LeaveMeetingAsync(Guid id, Guid profileId, CancellationToken ct = default)
    {
        var meeting = await meetingRepository.GetByIdAsync(id, ct);
        var participant = await participantRepository.GetByMeetingAndProfileAsync(id, profileId, ct);
        if (participant is not null)
        {
            participant.RespondedAt = DateTime.UtcNow;
            // Host olmayan katılımcı toplantıdan çıktığında, tekrar girerse onay gereksin diye durumunu Waiting'e alıyoruz
            if (meeting != null && meeting.HostId != profileId && participant.Status == MeetingParticipantStatus.Accepted)
            {
                participant.Status = MeetingParticipantStatus.Waiting;
            }
            participantRepository.Update(participant);
            await participantRepository.SaveChangesAsync(ct);

            if (meetingNotifier != null)
            {
                await meetingNotifier.NotifyWaitingRoomUpdatedAsync(id);
            }
        }
    }

    public async Task EndMeetingAsync(Guid id, CancellationToken ct = default)
    {
        var meeting = await meetingRepository.GetByIdAsync(id, ct);
        if (meeting is not null && meeting.EndedAt is null)
        {
            meeting.EndedAt = DateTime.UtcNow;
            meetingRepository.Update(meeting);
            await meetingRepository.SaveChangesAsync(ct);
        }
    }

    public async Task<bool> IsParticipantAsync(Guid meetingId, Guid profileId, CancellationToken ct = default)
    {
        var meeting = await meetingRepository.GetByIdAsync(meetingId, ct);
        if (meeting is null || meeting.EndedAt is not null) return false;
        if (meeting.HostId == profileId) return true;

        var participant = await participantRepository.GetByMeetingAndProfileAsync(meetingId, profileId, ct);
        return participant?.Status == MeetingParticipantStatus.Accepted;
    }

    private MeetingResponse ToResponse(Meeting m, string hostFullName)
    {
        var participants = m.Participants?.Select(p => new ParticipantResponse(
            p.Id, p.MeetingId, p.ProfileId,
            p.Profile?.FullName ?? string.Empty, p.Profile?.Username ?? string.Empty, p.Profile?.AvatarUrl,
            p.Status, p.InvitedAt, p.RespondedAt)).ToList();

        var activeIds = roomTracker?.GetConnectedUserIds(m.Id);

        return new(m.Id, m.Title, m.Description, m.HostId, hostFullName,
            m.ScheduledAt, m.IsInstant, m.Password is not null,
            m.MaxParticipants, m.CreatedAt, m.EndedAt, participants, activeIds);
    }
}
