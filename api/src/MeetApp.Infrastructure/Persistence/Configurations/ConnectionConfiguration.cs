using MeetApp.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MeetApp.Infrastructure.Persistence.Configurations;

public class ConnectionConfiguration : IEntityTypeConfiguration<Connection>
{
    public void Configure(EntityTypeBuilder<Connection> builder)
    {
        builder.HasKey(c => c.Id);

        builder.HasOne(c => c.Requester)
            .WithMany(p => p.SentConnections)
            .HasForeignKey(c => c.RequesterId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.Addressee)
            .WithMany(p => p.ReceivedConnections)
            .HasForeignKey(c => c.AddresseeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(c => new { c.RequesterId, c.AddresseeId }).IsUnique();
        builder.ToTable("connections");
    }
}
