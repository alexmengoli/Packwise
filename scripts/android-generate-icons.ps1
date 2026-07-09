param()

$ErrorActionPreference = "Stop"

$RepoRoot = Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")
$ClientRoot = Join-Path $RepoRoot "apps/client"
$SourceAssets = Join-Path $ClientRoot "assets"
$TempAssets = Join-Path $ClientRoot ".tmp-capacitor-icons"

function Assert-LastExitCode {
    param(
        [Parameter(Mandatory = $true)]
        [string] $CommandName
    )

    if ($LASTEXITCODE -ne 0) {
        throw "$CommandName failed with exit code $LASTEXITCODE."
    }
}

$RequiredAssets = @(
    "icon.png",
    "icon-foreground.png",
    "icon-background.png"
)

foreach ($Asset in $RequiredAssets) {
    $AssetPath = Join-Path $SourceAssets $Asset
    if (-not (Test-Path -LiteralPath $AssetPath)) {
        throw "Missing required asset: $AssetPath"
    }
}

Remove-Item -LiteralPath $TempAssets -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force $TempAssets | Out-Null

try {
    Copy-Item -LiteralPath (Join-Path $SourceAssets "icon.png") -Destination (Join-Path $TempAssets "icon-only.png")
    Copy-Item -LiteralPath (Join-Path $SourceAssets "icon-foreground.png") -Destination (Join-Path $TempAssets "icon-foreground.png")
    Copy-Item -LiteralPath (Join-Path $SourceAssets "icon-background.png") -Destination (Join-Path $TempAssets "icon-background.png")

    Push-Location $ClientRoot
    try {
        pnpm exec capacitor-assets generate --android --assetPath ".tmp-capacitor-icons"
        Assert-LastExitCode -CommandName "Capacitor Android icon generation"
    } finally {
        Pop-Location
    }
} finally {
    Remove-Item -LiteralPath $TempAssets -Recurse -Force -ErrorAction SilentlyContinue
}
