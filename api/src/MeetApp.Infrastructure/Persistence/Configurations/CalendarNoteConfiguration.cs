using MeetApp.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MeetApp.Infrastructure.Persistence.Configurations;

public class CalendarNoteConfiguration : IEntityTypeConfiguration<CalendarNote>
{
    public void Configure(EntityTypeBuilder<CalendarNote> builder)
    {
        builder.HasKey(cn => cn.Id);
        builder.Property(cn => cn.Content).HasMaxLength(1000).IsRequired();

        builder.HasOne(cn => cn.Profile)
            .WithMany(p => p.CalendarNotes)
            .HasForeignKey(cn => cn.ProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.ToTable("calendar_notes");
    }
}
