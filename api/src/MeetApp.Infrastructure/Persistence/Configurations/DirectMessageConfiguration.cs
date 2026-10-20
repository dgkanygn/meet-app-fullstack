using MeetApp.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MeetApp.Infrastructure.Persistence.Configurations;

public class DirectMessageConfiguration : IEntityTypeConfiguration<DirectMessage>
{
    public void Configure(EntityTypeBuilder<DirectMessage> builder)
    {
        builder.HasKey(m => m.Id);

        builder.Property(m => m.Content)
            .IsRequired()
            .HasMaxLength(4000);

        builder.HasOne(m => m.Sender)
            .WithMany(p => p.SentMessages)
            .HasForeignKey(m => m.SenderId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(m => m.Receiver)
            .WithMany(p => p.ReceivedMessages)
            .HasForeignKey(m => m.ReceiverId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(m => new { m.SenderId, m.ReceiverId });
        builder.HasIndex(m => new { m.ReceiverId, m.SenderId });
        builder.HasIndex(m => m.CreatedAt);

        builder.ToTable("direct_messages");
    }
}
