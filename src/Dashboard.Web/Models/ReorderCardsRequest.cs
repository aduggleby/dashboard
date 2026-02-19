using System.ComponentModel.DataAnnotations;

namespace Dashboard.Web.Models;

public class ReorderCardsRequest
{
    [MinLength(1)]
    public List<int> CardIds { get; set; } = [];
}
