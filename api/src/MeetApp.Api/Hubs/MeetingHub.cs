using System.Security.Claims;
using MeetApp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace MeetApp.Api.Hubs;

[Authorize]
public class MeetingHub(IMeetingService meetingService) : Hub
{
    public override async Task OnConnectedAsync()
    {
        var meetingId = Context.GetHttpContext()?.Request.Query["meetingId"].ToString();
        var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(meetingId) || string.IsNullOrEmpty(userId))
        {
            Context.Abort();
            return;
        }

        // Kullanıcının bu toplantıya erişimi var mı kontrol et
        var isParticipant = await meetingService.IsParticipantAsync(
            Guid.Parse(meetingId), Guid.Parse(userId));

        if (!isParticipant)
        {
            Context.Abort();
            return;
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, $"meeting-{meetingId}");

        // Diğer katılımcılara haber ver
        await Clients.OthersInGroup($"meeting-{meetingId}").SendAsync("UserJoined", new
        {
            userId,
            connectionId = Context.ConnectionId
        });

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var meetingId = Context.GetHttpContext()?.Request.Query["meetingId"].ToString();
        var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!string.IsNullOrEmpty(meetingId))
        {
            await Clients.OthersInGroup($"meeting-{meetingId}").SendAsync("UserLeft", new
            {
                userId,
                connectionId = Context.ConnectionId
            });
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"meeting-{meetingId}");
        }

        await base.OnDisconnectedAsync(exception);
    }

    // WebRTC signaling methods
    //
    // Her mesajda gonderenin profil id'si de tasinir: teklifi cevaplayan taraf
    // yalnizca connectionId gorurse karsisindaki katilimciyi isimlendiremez.
    private string? CurrentUserId => Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);

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
}
