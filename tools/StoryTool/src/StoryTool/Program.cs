using System.Text.Json;

namespace StoryTool;

public static class Program
{
    public static int Main(string[] args)
    {
        return Cli.Run(args, Console.Out, Console.Error);
    }
}

public static class Cli
{
    public static int Run(string[] args, TextWriter output, TextWriter error)
    {
        if (args.Length == 0 || args[0] is "-h" or "--help" or "help")
        {
            WriteUsage(output);
            return 0;
        }

        try
        {
            return args[0] switch
            {
                "validate" => Validate(args, output, error),
                "build" => Build(args, output, error),
                "graph" => Planned(args, output, "graph", 2),
                "check-unreachable" => Planned(args, output, "check-unreachable", 1),
                "check-entitlements" => Planned(args, output, "check-entitlements", 1),
                _ => UnknownCommand(args[0], error)
            };
        }
        catch (Exception ex)
        {
            error.WriteLine($"[StoryTool] error: {ex.Message}");
            return 1;
        }
    }

    public static ValidationResult ValidateContentDirectory(string contentDir)
    {
        var issues = new List<string>();
        if (!Directory.Exists(contentDir))
        {
            issues.Add($"{contentDir}: content directory does not exist");
            return new ValidationResult(false, issues);
        }

        foreach (var required in new[] { "chapters", "characters", "variables", "endings" })
        {
            if (!Directory.Exists(Path.Combine(contentDir, required)))
            {
                issues.Add($"{contentDir}: missing required directory '{required}'");
            }
        }

        return new ValidationResult(issues.Count == 0, issues);
    }

    private static int Validate(string[] args, TextWriter output, TextWriter error)
    {
        if (args.Length != 2)
        {
            error.WriteLine("[StoryTool] validate requires: StoryTool validate <content-dir>");
            return 2;
        }

        var contentDir = Path.GetFullPath(args[1]);
        var result = ValidateContentDirectory(contentDir);
        WriteIssues(result, error);

        if (!result.IsValid)
        {
            return 1;
        }

        output.WriteLine($"[StoryTool] valid: {contentDir}");
        return 0;
    }

    private static int Build(string[] args, TextWriter output, TextWriter error)
    {
        if (args.Length != 3)
        {
            error.WriteLine("[StoryTool] build requires: StoryTool build <content-dir> <output-dir>");
            return 2;
        }

        var contentDir = Path.GetFullPath(args[1]);
        var outputDir = Path.GetFullPath(args[2]);
        var result = ValidateContentDirectory(contentDir);
        WriteIssues(result, error);

        if (!result.IsValid)
        {
            return 1;
        }

        Directory.CreateDirectory(outputDir);
        var manifest = new StoryManifest(
            GeneratedAtUtc: DateTimeOffset.UtcNow,
            Files: Directory.EnumerateFiles(contentDir, "*.*", SearchOption.AllDirectories)
                .Where(IsStoryDataFile)
                .Select(path => Path.GetRelativePath(contentDir, path).Replace('\\', '/'))
                .Order()
                .ToArray());

        var json = JsonSerializer.Serialize(manifest, new JsonSerializerOptions { WriteIndented = true });
        File.WriteAllText(Path.Combine(outputDir, "manifest.json"), json);
        output.WriteLine($"[StoryTool] built: {outputDir}");
        return 0;
    }

    private static bool IsStoryDataFile(string path)
    {
        return path.EndsWith(".yml", StringComparison.OrdinalIgnoreCase)
            || path.EndsWith(".yaml", StringComparison.OrdinalIgnoreCase)
            || path.EndsWith(".json", StringComparison.OrdinalIgnoreCase);
    }

    private static void WriteIssues(ValidationResult result, TextWriter error)
    {
        foreach (var issue in result.Issues)
        {
            error.WriteLine($"[StoryTool] {issue}");
        }
    }

    private static int Planned(string[] args, TextWriter output, string command, int requiredExtraArgs)
    {
        if (args.Length != requiredExtraArgs + 1)
        {
            output.WriteLine($"[StoryTool] {command} arguments are invalid. Use StoryTool --help.");
            return 2;
        }

        output.WriteLine($"[StoryTool] {command}: planned for v0.2");
        return 0;
    }

    private static int UnknownCommand(string command, TextWriter error)
    {
        error.WriteLine($"[StoryTool] unknown command: {command}");
        error.WriteLine("Use StoryTool --help.");
        return 2;
    }

    private static void WriteUsage(TextWriter output)
    {
        output.WriteLine("StoryTool");
        output.WriteLine();
        output.WriteLine("Usage:");
        output.WriteLine("  StoryTool validate <content-dir>");
        output.WriteLine("  StoryTool build <content-dir> <output-dir>");
        output.WriteLine("  StoryTool graph <chapter-dir> <output-file>");
        output.WriteLine("  StoryTool check-unreachable <content-dir>");
        output.WriteLine("  StoryTool check-entitlements <content-dir>");
    }
}

public sealed record ValidationResult(bool IsValid, IReadOnlyList<string> Issues);

public sealed record StoryManifest(DateTimeOffset GeneratedAtUtc, IReadOnlyList<string> Files);
