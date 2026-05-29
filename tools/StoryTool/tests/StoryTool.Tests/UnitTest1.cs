namespace StoryTool.Tests;

public class CliTests
{
    [Fact]
    public void ValidateContentDirectoryAcceptsExpectedLayout()
    {
        var root = Path.Combine(Path.GetTempPath(), $"storytool-{Guid.NewGuid():N}");
        Directory.CreateDirectory(Path.Combine(root, "chapters"));
        Directory.CreateDirectory(Path.Combine(root, "characters"));
        Directory.CreateDirectory(Path.Combine(root, "variables"));
        Directory.CreateDirectory(Path.Combine(root, "endings"));

        try
        {
            var result = Cli.ValidateContentDirectory(root);

            Assert.True(result.IsValid);
            Assert.Empty(result.Issues);
        }
        finally
        {
            Directory.Delete(root, recursive: true);
        }
    }

    [Fact]
    public void ValidateContentDirectoryReportsMissingRequiredFolders()
    {
        var root = Path.Combine(Path.GetTempPath(), $"storytool-{Guid.NewGuid():N}");
        Directory.CreateDirectory(root);

        try
        {
            var result = Cli.ValidateContentDirectory(root);

            Assert.False(result.IsValid);
            Assert.Contains(result.Issues, issue => issue.Contains("chapters"));
            Assert.Contains(result.Issues, issue => issue.Contains("characters"));
            Assert.Contains(result.Issues, issue => issue.Contains("variables"));
            Assert.Contains(result.Issues, issue => issue.Contains("endings"));
        }
        finally
        {
            Directory.Delete(root, recursive: true);
        }
    }
}
