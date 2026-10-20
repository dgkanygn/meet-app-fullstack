namespace MeetApp.Application.Interfaces;

public interface IMeetingRealtimeNotifier
{
    Task NotifyUserWaitingAsync(Guid meetingId, Guid profileId, Guid participantId, string fullName, string username, string? avatarUrl);
    Task NotifyWaitingRoomUpdatedAsync(Guid meetingId);
    Task NotifyJoinApprovedAsync(Guid meetingId, Guid profileId);
    Task NotifyJoinRejectedAsync(Guid meetingId, Guid profileId);
    Task NotifyParticipantKickedAsync(Guid meetingId, Guid profileId);
    Task NotifyParticipantRemovedAsync(Guid meetingId, Guid participantId, Guid profileId);
}
