using Dashboard.Web.Data;
using Dashboard.Web.Models;
using Dashboard.Web.Validation;
using Microsoft.EntityFrameworkCore;

namespace Dashboard.Web.Services;

public class CardService(AppDbContext db)
{
    public async Task<IReadOnlyList<DashboardCard>> GetOrderedCardsAsync(CancellationToken cancellationToken = default)
    {
        return await db.DashboardCards
            .AsNoTracking()
            .OrderBy(card => card.SortOrder)
            .ThenBy(card => card.Title)
            .ToListAsync(cancellationToken);
    }

    public async Task<(bool Success, string? Error)> CreateCardAsync(CardFormModel form, CancellationToken cancellationToken = default)
    {
        var normalizedTitle = form.Title?.Trim() ?? string.Empty;
        var normalizedUrl = form.Url?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(normalizedTitle))
        {
            return (false, "Title is required.");
        }

        if (!UrlValidator.IsAllowedDashboardUrl(normalizedUrl))
        {
            return (false, "URL must be an absolute http:// or https:// address.");
        }

        var nextSort = (await db.DashboardCards.MaxAsync(card => (int?)card.SortOrder, cancellationToken) ?? -1) + 1;
        var now = DateTime.UtcNow;
        db.DashboardCards.Add(new DashboardCard
        {
            Title = normalizedTitle,
            Url = normalizedUrl,
            SortOrder = nextSort,
            CreatedUtc = now,
            UpdatedUtc = now
        });

        await db.SaveChangesAsync(cancellationToken);
        return (true, null);
    }

    public async Task<bool> DeleteCardAsync(int id, CancellationToken cancellationToken = default)
    {
        var card = await db.DashboardCards.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (card is null)
        {
            return false;
        }

        db.DashboardCards.Remove(card);
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<(bool Success, string? Error)> UpdateCardAsync(EditCardFormModel form, CancellationToken cancellationToken = default)
    {
        var card = await db.DashboardCards.FirstOrDefaultAsync(x => x.Id == form.Id, cancellationToken);
        if (card is null)
        {
            return (false, "Card not found.");
        }

        var normalizedTitle = form.Title?.Trim() ?? string.Empty;
        var normalizedUrl = form.Url?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(normalizedTitle))
        {
            return (false, "Title is required.");
        }

        if (!UrlValidator.IsAllowedDashboardUrl(normalizedUrl))
        {
            return (false, "URL must be an absolute http:// or https:// address.");
        }

        card.Title = normalizedTitle;
        card.Url = normalizedUrl;
        card.UpdatedUtc = DateTime.UtcNow;

        await db.SaveChangesAsync(cancellationToken);
        return (true, null);
    }

    public async Task<bool> ReorderAsync(IReadOnlyList<int> cardIds, CancellationToken cancellationToken = default)
    {
        if (cardIds.Count == 0)
        {
            return false;
        }

        if (cardIds.Count != cardIds.Distinct().Count())
        {
            return false;
        }

        var cards = await db.DashboardCards.OrderBy(card => card.Id).ToListAsync(cancellationToken);
        if (cards.Count != cardIds.Count)
        {
            return false;
        }

        if (!cards.Select(c => c.Id).Order().SequenceEqual(cardIds.Order()))
        {
            return false;
        }

        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        var now = DateTime.UtcNow;

        for (var index = 0; index < cardIds.Count; index++)
        {
            var card = cards.First(c => c.Id == cardIds[index]);
            card.SortOrder = index;
            card.UpdatedUtc = now;
        }

        await db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return true;
    }
}
