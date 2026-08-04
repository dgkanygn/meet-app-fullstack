using MeetApp.Domain.Enums;

namespace MeetApp.Application.Dtos.Connection;

public record CreateConnectionRequest(Guid AddresseeId);

public record UpdateConnectionRequest(ConnectionStatus Status);

public record ConnectionResponse(
    Guid Id,
    Guid RequesterId,
    string RequesterFullName,
    string RequesterUsername,
    string? RequesterAvatarUrl,
    Guid AddresseeId,
    string AddresseeFullName,
    string AddresseeUsername,
    string? AddresseeAvatarUrl,
    ConnectionStatus Status,
    DateTime CreatedAt
);
