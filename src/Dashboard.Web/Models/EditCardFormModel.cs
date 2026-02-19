using System.ComponentModel.DataAnnotations;

namespace Dashboard.Web.Models;

public class EditCardFormModel
{
    [Required]
    public int Id { get; set; }

    [Required]
    [StringLength(120)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [StringLength(2048)]
    public string Url { get; set; } = string.Empty;
}
