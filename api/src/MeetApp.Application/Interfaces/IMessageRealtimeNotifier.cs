using MeetApp.Application.Dtos.Message;

namespace MeetApp.Application.Interfaces;

public interface IMessageRealtimeNotifier
{
    Task SendMessageAsync(Guid recipientId, DirectMessageResponse message, CancellationToken ct = default);
    Task NotifyMessagesReadAsync(Guid senderId, Guid readerId, CancellationToken ct = default);
}
