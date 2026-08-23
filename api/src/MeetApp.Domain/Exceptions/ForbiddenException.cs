namespace MeetApp.Domain.Exceptions;

/// <summary>
/// Kullanici kimligi dogrulanmis ama istenen kaynak uzerinde yetkisi yok.
/// HTTP 403 doner; 401 ile karistirilmamali (401 istemcide token yenilemeyi tetikler).
/// </summary>
public class ForbiddenException : Exception
{
    public ForbiddenException(string message = "Forbidden.") : base(message) { }
}
