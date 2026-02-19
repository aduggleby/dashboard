using Dashboard.Web.Data;
using Dashboard.Web.Models;
using Dashboard.Web.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace Dashboard.Web.Tests.Services;

public class CardReorderServiceTests
{
    [Fact]
    public async Task ReorderAsync_RejectsMissingIdsAndKeepsOrder()
    {
        await using var connection = new SqliteConnection("Data Source=:memory:");
        await connection.OpenAsync();

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(connection)
            .Options;

        await using var db = new AppDbContext(options);
        await db.Database.EnsureCreatedAsync();

        db.DashboardCards.AddRange(
            new DashboardCard { Title = "A", Url = "https://a.local", SortOrder = 0, CreatedUtc = DateTime.UtcNow, UpdatedUtc = DateTime.UtcNow },
            new DashboardCard { Title = "B", Url = "https://b.local", SortOrder = 1, CreatedUtc = DateTime.UtcNow, UpdatedUtc = DateTime.UtcNow },
            new DashboardCard { Title = "C", Url = "https://c.local", SortOrder = 2, CreatedUtc = DateTime.UtcNow, UpdatedUtc = DateTime.UtcNow });
        await db.SaveChangesAsync();

        var ids = await db.DashboardCards.OrderBy(x => x.SortOrder).Select(x => x.Id).ToListAsync();
        var service = new CardService(db);

        var success = await service.ReorderAsync(ids.Take(2).ToList());

        Assert.False(success);

        var persisted = await db.DashboardCards.OrderBy(x => x.SortOrder).Select(x => x.Title).ToListAsync();
        Assert.Equal(["A", "B", "C"], persisted);
    }

    [Fact]
    public async Task ReorderAsync_RewritesSortOrderDeterministically()
    {
        await using var connection = new SqliteConnection("Data Source=:memory:");
        await connection.OpenAsync();

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(connection)
            .Options;

        await using var db = new AppDbContext(options);
        await db.Database.EnsureCreatedAsync();

        db.DashboardCards.AddRange(
            new DashboardCard { Title = "A", Url = "https://a.local", SortOrder = 0, CreatedUtc = DateTime.UtcNow, UpdatedUtc = DateTime.UtcNow },
            new DashboardCard { Title = "B", Url = "https://b.local", SortOrder = 1, CreatedUtc = DateTime.UtcNow, UpdatedUtc = DateTime.UtcNow },
            new DashboardCard { Title = "C", Url = "https://c.local", SortOrder = 2, CreatedUtc = DateTime.UtcNow, UpdatedUtc = DateTime.UtcNow });
        await db.SaveChangesAsync();

        var ids = await db.DashboardCards.OrderBy(x => x.SortOrder).Select(x => x.Id).ToListAsync();
        var service = new CardService(db);

        var success = await service.ReorderAsync([ids[2], ids[0], ids[1]]);

        Assert.True(success);

        var persisted = await db.DashboardCards.OrderBy(x => x.SortOrder).Select(x => x.Title).ToListAsync();
        Assert.Equal(["C", "A", "B"], persisted);
    }
}
