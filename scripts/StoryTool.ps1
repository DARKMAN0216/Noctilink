param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]] $StoryToolArgs
)

$repoRoot = Split-Path -Parent $PSScriptRoot
$project = Join-Path $repoRoot "tools\StoryTool\src\StoryTool"

dotnet run --project $project -- @StoryToolArgs
exit $LASTEXITCODE
