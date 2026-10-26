param(
    [string]$Message = "Update website $(Get-Date -Format 'yyyy-MM-dd HH:mm')",
    [switch]$CheckOnly
)

$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

function Invoke-Git {
    param([string[]]$Arguments)
    & git @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "Git failed: git $($Arguments -join ' '). Nothing will be force-pushed."
    }
}

try {
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        throw 'Git is not installed or not available in PATH. Install Git for Windows, then try again.'
    }
    $remote = (Invoke-Git -Arguments @('remote', 'get-url', 'origin')).Trim()
    if ($remote -notin @('https://github.com/majferjan/Survive-without-Maj.git', 'https://github.com/majferjan/Survive-without-Maj', 'git@github.com:majferjan/Survive-without-Maj.git')) {
        throw "Unexpected repository: $remote. Expected majferjan/Survive-without-Maj."
    }
    $branch = (Invoke-Git -Arguments @('branch', '--show-current')).Trim()
    if ($branch -ne 'main') {
        throw "Current branch is '$branch'. Switch to main before using this publishing script."
    }
    $conflicts = Invoke-Git -Arguments @('diff', '--name-only', '--diff-filter=U')
    if ($conflicts) { throw 'Resolve the existing Git merge conflicts before publishing.' }

    $nodeCommand = Get-Command node -ErrorAction SilentlyContinue
    if ($nodeCommand) {
        $nodePath = $nodeCommand.Source
    } else {
        $nodePath = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
        if (-not (Test-Path -LiteralPath $nodePath)) {
            throw 'Node.js is required for the site checks. Install Node.js, then try again.'
        }
    }

    Write-Host 'Checking the website...' -ForegroundColor Cyan
    foreach ($test in @('tests.cjs', 'performance-tests.cjs')) {
        & $nodePath (Join-Path $PSScriptRoot $test)
        if ($LASTEXITCODE -ne 0) { throw "$test failed. Fix the reported problem before publishing." }
    }
    if ($CheckOnly) {
        Write-Host 'Checks passed. No files staged, committed, or pushed.' -ForegroundColor Green
        exit 0
    }

    Write-Host 'Checking GitHub for newer changes...' -ForegroundColor Cyan
    Invoke-Git -Arguments @('fetch', 'origin', 'main')
    & git merge-base --is-ancestor origin/main HEAD
    if ($LASTEXITCODE -ne 0) {
        throw 'GitHub has changes missing from this checkout. Integrate origin/main first, then run this script again. Your local files have not been staged or committed by this script.'
    }

    Write-Host 'Saving project changes...' -ForegroundColor Cyan
    Invoke-Git -Arguments @('add', '--all')
    & git diff --cached --quiet
    $diffExit = $LASTEXITCODE
    if ($diffExit -eq 1) {
        Invoke-Git -Arguments @('commit', '-m', $Message)
    } elseif ($diffExit -eq 0) {
        Write-Host 'No new file changes. Checking for commits to push.'
    } else {
        throw 'Could not inspect staged changes.'
    }

    Write-Host 'Uploading to GitHub...' -ForegroundColor Cyan
    Invoke-Git -Arguments @('push', 'origin', 'HEAD:main')
    Write-Host ''
    Write-Host 'Successfully submitted to GitHub.' -ForegroundColor Green
    Write-Host 'GitHub Pages will publish the update after its deployment checks finish.'
    Write-Host 'Deployment status: https://github.com/majferjan/Survive-without-Maj/actions'
    Write-Host 'Website: https://majferjan.github.io/Survive-without-Maj/'
    exit 0
} catch {
    Write-Host ''
    Write-Host "Submission stopped: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host 'Your files and any local commits are retained. Fix the issue and run the script again.'
    exit 1
}
