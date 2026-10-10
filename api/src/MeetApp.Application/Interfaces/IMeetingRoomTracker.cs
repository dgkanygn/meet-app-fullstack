namespace MeetApp.Application.Interfaces;

public interface IMeetingRoomTracker
{
    void TrackUserJoined(Guid meetingId, Guid userId, string connectionId);
    void TrackUserLeft(Guid meetingId, string connectionId);
    bool IsUserConnected(Guid meetingId, Guid userId);
    int GetConnectedUserCount(Guid meetingId);
    IReadOnlyCollection<Guid> GetConnectedUserIds(Guid meetingId);
    bool HasHadConnections(Guid meetingId);
    void SetEmptyRoomShutdownCallback(Func<Guid, Task> callback);
}
