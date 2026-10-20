using System.Security.Claims;
using MeetApp.Application.Interfaces;
using MeetApp.Domain.Enums;
using MeetApp.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace MeetApp.Api.Hubs;

[Authorize]
public class MeetingHub(
    IMeetingService meetingService,
    IMeetingRepository meetingRepository,
    IMeetingParticipantRepository participantRepository,
    IProfileRepository profileRepository,
    IMeetingRoomTracker meetingRoomTracker,
    IMeetingRealtimeNotifier meetingNotifier) : Hub
{
    public override async Task OnConnectedAsync()
    {
        var meetingIdStr = Context.GetHttpContext()?.Request.Query["meetingId"].ToString();
        var userIdStr = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(meetingIdStr) || string.IsNullOrEmpty(userIdStr) ||
            !Guid.TryParse(meetingIdStr, out var meetingId) || !Guid.TryParse(userIdStr, out var userId))
        {
            Context.Abort();
            return;
        }

        var meeting = await meetingRepository.GetByIdAsync(meetingId);
        if (meeting is null || meeting.EndedAt is not null)
        {
            Context.Abort();
            return;
        }

        var isHost = meeting.HostId == userId;
        var participant = await participantRepository.GetByMeetingAndProfileAsync(meetingId, userId);

        if (isHost || participant?.Status == MeetingParticipantStatus.Accepted)
        {
            meetingRoomTracker.TrackUserJoined(meetingId, userId, Context.ConnectionId);

            await Groups.AddToGroupAsync(Context.ConnectionId, $"meeting-{meetingId}");

            // Diğer katılımcılara haber ver
            await Clients.OthersInGroup($"meeting-{meetingId}").SendAsync("UserJoined", new
            {
                userId = userIdStr,
                connectionId = Context.ConnectionId
            });
        }
        else if (participant?.Status == MeetingParticipantStatus.Waiting)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"meeting-{meetingId}-waiting");

            var profile = await profileRepository.GetByIdAsync(userId);
            await meetingNotifier.NotifyUserWaitingAsync(
                meetingId,
                userId,
                participant.Id,
                profile?.FullName ?? "Katılımcı",
                profile?.Username ?? "",
                profile?.AvatarUrl);
        }
        else
        {
            Context.Abort();
            return;
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var meetingIdStr = Context.GetHttpContext()?.Request.Query["meetingId"].ToString();
        var userIdStr = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!string.IsNullOrEmpty(meetingIdStr) && Guid.TryParse(meetingIdStr, out var meetingId))
        {
            meetingRoomTracker.TrackUserLeft(meetingId, Context.ConnectionId);

            await Clients.OthersInGroup($"meeting-{meetingId}").SendAsync("UserLeft", new
            {
                userId = userIdStr,
                connectionId = Context.ConnectionId
            });
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"meeting-{meetingId}");
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"meeting-{meetingId}-waiting");

            await meetingNotifier.NotifyWaitingRoomUpdatedAsync(meetingId);
        }

        await base.OnDisconnectedAsync(exception);
    }

    private string? CurrentUserId => Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);

    // ─── WebRTC Signaling Methods ──────────────────────────────────────────
    public async Task SendOffer(string targetConnectionId, object offer)
    {
        await Clients.Client(targetConnectionId).SendAsync("ReceiveOffer", new
        {
            fromConnectionId = Context.ConnectionId,
            fromUserId = CurrentUserId,
            offer
        });
    }

    public async Task SendAnswer(string targetConnectionId, object answer)
    {
        await Clients.Client(targetConnectionId).SendAsync("ReceiveAnswer", new
        {
            fromConnectionId = Context.ConnectionId,
            fromUserId = CurrentUserId,
            answer
        });
    }

    public async Task SendIceCandidate(string targetConnectionId, object candidate)
    {
        await Clients.Client(targetConnectionId).SendAsync("ReceiveIceCandidate", new
        {
            fromConnectionId = Context.ConnectionId,
            fromUserId = CurrentUserId,
            candidate
        });
    }

    // ─── Live Meeting Chat ────────────────────────────────────────────────
    public async Task SendChatMessage(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return;

        var meetingIdStr = Context.GetHttpContext()?.Request.Query["meetingId"].ToString();
        var userIdStr = CurrentUserId;

        if (string.IsNullOrEmpty(meetingIdStr) || string.IsNullOrEmpty(userIdStr) ||
            !Guid.TryParse(meetingIdStr, out var meetingId) || !Guid.TryParse(userIdStr, out var userId))
            return;

        var isParticipant = await meetingService.IsParticipantAsync(meetingId, userId);
        if (!isParticipant) return;

        var profile = await profileRepository.GetByIdAsync(userId);

        var messageDto = new
        {
            id = Guid.NewGuid().ToString(),
            meetingId = meetingIdStr,
            senderId = userIdStr,
            senderFullName = profile?.FullName ?? "Katılımcı",
            senderUsername = profile?.Username ?? "",
            senderAvatarUrl = profile?.AvatarUrl,
            text = text.Trim(),
            sentAt = DateTime.UtcNow
        };

        await Clients.Group($"meeting-{meetingId}").SendAsync("ReceiveChatMessage", messageDto);
    }

    // ─── Host Meeting Controls ────────────────────────────────────────────
    public async Task ApproveParticipant(string participantIdStr)
    {
        var meetingIdStr = Context.GetHttpContext()?.Request.Query["meetingId"].ToString();
        var userIdStr = CurrentUserId;

        if (string.IsNullOrEmpty(meetingIdStr) || string.IsNullOrEmpty(userIdStr) ||
            !Guid.TryParse(meetingIdStr, out var meetingId) || !Guid.TryParse(userIdStr, out var userId) ||
            !Guid.TryParse(participantIdStr, out var participantId))
            return;

        var meeting = await meetingRepository.GetByIdAsync(meetingId);
        if (meeting == null || meeting.HostId != userId) return;

        var participant = await participantRepository.GetByIdAsync(participantId);
        if (participant == null || participant.MeetingId != meetingId) return;

        participant.Status = MeetingParticipantStatus.Accepted;
        participant.RespondedAt = DateTime.UtcNow;
        participantRepository.Update(participant);
        await participantRepository.SaveChangesAsync();

        await meetingNotifier.NotifyJoinApprovedAsync(meetingId, participant.ProfileId);
        await meetingNotifier.NotifyWaitingRoomUpdatedAsync(meetingId);
    }

    public async Task RejectParticipant(string participantIdStr)
    {
        var meetingIdStr = Context.GetHttpContext()?.Request.Query["meetingId"].ToString();
        var userIdStr = CurrentUserId;

        if (string.IsNullOrEmpty(meetingIdStr) || string.IsNullOrEmpty(userIdStr) ||
            !Guid.TryParse(meetingIdStr, out var meetingId) || !Guid.TryParse(userIdStr, out var userId) ||
            !Guid.TryParse(participantIdStr, out var participantId))
            return;

        var meeting = await meetingRepository.GetByIdAsync(meetingId);
        if (meeting == null || meeting.HostId != userId) return;

        var participant = await participantRepository.GetByIdAsync(participantId);
        if (participant == null || participant.MeetingId != meetingId) return;

        participant.Status = MeetingParticipantStatus.Rejected;
        participant.RespondedAt = DateTime.UtcNow;
        participantRepository.Update(participant);
        await participantRepository.SaveChangesAsync();

        await meetingNotifier.NotifyJoinRejectedAsync(meetingId, participant.ProfileId);
        await meetingNotifier.NotifyWaitingRoomUpdatedAsync(meetingId);
    }

    public async Task KickParticipant(string participantIdStr)
    {
        var meetingIdStr = Context.GetHttpContext()?.Request.Query["meetingId"].ToString();
        var userIdStr = CurrentUserId;

        if (string.IsNullOrEmpty(meetingIdStr) || string.IsNullOrEmpty(userIdStr) ||
            !Guid.TryParse(meetingIdStr, out var meetingId) || !Guid.TryParse(userIdStr, out var userId) ||
            !Guid.TryParse(participantIdStr, out var participantId))
            return;

        var meeting = await meetingRepository.GetByIdAsync(meetingId);
        if (meeting == null || meeting.HostId != userId) return;

        var participant = await participantRepository.GetByIdAsync(participantId);
        if (participant == null || participant.MeetingId != meetingId) return;

        participant.Status = MeetingParticipantStatus.Removed;
        participantRepository.Update(participant);
        await participantRepository.SaveChangesAsync();

        await meetingNotifier.NotifyParticipantKickedAsync(meetingId, participant.ProfileId);
        await meetingNotifier.NotifyParticipantRemovedAsync(meetingId, participant.Id, participant.ProfileId);
    }
}
