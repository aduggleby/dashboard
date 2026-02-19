using Dashboard.Web.Data;
using Dashboard.Web.Models;
using Dashboard.Web.Services;
using Microsoft.EntityFrameworkCore;

namespace Dashboard.Web.IntegrationTests;

public class CardsFlowTests
{
    [Fact]
    public async Task CreateAndDelete_PersistToSqlite()
    {
        var dbPath = Path.Combine(Path.GetTempPath(), $"dashboard-int-{Guid.NewGuid()}.db");

        try
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseSqlite($"Data Source={dbPath}")
                .Options;

            await using (var db = new AppDbContext(options))
            {
                await db.Database.MigrateAsync();
                var service = new CardService(db);
                var created = await service.CreateCardAsync(new CardFormModel { Title = "Plex", Url = "https://plex.local" });
                Assert.True(created.Success);
            }

            int cardId;
            await using (var db = new AppDbContext(options))
            {
                var cards = await db.DashboardCards.ToListAsync();
                Assert.Single(cards);
                cardId = cards[0].Id;
            }

            await using (var db = new AppDbContext(options))
            {
                var service = new CardService(db);
                var deleted = await service.DeleteCardAsync(cardId);
                Assert.True(deleted);
            }

            await using (var db = new AppDbContext(options))
            {
                Assert.Empty(await db.DashboardCards.ToListAsync());
            }
        }
        finally
        {
            if (File.Exists(dbPath))
            {
                File.Delete(dbPath);
            }
        }
    }

    [Fact]
    public async Task Reorder_PersistsAcrossDbContextRestart()
    {
        var dbPath = Path.Combine(Path.GetTempPath(), $"dashboard-int-{Guid.NewGuid()}.db");

        try
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseSqlite($"Data Source={dbPath}")
                .Options;

            await using (var db = new AppDbContext(options))
            {
                await db.Database.MigrateAsync();
                var now = DateTime.UtcNow;
                db.DashboardCards.AddRange(
                    new DashboardCard { Title = "A", Url = "https://a.local", SortOrder = 0, CreatedUtc = now, UpdatedUtc = now },
                    new DashboardCard { Title = "B", Url = "https://b.local", SortOrder = 1, CreatedUtc = now, UpdatedUtc = now },
                    new DashboardCard { Title = "C", Url = "https://c.local", SortOrder = 2, CreatedUtc = now, UpdatedUtc = now });
                await db.SaveChangesAsync();
            }

            List<int> ids;
            await using (var db = new AppDbContext(options))
            {
                ids = await db.DashboardCards.OrderBy(x => x.SortOrder).Select(x => x.Id).ToListAsync();
                var service = new CardService(db);
                var reordered = await service.ReorderAsync([ids[1], ids[2], ids[0]]);
                Assert.True(reordered);
            }

            await using (var db = new AppDbContext(options))
            {
                var orderedTitles = await db.DashboardCards.OrderBy(x => x.SortOrder).Select(x => x.Title).ToListAsync();
                Assert.Equal(["B", "C", "A"], orderedTitles);
            }
        }
        finally
        {
            if (File.Exists(dbPath))
            {
                File.Delete(dbPath);
            }
        }
    }
}
