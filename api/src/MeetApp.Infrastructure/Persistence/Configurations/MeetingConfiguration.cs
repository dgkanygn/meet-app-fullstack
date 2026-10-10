using MeetApp.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MeetApp.Infrastructure.Persistence.Configurations;

public class MeetingConfiguration : IEntityTypeConfiguration<Meeting>
{
    public void Configure(EntityTypeBuilder<Meeting> builder)
    {
        builder.HasKey(m => m.Id);
        builder.Property(m => m.Title).HasMaxLength(200).IsRequired();
        builder.Property(m => m.Description).HasMaxLength(1000);
        builder.Property(m => m.Password).HasMaxLength(100);
        builder.Property(m => m.EndedAt);

        builder.HasOne(m => m.Host)
            .WithMany(p => p.HostedMeetings)
            .HasForeignKey(m => m.HostId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.ToTable("meetings");
    }
}
