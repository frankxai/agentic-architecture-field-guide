$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$required = @(
  "README.md",
  "docs/runtime-decision-matrix.md",
  "docs/local-install-audit.md",
  "docs/security-boundaries.md",
  "docs/sources.md",
  "scripts/agent-os-audit.ps1"
)

foreach ($file in $required) {
  $path = Join-Path $root $file
  if (-not (Test-Path $path)) {
    throw "Missing required file: $file"
  }
}

$markdown = Get-ChildItem -Path $root -Recurse -Filter *.md
foreach ($file in $markdown) {
  $content = Get-Content -Raw -Path $file.FullName
  $matches = [regex]::Matches($content, '\[[^\]]+\]\((?!https?://|#)([^)]+)\)')
  foreach ($match in $matches) {
    $target = $match.Groups[1].Value.Split("#")[0]
    if (-not $target) { continue }
    $resolved = Join-Path $file.DirectoryName $target
    if (-not (Test-Path $resolved)) {
      throw "Broken local link in $($file.Name): $target"
    }
  }
}

Write-Host "Docs validation passed."
