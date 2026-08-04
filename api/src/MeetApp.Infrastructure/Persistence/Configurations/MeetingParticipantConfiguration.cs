using MeetApp.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MeetApp.Infrastructure.Persistence.Configurations;

public class MeetingParticipantConfiguration : IEntityTypeConfiguration<MeetingParticipant>
{
    public void Configure(EntityTypeBuilder<MeetingParticipant> builder)
    {
        builder.HasKey(mp => mp.Id);

        builder.HasOne(mp => mp.Meeting)
            .WithMany(m => m.Participants)
            .HasForeignKey(mp => mp.MeetingId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(mp => mp.Profile)
            .WithMany(p => p.MeetingParticipants)
            .HasForeignKey(mp => mp.ProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(mp => new { mp.MeetingId, mp.ProfileId }).IsUnique();
        builder.ToTable("meeting_participants");
    }
}
