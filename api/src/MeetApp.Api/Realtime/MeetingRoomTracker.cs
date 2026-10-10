using System.Collections.Concurrent;
using MeetApp.Application.Interfaces;

namespace MeetApp.Api.Realtime;

public class MeetingRoomTracker(ILogger<MeetingRoomTracker> logger) : IMeetingRoomTracker
{
    private class RoomState
    {
        public readonly object Lock = new();
        public readonly HashSet<string> ConnectionIds = [];
        public readonly Dictionary<string, Guid> ConnectionToUser = [];
        public bool HasHadConnections { get; set; }
        public CancellationTokenSource? ShutdownCts { get; set; }
    }

    private readonly ConcurrentDictionary<Guid, RoomState> _rooms = new();
    private Func<Guid, Task>? _shutdownCallback;

    public void SetEmptyRoomShutdownCallback(Func<Guid, Task> callback)
    {
        _shutdownCallback = callback;
    }

    public void TrackUserJoined(Guid meetingId, Guid userId, string connectionId)
    {
        var room = _rooms.GetOrAdd(meetingId, _ => new RoomState());
        lock (room.Lock)
        {
            if (room.ShutdownCts is not null)
            {
                room.ShutdownCts.Cancel();
                room.ShutdownCts.Dispose();
                room.ShutdownCts = null;
                logger.LogInformation("Cancelled empty room shutdown timer for meeting {MeetingId}", meetingId);
            }

            room.ConnectionIds.Add(connectionId);
            room.ConnectionToUser[connectionId] = userId;
            room.HasHadConnections = true;
            logger.LogInformation("User {UserId} joined room {MeetingId} via connection {ConnectionId}. Total connections: {Count}",
                userId, meetingId, connectionId, room.ConnectionIds.Count);
        }
    }

    public void TrackUserLeft(Guid meetingId, string connectionId)
    {
        if (!_rooms.TryGetValue(meetingId, out var room)) return;

        lock (room.Lock)
        {
            room.ConnectionIds.Remove(connectionId);
            room.ConnectionToUser.Remove(connectionId);

            logger.LogInformation("Connection {ConnectionId} left room {MeetingId}. Remaining connections: {Count}",
                connectionId, meetingId, room.ConnectionIds.Count);

            if (room.ConnectionIds.Count == 0 && room.HasHadConnections)
            {
                logger.LogInformation("Room {MeetingId} is now empty. Starting shutdown timer.", meetingId);
                room.ShutdownCts?.Cancel();
                room.ShutdownCts?.Dispose();
                var cts = new CancellationTokenSource();
                room.ShutdownCts = cts;

                _ = Task.Run(async () =>
                {
                    try
                    {
                        // 8 saniye bekleme suresi (F5 / kisa baglanti kopmasini tolere eder)
                        await Task.Delay(TimeSpan.FromSeconds(8), cts.Token);
                        if (!cts.Token.IsCancellationRequested)
                        {
                            bool shouldEnd = false;
                            lock (room.Lock)
                            {
                                if (room.ConnectionIds.Count == 0 && room.HasHadConnections)
                                {
                                    shouldEnd = true;
                                    _rooms.TryRemove(meetingId, out _);
                                }
                            }

                            if (shouldEnd && _shutdownCallback is not null)
                            {
                                logger.LogInformation("Empty room timer expired for {MeetingId}. Ending meeting.", meetingId);
                                await _shutdownCallback(meetingId);
                            }
                        }
                    }
                    catch (OperationCanceledException)
                    {
                        // Timer iptal edildi (birisi yeniden katildi)
                    }
                    catch (Exception ex)
                    {
                        logger.LogError(ex, "Error during empty room shutdown callback for {MeetingId}", meetingId);
                    }
                });
            }
        }
    }

    public bool IsUserConnected(Guid meetingId, Guid userId)
    {
        if (!_rooms.TryGetValue(meetingId, out var room)) return false;
        lock (room.Lock)
        {
            return room.ConnectionToUser.Values.Contains(userId);
        }
    }

    public int GetConnectedUserCount(Guid meetingId)
    {
        if (!_rooms.TryGetValue(meetingId, out var room)) return 0;
        lock (room.Lock)
        {
            return room.ConnectionToUser.Values.Distinct().Count();
        }
    }

    public IReadOnlyCollection<Guid> GetConnectedUserIds(Guid meetingId)
    {
        if (!_rooms.TryGetValue(meetingId, out var room)) return Array.Empty<Guid>();
        lock (room.Lock)
        {
            return room.ConnectionToUser.Values.Distinct().ToList();
        }
    }

    public bool HasHadConnections(Guid meetingId)
    {
        if (!_rooms.TryGetValue(meetingId, out var room)) return false;
        lock (room.Lock)
        {
            return room.HasHadConnections;
        }
    }
}
