param(
  [switch]$Json
)

$ErrorActionPreference = "SilentlyContinue"

function New-Result {
  param(
    [string]$Name,
    [string]$Status,
    [string]$Detail = "",
    [string]$Command = "",
    [string]$Source = ""
  )

  [pscustomobject]@{
    name = $Name
    status = $Status
    detail = $Detail
    command = $Command
    source = $Source
  }
}

function Test-CommandVersion {
  param(
    [string]$Name,
    [string]$Command,
    [string[]]$VersionArgs = @("--version"),
    [string]$Source = "",
    [int]$TimeoutSec = 8
  )

  $cmd = Get-Command $Command -ErrorAction SilentlyContinue
  if (-not $cmd) {
    return New-Result -Name $Name -Status "missing" -Detail "$Command not found" -Command $Command -Source $Source
  }

  $executable = $Command
  $executableArgs = $VersionArgs
  $job = Start-Job -ScriptBlock {
    & $using:executable @using:executableArgs 2>&1 | Select-Object -First 4
  }

  if (-not (Wait-Job $job -Timeout $TimeoutSec)) {
    Stop-Job $job | Out-Null
    Remove-Job $job | Out-Null
    return New-Result -Name $Name -Status "warn" -Detail "found at $($cmd.Source), but version command timed out" -Command "$Command $($VersionArgs -join ' ')" -Source $Source
  }

  $output = (Receive-Job $job) -join " "
  Remove-Job $job | Out-Null
  if (-not $output) { $output = "installed at $($cmd.Source)" }
  New-Result -Name $Name -Status "ok" -Detail $output.Trim() -Command "$Command $($VersionArgs -join ' ')" -Source $Source
}

function Test-CommandPresence {
  param(
    [string]$Name,
    [string]$Command,
    [string]$Source = ""
  )

  $cmd = Get-Command $Command -ErrorAction SilentlyContinue
  if (-not $cmd) {
    return New-Result -Name $Name -Status "missing" -Detail "$Command not found" -Command $Command -Source $Source
  }

  $location = if ($cmd.Source) { $cmd.Source } else { $cmd.Definition }
  New-Result -Name $Name -Status "ok" -Detail "found at $location" -Command $Command -Source $Source
}

function Test-Http {
  param(
    [string]$Name,
    [string]$Url,
    [string]$Source = ""
  )

  try {
    $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 3 -UseBasicParsing
    New-Result -Name $Name -Status "ok" -Detail "HTTP $($response.StatusCode)" -Command $Url -Source $Source
  } catch {
    New-Result -Name $Name -Status "missing" -Detail $_.Exception.Message -Command $Url -Source $Source
  }
}

function Test-PythonImport {
  param(
    [string]$Name,
    [string]$Module,
    [string]$Source = ""
  )

  $python = Get-Command python -ErrorAction SilentlyContinue
  if (-not $python) {
    return New-Result -Name $Name -Status "missing" -Detail "python not found" -Command "python" -Source $Source
  }

  $code = "import importlib.metadata as m; import $Module; print(m.version('$Module'))"
  $output = (& python -c $code 2>&1 | Select-Object -First 4) -join " "
  if ($LASTEXITCODE -eq 0) {
    return New-Result -Name $Name -Status "ok" -Detail $output.Trim() -Command "python -c import $Module" -Source $Source
  }

  New-Result -Name $Name -Status "missing" -Detail $output.Trim() -Command "python -c import $Module" -Source $Source
}

function Test-PythonLauncherImport {
  param(
    [string]$Name,
    [string]$Module,
    [string]$PythonVersion = "3.13",
    [string]$Source = ""
  )

  $py = Get-Command py -ErrorAction SilentlyContinue
  if (-not $py) {
    return Test-PythonImport -Name $Name -Module $Module -Source $Source
  }

  $code = "import importlib.metadata as m; import $Module; print(m.version('$Module'))"
  $output = (& py "-$PythonVersion" -c $code 2>&1 | Select-Object -First 4) -join " "
  if ($LASTEXITCODE -eq 0) {
    return New-Result -Name $Name -Status "ok" -Detail $output.Trim() -Command "py -$PythonVersion -c import $Module" -Source $Source
  }

  New-Result -Name $Name -Status "missing" -Detail $output.Trim() -Command "py -$PythonVersion -c import $Module" -Source $Source
}

$results = @()
$results += Test-CommandVersion -Name "Hermes Agent CLI" -Command "hermes" -VersionArgs @("version") -Source "https://github.com/NousResearch/hermes-agent" -TimeoutSec 30
$results += Test-Http -Name "Hermes dashboard" -Url "http://127.0.0.1:9119/sessions" -Source "https://hermes-agent.nousresearch.com/docs/"
$results += Test-CommandVersion -Name "OpenClaw CLI" -Command "openclaw" -VersionArgs @("--version") -Source "https://docs.openclaw.ai/"
$results += Test-Http -Name "OpenClaw dashboard" -Url "http://127.0.0.1:18789/" -Source "https://docs.openclaw.ai/"
$results += Test-PythonLauncherImport -Name "DeepAgents Python package" -Module "deepagents" -Source "https://docs.langchain.com/oss/python/deepagents/overview"
$results += Test-CommandVersion -Name "Deep Agents Code CLI" -Command "dcode" -VersionArgs @("--version") -Source "https://docs.langchain.com/oss/python/deepagents/code/overview" -TimeoutSec 30
$results += Test-CommandVersion -Name "Claude Code CLI" -Command "claude" -VersionArgs @("--version") -Source "https://code.claude.com/docs/"
$results += Test-CommandVersion -Name "Codex CLI" -Command "codex" -VersionArgs @("--version") -Source "https://developers.openai.com/codex/"
$results += Test-CommandPresence -Name "Grok wrapper" -Command "gr" -Source "local shell profile"
$results += Test-CommandPresence -Name "Antigravity wrapper" -Command "agy-run" -Source "local shell profile"
$results += Test-CommandVersion -Name "Node.js" -Command "node" -VersionArgs @("--version")
$results += Test-CommandVersion -Name "Python" -Command "python" -VersionArgs @("--version")
$results += Test-CommandVersion -Name "Git" -Command "git" -VersionArgs @("--version")
$results += Test-CommandVersion -Name "ripgrep" -Command "rg" -VersionArgs @("--version") -TimeoutSec 20
$results += Test-CommandVersion -Name "Docker" -Command "docker" -VersionArgs @("--version")
$results += Test-CommandVersion -Name "Railway CLI" -Command "railway" -VersionArgs @("--version") -Source "https://docs.railway.com/"
$results += Test-CommandVersion -Name "Vercel CLI" -Command "vercel" -VersionArgs @("--version") -Source "https://vercel.com/docs/cli"
$results += Test-CommandVersion -Name "Cloudflare Wrangler" -Command "wrangler" -VersionArgs @("--version") -Source "https://developers.cloudflare.com/workers/wrangler/"

$mcpDoctor = Get-Command "mcp-doctor" -ErrorAction SilentlyContinue
if ($mcpDoctor) {
  $output = (& mcp-doctor audit --quick 2>&1 | Select-Object -First 10) -join " "
  $status = if ($LASTEXITCODE -eq 0) { "ok" } else { "warn" }
  $results += New-Result -Name "MCP Doctor quick audit" -Status $status -Detail $output.Trim() -Command "mcp-doctor audit --quick" -Source "https://github.com/frankxai/mcp-doctor"
} else {
  $results += New-Result -Name "MCP Doctor quick audit" -Status "missing" -Detail "mcp-doctor not found" -Command "mcp-doctor audit --quick" -Source "https://github.com/frankxai/mcp-doctor"
}

$heart = Join-Path (Split-Path $PSScriptRoot -Parent | Split-Path -Parent) "Starlight-Intelligence-System\scripts\heart-check.ps1"
if (Test-Path $heart) {
  $output = (& powershell -ExecutionPolicy Bypass -File $heart 2>&1 | Select-Object -Last 12) -join " "
  $status = if ($LASTEXITCODE -eq 0) { "ok" } else { "warn" }
  $results += New-Result -Name "Starlight /heart" -Status $status -Detail $output.Trim() -Command $heart -Source "local"
} else {
  $results += New-Result -Name "Starlight /heart" -Status "missing" -Detail "heart-check.ps1 not found" -Command $heart -Source "local"
}

if ($Json) {
  $results | ConvertTo-Json -Depth 5
} else {
  $results | Sort-Object status,name | Format-Table -AutoSize name,status,detail
}
