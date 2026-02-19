using Dashboard.Web.Models;
using Microsoft.EntityFrameworkCore;

namespace Dashboard.Web.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<DashboardCard> DashboardCards => Set<DashboardCard>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<DashboardCard>(entity =>
        {
            entity.ToTable("DashboardCards");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Title).HasMaxLength(120).IsRequired();
            entity.Property(x => x.Url).HasMaxLength(2048).IsRequired();
            entity.Property(x => x.SortOrder).IsRequired().HasDefaultValue(0);
            entity.Property(x => x.CreatedUtc).IsRequired();
            entity.Property(x => x.UpdatedUtc).IsRequired();
            entity.HasIndex(x => new { x.SortOrder, x.Title });
        });
    }
}
