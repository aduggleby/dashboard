using System.Diagnostics;
using Dashboard.Web.Models;
using Dashboard.Web.Services;
using Microsoft.AspNetCore.Mvc;

namespace Dashboard.Web.Controllers;

public class HomeController(CardService cardService) : Controller
{
    public async Task<IActionResult> Index(CancellationToken cancellationToken)
    {
        var cards = await cardService.GetOrderedCardsAsync(cancellationToken);
        return View(new DashboardIndexViewModel
        {
            Cards = cards
        });
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
