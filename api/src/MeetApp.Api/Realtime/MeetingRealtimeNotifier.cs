using MeetApp.Api.Hubs;
using MeetApp.Application.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace MeetApp.Api.Realtime;

public class MeetingRealtimeNotifier(IHubContext<MeetingHub> hubContext) : IMeetingRealtimeNotifier
{
    public async Task NotifyUserWaitingAsync(Guid meetingId, Guid profileId, Guid participantId, string fullName, string username, string? avatarUrl)
    {
        await hubContext.Clients.Group($"meeting-{meetingId}").SendAsync("UserWaiting", new
        {
            meetingId,
            profileId,
            participantId,
            fullName,
            username,
            avatarUrl
        });

        await hubContext.Clients.Group($"meeting-{meetingId}").SendAsync("WaitingRoomUpdated");
    }

    public async Task NotifyWaitingRoomUpdatedAsync(Guid meetingId)
    {
        await hubContext.Clients.Group($"meeting-{meetingId}").SendAsync("WaitingRoomUpdated");
    }

    public async Task NotifyJoinApprovedAsync(Guid meetingId, Guid profileId)
    {
        var payload = new { meetingId, profileId };
        await hubContext.Clients.User(profileId.ToString()).SendAsync("JoinApproved", payload);
        await hubContext.Clients.Group($"meeting-{meetingId}-waiting").SendAsync("JoinApproved", payload);
    }

    public async Task NotifyJoinRejectedAsync(Guid meetingId, Guid profileId)
    {
        var payload = new { meetingId, profileId };
        await hubContext.Clients.User(profileId.ToString()).SendAsync("JoinRejected", payload);
        await hubContext.Clients.Group($"meeting-{meetingId}-waiting").SendAsync("JoinRejected", payload);
    }

    public async Task NotifyParticipantKickedAsync(Guid meetingId, Guid profileId)
    {
        var payload = new { meetingId, kickedUserId = profileId };
        await hubContext.Clients.User(profileId.ToString()).SendAsync("KickedFromMeeting", payload);
        await hubContext.Clients.Group($"meeting-{meetingId}").SendAsync("KickedFromMeeting", payload);
        await hubContext.Clients.Group($"meeting-{meetingId}").SendAsync("UserLeft", new
        {
            userId = profileId.ToString()
        });
    }

    public async Task NotifyParticipantRemovedAsync(Guid meetingId, Guid participantId, Guid profileId)
    {
        await hubContext.Clients.Group($"meeting-{meetingId}").SendAsync("ParticipantRemoved", new
        {
            participantId,
            profileId
        });
    }
}
