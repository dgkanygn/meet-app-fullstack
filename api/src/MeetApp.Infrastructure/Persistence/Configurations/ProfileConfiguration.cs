using MeetApp.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MeetApp.Infrastructure.Persistence.Configurations;

public class ProfileConfiguration : IEntityTypeConfiguration<Profile>
{
    public void Configure(EntityTypeBuilder<Profile> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Username).HasMaxLength(50).IsRequired();
        builder.Property(p => p.Email).HasMaxLength(255).IsRequired();
        builder.Property(p => p.FullName).HasMaxLength(100).IsRequired();
        builder.Property(p => p.Bio).HasMaxLength(500);
        builder.Property(p => p.AvatarUrl).HasMaxLength(500);
        builder.Property(p => p.PasswordHash).IsRequired();
        builder.Property(p => p.RefreshToken).HasMaxLength(500);
        builder.HasIndex(p => p.Email).IsUnique();
        builder.HasIndex(p => p.Username).IsUnique();
        builder.ToTable("profiles");
    }
}
