using MeetApp.Application.Dtos.Meeting;
using MeetApp.Application.Dtos.Notification;
using MeetApp.Application.Interfaces;
using MeetApp.Domain.Entities;
using MeetApp.Domain.Enums;
using MeetApp.Domain.Exceptions;
using MeetApp.Domain.Interfaces;

namespace MeetApp.Application.Services;

public class MeetingParticipantService(
    IMeetingRepository meetingRepository,
    IMeetingParticipantRepository participantRepository,
    IProfileRepository profileRepository,
    INotificationRepository notificationRepository,
    INotificationPublisher notificationPublisher,
    IMeetingRealtimeNotifier? meetingNotifier = null) : IMeetingParticipantService
{
    public async Task<IEnumerable<ParticipantResponse>> GetParticipantsAsync(Guid meetingId, CancellationToken ct = default)
    {
        var participants = await participantRepository.GetByMeetingIdAsync(meetingId, ct);
        return participants.Select(ToResponse);
    }

    public async Task<ParticipantResponse> InviteParticipantAsync(Guid meetingId, Guid hostId, InviteParticipantRequest request, CancellationToken ct = default)
    {
        var meeting = await meetingRepository.GetByIdAsync(meetingId, ct)
            ?? throw new NotFoundException("Meeting", meetingId);

        if (meeting.HostId != hostId)
            throw new ForbiddenException("Only the host can invite participants.");

        var invitee = await profileRepository.GetByIdAsync(request.ProfileId, ct)
            ?? throw new NotFoundException("Profile", request.ProfileId);

        var existing = await participantRepository.GetByMeetingAndProfileAsync(meetingId, request.ProfileId, ct);
        if (existing is not null) throw new BusinessException("User is already a participant.");

        var participant = new MeetingParticipant
        {
            Id = Guid.NewGuid(),
            MeetingId = meetingId,
            ProfileId = request.ProfileId,
            Status = MeetingParticipantStatus.Invited,
            InvitedAt = DateTime.UtcNow
        };

        await participantRepository.AddAsync(participant, ct);
        await participantRepository.SaveChangesAsync(ct);

        // Send notification
        var host = await profileRepository.GetByIdAsync(hostId, ct);
        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            RecipientId = request.ProfileId,
            Type = NotificationType.MeetingInvite,
            Message = $"{host?.FullName} has invited you to '{meeting.Title}'.",
            ReferenceId = meetingId,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };
        await notificationRepository.AddAsync(notification, ct);
        await notificationRepository.SaveChangesAsync(ct);

        var notifDto = new NotificationResponse(
            notification.Id, notification.RecipientId, notification.Type,
            notification.Message, notification.ReferenceId,
            notification.IsRead, notification.CreatedAt);

        await notificationPublisher.PublishAsync(request.ProfileId, notifDto, ct);

        return ToResponse(participant);
    }

    public async Task<ParticipantResponse> UpdateParticipantStatusAsync(Guid meetingId, Guid participantId, Guid requesterId, UpdateParticipantStatusRequest request, CancellationToken ct = default)
    {
        var meeting = await meetingRepository.GetByIdAsync(meetingId, ct)
            ?? throw new NotFoundException("Meeting", meetingId);

        var participant = await participantRepository.GetByIdAsync(participantId, ct)
            ?? throw new NotFoundException("Participant", participantId);

        if (participant.MeetingId != meetingId)
            throw new NotFoundException("Participant", participantId);

        var isHost = meeting.HostId == requesterId;
        if (participant.ProfileId != requesterId && !isHost)
            throw new ForbiddenException("Cannot update another participant's status.");

        participant.Status = request.Status;
        participant.RespondedAt = DateTime.UtcNow;

        participantRepository.Update(participant);
        await participantRepository.SaveChangesAsync(ct);

        if (meetingNotifier != null)
        {
            if (request.Status == MeetingParticipantStatus.Accepted)
            {
                await meetingNotifier.NotifyJoinApprovedAsync(meetingId, participant.ProfileId);
                await meetingNotifier.NotifyWaitingRoomUpdatedAsync(meetingId);
            }
            else if (request.Status == MeetingParticipantStatus.Rejected)
            {
                await meetingNotifier.NotifyJoinRejectedAsync(meetingId, participant.ProfileId);
                await meetingNotifier.NotifyWaitingRoomUpdatedAsync(meetingId);
            }
        }

        return ToResponse(participant);
    }

    public async Task<ParticipantResponse> ApproveParticipantAsync(Guid meetingId, Guid participantId, Guid hostId, CancellationToken ct = default)
    {
        var meeting = await meetingRepository.GetByIdAsync(meetingId, ct)
            ?? throw new NotFoundException("Meeting", meetingId);

        if (meeting.HostId != hostId)
            throw new ForbiddenException("Only the host can approve participants.");

        var participant = await participantRepository.GetByIdAsync(participantId, ct)
            ?? throw new NotFoundException("Participant", participantId);

        if (participant.MeetingId != meetingId)
            throw new NotFoundException("Participant", participantId);

        participant.Status = MeetingParticipantStatus.Accepted;
        participant.RespondedAt = DateTime.UtcNow;

        participantRepository.Update(participant);
        await participantRepository.SaveChangesAsync(ct);

        if (meetingNotifier != null)
        {
            await meetingNotifier.NotifyJoinApprovedAsync(meetingId, participant.ProfileId);
            await meetingNotifier.NotifyWaitingRoomUpdatedAsync(meetingId);
        }

        return ToResponse(participant);
    }

    public async Task<ParticipantResponse> RejectParticipantAsync(Guid meetingId, Guid participantId, Guid hostId, CancellationToken ct = default)
    {
        var meeting = await meetingRepository.GetByIdAsync(meetingId, ct)
            ?? throw new NotFoundException("Meeting", meetingId);

        if (meeting.HostId != hostId)
            throw new ForbiddenException("Only the host can reject participants.");

        var participant = await participantRepository.GetByIdAsync(participantId, ct)
            ?? throw new NotFoundException("Participant", participantId);

        if (participant.MeetingId != meetingId)
            throw new NotFoundException("Participant", participantId);

        participant.Status = MeetingParticipantStatus.Rejected;
        participant.RespondedAt = DateTime.UtcNow;

        participantRepository.Update(participant);
        await participantRepository.SaveChangesAsync(ct);

        if (meetingNotifier != null)
        {
            await meetingNotifier.NotifyJoinRejectedAsync(meetingId, participant.ProfileId);
            await meetingNotifier.NotifyWaitingRoomUpdatedAsync(meetingId);
        }

        return ToResponse(participant);
    }

    public async Task RemoveParticipantAsync(Guid meetingId, Guid participantId, Guid hostId, CancellationToken ct = default)
    {
        var meeting = await meetingRepository.GetByIdAsync(meetingId, ct)
            ?? throw new NotFoundException("Meeting", meetingId);

        if (meeting.HostId != hostId)
            throw new ForbiddenException("Only the host can remove participants.");

        var participant = await participantRepository.GetByIdAsync(participantId, ct)
            ?? throw new NotFoundException("Participant", participantId);

        participant.Status = MeetingParticipantStatus.Removed;
        participantRepository.Update(participant);
        await participantRepository.SaveChangesAsync(ct);

        if (meetingNotifier != null)
        {
            await meetingNotifier.NotifyParticipantKickedAsync(meetingId, participant.ProfileId);
            await meetingNotifier.NotifyParticipantRemovedAsync(meetingId, participant.Id, participant.ProfileId);
        }
    }

    private static ParticipantResponse ToResponse(MeetingParticipant p) =>
        new(p.Id, p.MeetingId, p.ProfileId,
            p.Profile?.FullName ?? string.Empty,
            p.Profile?.Username ?? string.Empty,
            p.Profile?.AvatarUrl,
            p.Status, p.InvitedAt, p.RespondedAt);
}
