namespace StoryTool.Tests;

public class CliTests
{
    [Fact]
    public void ValidateContentDirectoryAcceptsExpectedLayout()
    {
        var root = CreateTempContentRoot(includeRequiredFolders: true);

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
        var root = CreateTempContentRoot(includeRequiredFolders: false);

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

    private static string CreateTempContentRoot(bool includeRequiredFolders)
    {
        var root = Path.Combine(Path.GetTempPath(), $"storytool-{Guid.NewGuid():N}");
        Directory.CreateDirectory(root);

        if (includeRequiredFolders)
        {
            Directory.CreateDirectory(Path.Combine(root, "chapters"));
            Directory.CreateDirectory(Path.Combine(root, "characters"));
            Directory.CreateDirectory(Path.Combine(root, "variables"));
            Directory.CreateDirectory(Path.Combine(root, "endings"));
            Directory.CreateDirectory(Path.Combine(root, "chapters", "ch00"));

            File.WriteAllText(Path.Combine(root, "variables", "schema.yml"), """
                variables:
                  - id: attributes.A.sanity
                    type: int
                    default: 50
                    canon_allowed: false
                  - id: world.flags.ch00_finished
                    type: bool
                    default: false
                    canon_allowed: true
                """);

            File.WriteAllText(Path.Combine(root, "chapters", "ch00", "chapter.yml"), """
                id: ch00
                title: Test Chapter
                pov: A
                entry_node: ch00_a_001
                """);

            File.WriteAllText(Path.Combine(root, "chapters", "ch00", "nodes_a.yml"), """
                nodes:
                  - id: ch00_a_001
                    chapter: ch00
                    pov: A
                    node_kind: ending
                    title: End
                    ending:
                      id: ch00_a_canon
                """);

            File.WriteAllText(Path.Combine(root, "chapters", "ch00", "endings.yml"), """
                endings:
                  - id: ch00_a_canon
                    chapter: ch00
                    pov: A
                    ending_type: canon
                    category: mainline
                    title: Canon
                    canon_state:
                      world.flags.ch00_finished: true
                """);
        }

        return root;
    }
}
