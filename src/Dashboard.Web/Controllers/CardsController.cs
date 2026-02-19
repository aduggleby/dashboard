using Dashboard.Web.Models;
using Dashboard.Web.Services;
using Microsoft.AspNetCore.Mvc;

namespace Dashboard.Web.Controllers;

[Route("cards")]
public class CardsController(CardService cardService) : Controller
{
    [HttpPost("create")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(CardFormModel form, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            TempData["StatusError"] = "Please check the form and try again.";
            return RedirectToAction("Index", "Home");
        }

        var result = await cardService.CreateCardAsync(form, cancellationToken);
        TempData[result.Success ? "StatusSuccess" : "StatusError"] = result.Success
            ? "Card created."
            : result.Error ?? "Card could not be created.";

        return RedirectToAction("Index", "Home");
    }

    [HttpPost("update")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Update(EditCardFormModel form, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            TempData["StatusError"] = "Please check the form and try again.";
            return RedirectToAction("Index", "Home");
        }

        var result = await cardService.UpdateCardAsync(form, cancellationToken);
        TempData[result.Success ? "StatusSuccess" : "StatusError"] = result.Success
            ? "Card updated."
            : result.Error ?? "Card could not be updated.";

        return RedirectToAction("Index", "Home");
    }

    [HttpPost("delete/{id:int}")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var deleted = await cardService.DeleteCardAsync(id, cancellationToken);
        TempData[deleted ? "StatusSuccess" : "StatusError"] = deleted
            ? "Card deleted."
            : "Card was already removed.";

        return RedirectToAction("Index", "Home");
    }

    [HttpPost("delete")]
    [ValidateAntiForgeryToken]
    public Task<IActionResult> DeleteForm([FromForm] int id, CancellationToken cancellationToken)
    {
        return Delete(id, cancellationToken);
    }

    [HttpPost("reorder")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Reorder([FromBody] ReorderCardsRequest request, CancellationToken cancellationToken)
    {
        var success = await cardService.ReorderAsync(request.CardIds, cancellationToken);
        if (!success)
        {
            Response.StatusCode = StatusCodes.Status400BadRequest;
            return Json(new { success = false, error = "Invalid reorder payload." });
        }

        return Json(new { success = true });
    }
}
