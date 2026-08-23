using MeetApp.Application.Dtos.Connection;
using MeetApp.Application.Dtos.Notification;
using MeetApp.Application.Interfaces;
using MeetApp.Domain.Entities;
using MeetApp.Domain.Enums;
using MeetApp.Domain.Exceptions;
using MeetApp.Domain.Interfaces;

namespace MeetApp.Application.Services;

public class ConnectionService(
    IConnectionRepository connectionRepository,
    IProfileRepository profileRepository,
    INotificationRepository notificationRepository,
    INotificationPublisher notificationPublisher) : IConnectionService
{
    public async Task<IEnumerable<ConnectionResponse>> GetConnectionsAsync(Guid profileId, ConnectionStatus? status = null, CancellationToken ct = default)
    {
        var connections = await connectionRepository.GetByProfileIdAsync(profileId, status, ct);
        return connections.Select(ToResponse);
    }

    public async Task<ConnectionResponse> CreateConnectionAsync(Guid requesterId, CreateConnectionRequest request, CancellationToken ct = default)
    {
        if (requesterId == request.AddresseeId)
            throw new BusinessException("Cannot connect to yourself.");

        var addressee = await profileRepository.GetByIdAsync(request.AddresseeId, ct)
            ?? throw new NotFoundException("Profile", request.AddresseeId);

        var existing = await connectionRepository.GetBetweenProfilesAsync(requesterId, request.AddresseeId, ct);
        if (existing is not null) throw new BusinessException("Connection request already exists.");

        var connection = new Connection
        {
            Id = Guid.NewGuid(),
            RequesterId = requesterId,
            AddresseeId = request.AddresseeId,
            Status = ConnectionStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        await connectionRepository.AddAsync(connection, ct);
        await connectionRepository.SaveChangesAsync(ct);

        // Notify addressee
        var requester = await profileRepository.GetByIdAsync(requesterId, ct)
            ?? throw new NotFoundException("Profile", requesterId);

        // Yanitta isim/kullanici adi dolu donsun diye navigation'lari elle bagliyoruz.
        connection.Requester = requester;
        connection.Addressee = addressee;
        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            RecipientId = request.AddresseeId,
            Type = NotificationType.ConnectionRequest,
            Message = $"{requester?.FullName} sent you a connection request.",
            ReferenceId = connection.Id,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };
        await notificationRepository.AddAsync(notification, ct);
        await notificationRepository.SaveChangesAsync(ct);

        var notifDto = new NotificationResponse(
            notification.Id, notification.RecipientId, notification.Type,
            notification.Message, notification.ReferenceId,
            notification.IsRead, notification.CreatedAt);
        await notificationPublisher.PublishAsync(request.AddresseeId, notifDto, ct);

        return ToResponse(connection);
    }

    public async Task<ConnectionResponse> UpdateConnectionAsync(Guid id, Guid requesterId, UpdateConnectionRequest request, CancellationToken ct = default)
    {
        var connection = await connectionRepository.GetByIdWithProfilesAsync(id, ct)
            ?? throw new NotFoundException("Connection", id);

        if (connection.AddresseeId != requesterId && connection.RequesterId != requesterId)
            throw new ForbiddenException("Cannot update this connection.");

        connection.Status = request.Status;
        connectionRepository.Update(connection);
        await connectionRepository.SaveChangesAsync(ct);

        // Notify requester if accepted
        if (request.Status == ConnectionStatus.Accepted)
        {
            var acceptor = await profileRepository.GetByIdAsync(requesterId, ct);
            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                RecipientId = connection.RequesterId,
                Type = NotificationType.ConnectionAccepted,
                Message = $"{acceptor?.FullName} accepted your connection request.",
                ReferenceId = connection.Id,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
            await notificationRepository.AddAsync(notification, ct);
            await notificationRepository.SaveChangesAsync(ct);

            var notifDto = new NotificationResponse(
                notification.Id, notification.RecipientId, notification.Type,
                notification.Message, notification.ReferenceId,
                notification.IsRead, notification.CreatedAt);
            await notificationPublisher.PublishAsync(connection.RequesterId, notifDto, ct);
        }

        return ToResponse(connection);
    }

    public async Task DeleteConnectionAsync(Guid id, Guid profileId, CancellationToken ct = default)
    {
        var connection = await connectionRepository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Connection", id);

        if (connection.RequesterId != profileId && connection.AddresseeId != profileId)
            throw new ForbiddenException("Cannot delete this connection.");

        connectionRepository.Remove(connection);
        await connectionRepository.SaveChangesAsync(ct);
    }

    private static ConnectionResponse ToResponse(Connection c) =>
        new(c.Id,
            c.RequesterId, c.Requester?.FullName ?? string.Empty, c.Requester?.Username ?? string.Empty, c.Requester?.AvatarUrl,
            c.AddresseeId, c.Addressee?.FullName ?? string.Empty, c.Addressee?.Username ?? string.Empty, c.Addressee?.AvatarUrl,
            c.Status, c.CreatedAt);
}
