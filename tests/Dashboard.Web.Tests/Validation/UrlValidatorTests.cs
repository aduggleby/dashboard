using Dashboard.Web.Validation;

namespace Dashboard.Web.Tests.Validation;

public class UrlValidatorTests
{
    [Theory]
    [InlineData("https://example.com")]
    [InlineData("http://192.168.1.10:32400")]
    public void AcceptsAbsoluteHttpAndHttps(string url)
    {
        Assert.True(UrlValidator.IsAllowedDashboardUrl(url));
    }

    [Theory]
    [InlineData("ftp://example.com")]
    [InlineData("javascript:alert('xss')")]
    [InlineData("/relative")]
    [InlineData("")]
    public void RejectsInvalidSchemesOrFormats(string url)
    {
        Assert.False(UrlValidator.IsAllowedDashboardUrl(url));
    }
}
