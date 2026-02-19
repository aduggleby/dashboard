using Dashboard.Web.Data;
using Dashboard.Web.Models;
using Dashboard.Web.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace Dashboard.Web.Tests.Services;

public class CardServiceTests
{
    [Fact]
    public async Task GetOrderedCardsAsync_OrdersBySortOrderThenTitle()
    {
        await using var connection = new SqliteConnection("Data Source=:memory:");
        await connection.OpenAsync();

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(connection)
            .Options;

        await using (var seedDb = new AppDbContext(options))
        {
            await seedDb.Database.EnsureCreatedAsync();
            seedDb.DashboardCards.AddRange(
                new DashboardCard { Title = "Zulu", Url = "https://zulu.local", SortOrder = 1, CreatedUtc = DateTime.UtcNow, UpdatedUtc = DateTime.UtcNow },
                new DashboardCard { Title = "Alpha", Url = "https://alpha.local", SortOrder = 0, CreatedUtc = DateTime.UtcNow, UpdatedUtc = DateTime.UtcNow },
                new DashboardCard { Title = "Bravo", Url = "https://bravo.local", SortOrder = 1, CreatedUtc = DateTime.UtcNow, UpdatedUtc = DateTime.UtcNow });
            await seedDb.SaveChangesAsync();
        }

        await using var db = new AppDbContext(options);
        var service = new CardService(db);

        var cards = await service.GetOrderedCardsAsync();

        Assert.Collection(cards,
            first => Assert.Equal("Alpha", first.Title),
            second => Assert.Equal("Bravo", second.Title),
            third => Assert.Equal("Zulu", third.Title));
    }

    [Fact]
    public async Task CreateCardAsync_RejectsNonHttpScheme()
    {
        await using var connection = new SqliteConnection("Data Source=:memory:");
        await connection.OpenAsync();

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(connection)
            .Options;

        await using var db = new AppDbContext(options);
        await db.Database.EnsureCreatedAsync();
        var service = new CardService(db);

        var result = await service.CreateCardAsync(new CardFormModel
        {
            Title = "Bad",
            Url = "javascript:alert(1)"
        });

        Assert.False(result.Success);
        Assert.Equal(0, await db.DashboardCards.CountAsync());
    }
}
