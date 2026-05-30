using System.Text.Json;
using System.Text.Json.Serialization;
using YamlDotNet.Serialization;
using YamlDotNet.Serialization.NamingConventions;

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
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        WriteIndented = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

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

        if (issues.Count > 0)
        {
            return new ValidationResult(false, issues);
        }

        var model = LoadContent(contentDir, issues);
        if (issues.Count == 0)
        {
            ValidateModel(model, issues);
        }

        return new ValidationResult(issues.Count == 0, issues);
    }

    public static StoryContent LoadContent(string contentDir, List<string> issues)
    {
        var deserializer = new DeserializerBuilder()
            .WithNamingConvention(UnderscoredNamingConvention.Instance)
            .IgnoreUnmatchedProperties()
            .Build();

        var schemaPath = Path.Combine(contentDir, "variables", "schema.yml");
        var schema = LoadYaml<VariableSchemaFile>(deserializer, schemaPath, issues) ?? new VariableSchemaFile();
        var chapters = new List<ChapterBundle>();

        foreach (var chapterDir in Directory.EnumerateDirectories(Path.Combine(contentDir, "chapters")).Order())
        {
            if (Path.GetFileName(chapterDir).StartsWith(".", StringComparison.Ordinal))
            {
                continue;
            }

            var chapter = LoadYaml<ChapterFile>(deserializer, Path.Combine(chapterDir, "chapter.yml"), issues);
            var nodes = LoadYaml<NodeFile>(deserializer, Path.Combine(chapterDir, "nodes_a.yml"), issues);
            var endings = LoadYaml<EndingFile>(deserializer, Path.Combine(chapterDir, "endings.yml"), issues);

            if (chapter is not null)
            {
                chapters.Add(new ChapterBundle(
                    DirectoryName: Path.GetFileName(chapterDir),
                    Chapter: chapter,
                    Nodes: nodes?.Nodes ?? [],
                    Endings: endings?.Endings ?? []));
            }
        }

        return new StoryContent(schema.Variables ?? [], chapters);
    }

    private static T? LoadYaml<T>(IDeserializer deserializer, string path, List<string> issues)
        where T : class, new()
    {
        if (!File.Exists(path))
        {
            issues.Add($"{path}: missing required file");
            return null;
        }

        try
        {
            return deserializer.Deserialize<T>(File.ReadAllText(path)) ?? new T();
        }
        catch (Exception ex)
        {
            issues.Add($"{path}: failed to parse YAML: {ex.Message}");
            return null;
        }
    }

    private static void ValidateModel(StoryContent model, List<string> issues)
    {
        var variableIds = model.Variables.Select(v => v.Id).Where(id => !string.IsNullOrWhiteSpace(id)).ToHashSet();
        if (variableIds.Count != model.Variables.Count)
        {
            issues.Add("content/variables/schema.yml: variable ids must be unique and non-empty");
        }

        foreach (var chapter in model.Chapters)
        {
            ValidateChapter(chapter, variableIds, issues);
        }
    }

    private static void ValidateChapter(ChapterBundle chapter, HashSet<string> variableIds, List<string> issues)
    {
        if (string.IsNullOrWhiteSpace(chapter.Chapter.Id))
        {
            issues.Add($"{chapter.DirectoryName}/chapter.yml: id is required");
            return;
        }

        if (string.IsNullOrWhiteSpace(chapter.Chapter.EntryNode))
        {
            issues.Add($"{chapter.Chapter.Id}: entry_node is required");
        }

        var nodeIds = chapter.Nodes.Select(n => n.Id).Where(id => !string.IsNullOrWhiteSpace(id)).ToList();
        foreach (var duplicate in nodeIds.GroupBy(id => id).Where(g => g.Count() > 1).Select(g => g.Key))
        {
            issues.Add($"{chapter.Chapter.Id}: duplicate node id {duplicate}");
        }

        var nodeIdSet = nodeIds.ToHashSet();
        if (!nodeIdSet.Contains(chapter.Chapter.EntryNode))
        {
            issues.Add($"{chapter.Chapter.Id}: entry_node {chapter.Chapter.EntryNode} does not exist");
        }

        var endingIds = chapter.Endings.Select(e => e.Id).Where(id => !string.IsNullOrWhiteSpace(id)).ToHashSet();
        var canonCount = chapter.Endings.Count(e => e.EndingType == "canon");
        if (canonCount != 1)
        {
            issues.Add($"{chapter.Chapter.Id}: expected exactly one canon ending, found {canonCount}");
        }

        foreach (var ending in chapter.Endings)
        {
            if (ending.EndingType is not ("closed" or "canon"))
            {
                issues.Add($"{chapter.Chapter.Id}: ending {ending.Id} has invalid ending_type {ending.EndingType}");
            }

            if (ending.EndingType == "closed" && ending.CanonState is { Count: > 0 })
            {
                issues.Add($"{chapter.Chapter.Id}: closed ending {ending.Id} must not define canon_state");
            }

            if (ending.EndingType == "canon" && (ending.CanonState is null || ending.CanonState.Count == 0))
            {
                issues.Add($"{chapter.Chapter.Id}: canon ending {ending.Id} must define canon_state");
            }

            if (ending.CanonState is not null)
            {
                foreach (var key in ending.CanonState.Keys)
                {
                    ValidateVariableReference(key, variableIds, issues, $"{chapter.Chapter.Id}: ending {ending.Id} canon_state");
                }
            }

            ValidateEffects(ending.Effects, variableIds, issues, $"{chapter.Chapter.Id}: ending {ending.Id}");
        }

        foreach (var node in chapter.Nodes)
        {
            if (node.Chapter != chapter.Chapter.Id)
            {
                issues.Add($"{chapter.Chapter.Id}: node {node.Id} chapter mismatch");
            }

            ValidateNext(node.Next, nodeIdSet, issues, $"{chapter.Chapter.Id}: node {node.Id}");
            ValidateEndingRef(node.Ending?.Id, endingIds, issues, $"{chapter.Chapter.Id}: node {node.Id}");
            ValidateEffects(node.Effects, variableIds, issues, $"{chapter.Chapter.Id}: node {node.Id}");
            ValidateRoutes(node.Routes, nodeIdSet, variableIds, issues, $"{chapter.Chapter.Id}: node {node.Id}");

            foreach (var choice in node.Choices ?? [])
            {
                ValidateNext(choice.Next, nodeIdSet, issues, $"{chapter.Chapter.Id}: node {node.Id} choice {choice.Id}");
                ValidateEndingRef(choice.Ending?.Id, endingIds, issues, $"{chapter.Chapter.Id}: node {node.Id} choice {choice.Id}");
                ValidateConditions(choice.Requirements, variableIds, issues, $"{chapter.Chapter.Id}: node {node.Id} choice {choice.Id}");
                ValidateEffects(choice.Effects, variableIds, issues, $"{chapter.Chapter.Id}: node {node.Id} choice {choice.Id}");
            }
        }
    }

    private static void ValidateRoutes(List<Route>? routes, HashSet<string> nodeIds, HashSet<string> variableIds, List<string> issues, string context)
    {
        foreach (var route in routes ?? [])
        {
            ValidateConditions(route.Conditions, variableIds, issues, $"{context} route");
            ValidateNext(route.Next, nodeIds, issues, $"{context} route");
        }
    }

    private static void ValidateConditions(ConditionGroup? group, HashSet<string> variableIds, List<string> issues, string context)
    {
        foreach (var condition in group?.All ?? [])
        {
            ValidateVariableReference(condition.Var, variableIds, issues, context);
        }

        foreach (var condition in group?.Any ?? [])
        {
            ValidateVariableReference(condition.Var, variableIds, issues, context);
        }
    }

    private static void ValidateEffects(List<Effect>? effects, HashSet<string> variableIds, List<string> issues, string context)
    {
        foreach (var effect in effects ?? [])
        {
            if (effect.Type is "ending.unlock" or "chapter.unlock" or "causal.record")
            {
                continue;
            }

            ValidateVariableReference(effect.Target, variableIds, issues, context);
        }
    }

    private static void ValidateVariableReference(string? variableId, HashSet<string> variableIds, List<string> issues, string context)
    {
        if (string.IsNullOrWhiteSpace(variableId))
        {
            issues.Add($"{context}: variable reference is empty");
            return;
        }

        if (!variableIds.Contains(variableId))
        {
            issues.Add($"{context}: variable {variableId} is not defined in schema");
        }
    }

    private static void ValidateNext(string? next, HashSet<string> nodeIds, List<string> issues, string context)
    {
        if (!string.IsNullOrWhiteSpace(next) && !nodeIds.Contains(next))
        {
            issues.Add($"{context}: next target {next} does not exist");
        }
    }

    private static void ValidateEndingRef(string? endingId, HashSet<string> endingIds, List<string> issues, string context)
    {
        if (!string.IsNullOrWhiteSpace(endingId) && !endingIds.Contains(endingId))
        {
            issues.Add($"{context}: ending {endingId} does not exist");
        }
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
        var issues = new List<string>();
        var model = LoadContent(contentDir, issues);
        if (issues.Count == 0)
        {
            ValidateModel(model, issues);
        }

        if (issues.Count > 0)
        {
            WriteIssues(new ValidationResult(false, issues), error);
            return 1;
        }

        Directory.CreateDirectory(outputDir);
        foreach (var chapter in model.Chapters)
        {
            var outputPath = Path.Combine(outputDir, $"{chapter.Chapter.Id}.json");
            var runtimeChapter = new RuntimeChapter(chapter.Chapter, chapter.Nodes, chapter.Endings);
            File.WriteAllText(outputPath, JsonSerializer.Serialize(runtimeChapter, JsonOptions));
        }

        var manifest = new StoryManifest(model.Chapters.Select(c => $"{c.Chapter.Id}.json").Order().ToArray());
        File.WriteAllText(Path.Combine(outputDir, "manifest.json"), JsonSerializer.Serialize(manifest, JsonOptions));
        output.WriteLine($"[StoryTool] built: {outputDir}");
        return 0;
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

public sealed record StoryManifest(IReadOnlyList<string> Files);

public sealed record StoryContent(IReadOnlyList<VariableDefinition> Variables, IReadOnlyList<ChapterBundle> Chapters);

public sealed record ChapterBundle(string DirectoryName, ChapterFile Chapter, IReadOnlyList<StoryNode> Nodes, IReadOnlyList<EndingDefinition> Endings);

public sealed record RuntimeChapter(ChapterFile Chapter, IReadOnlyList<StoryNode> Nodes, IReadOnlyList<EndingDefinition> Endings);

public sealed class VariableSchemaFile
{
    public List<VariableDefinition>? Variables { get; set; }
}

public sealed class VariableDefinition
{
    public string Id { get; set; } = "";
    public string Type { get; set; } = "";
    public object? Default { get; set; }
    public List<string>? Values { get; set; }
    public int? Min { get; set; }
    public int? Max { get; set; }
    public bool CanonAllowed { get; set; }
}

public sealed class ChapterFile
{
    public string Id { get; set; } = "";
    public string Title { get; set; } = "";
    public string Pov { get; set; } = "";
    public string EntryNode { get; set; } = "";
    public string? Summary { get; set; }
    public Dictionary<string, object>? UnlockRules { get; set; }
}

public sealed class NodeFile
{
    public List<StoryNode>? Nodes { get; set; }
}

public sealed class StoryNode
{
    public string Id { get; set; } = "";
    public string Chapter { get; set; } = "";
    public string Pov { get; set; } = "";
    public string NodeKind { get; set; } = "";
    public string Title { get; set; } = "";
    public string? Body { get; set; }
    public List<Effect>? Effects { get; set; }
    public List<Choice>? Choices { get; set; }
    public List<Route>? Routes { get; set; }
    public string? Next { get; set; }
    public EndingReference? Ending { get; set; }
}

public sealed class Choice
{
    public string Id { get; set; } = "";
    public string Text { get; set; } = "";
    public ConditionGroup? Requirements { get; set; }
    public List<Effect>? Effects { get; set; }
    public string? Next { get; set; }
    public EndingReference? Ending { get; set; }
    public bool Hidden { get; set; }
}

public sealed class Route
{
    public ConditionGroup? Conditions { get; set; }
    public string? Next { get; set; }
}

public sealed class ConditionGroup
{
    public List<Condition>? All { get; set; }
    public List<Condition>? Any { get; set; }
}

public sealed class Condition
{
    public string Var { get; set; } = "";
    public string Op { get; set; } = "";
    public object? Value { get; set; }
}

public sealed class Effect
{
    public string Type { get; set; } = "";
    public string Target { get; set; } = "";
    public object? Value { get; set; }
    public string? Id { get; set; }
}

public sealed class EndingReference
{
    public string Id { get; set; } = "";
}

public sealed class EndingFile
{
    public List<EndingDefinition>? Endings { get; set; }
}

public sealed class EndingDefinition
{
    public string Id { get; set; } = "";
    public string Chapter { get; set; } = "";
    public string Pov { get; set; } = "";
    public string EndingType { get; set; } = "";
    public string Category { get; set; } = "";
    public string Title { get; set; } = "";
    public string? Summary { get; set; }
    public Dictionary<string, object>? CanonState { get; set; }
    public List<Effect>? Effects { get; set; }
}
