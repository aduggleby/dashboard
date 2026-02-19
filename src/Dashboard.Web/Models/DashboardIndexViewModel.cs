namespace Dashboard.Web.Models;

public class DashboardIndexViewModel
{
    public required IReadOnlyList<DashboardCard> Cards { get; init; }
    public CardFormModel Form { get; init; } = new();
}
