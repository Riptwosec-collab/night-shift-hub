# POWRR / MTrain HD130 — GitHub one-commit installer for Windows.
# Requires Git for Windows and permission to push Riptwosec-collab/Powrr.
# Does not install third-party packages, touch workouts, or deploy automatically.
param(
  [string]$Archive = (Join-Path $PSScriptRoot 'POWRR_MTRAIN_HD130_GitHub_Install.zip'),
  [string]$RepoPath = (Join-Path $PSScriptRoot 'Powrr')
)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$Branch = 'feat/mtrain-hd130-exercise-library'
$RepoURL = 'https://github.com/Riptwosec-collab/Powrr.git'
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw 'Install Git for Windows first: https://git-scm.com/download/win' }
if (-not (Test-Path -LiteralPath $Archive -PathType Leaf)) { throw "Missing archive: $Archive" }
if (-not (Test-Path -LiteralPath $RepoPath)) {
  & git clone $RepoURL $RepoPath
  if ($LASTEXITCODE -ne 0) { throw 'git clone failed. Sign in to GitHub with a user who can access the repository.' }
}
if (-not (Test-Path -LiteralPath (Join-Path $RepoPath '.git'))) {throw "Not a Git clone: $RepoPath"}
$origin = (& git -C $RepoPath remote get-url origin | Out-String).Trim()
if ($origin -notmatch '(?i)Riptwosec-collab/Powrr(\.git)?$') {throw "Unexpected Git remote: $origin"}
$dirty = (& git -C $RepoPath status --porcelain | Out-String).Trim()
if ($dirty) {throw 'Repository contains uncommitted changes. Commit/stash them before installing, or use a fresh clone.'}
& git -C $RepoPath fetch origin $Branch
if ($LASTEXITCODE -ne 0) {throw 'Cannot fetch the HD130 branch. Confirm that the GitHub pull request exists.'}
& git -C $RepoPath checkout -B $Branch ('origin/'+$Branch)
if ($LASTEXITCODE -ne 0) {throw 'Cannot check out HD130 branch.'}
Expand-Archive -LiteralPath $Archive -DestinationPath $RepoPath -Force
$manifestPath = Join-Path $RepoPath 'assets/mtrain-130/manifest-v130.json'
if (-not (Test-Path $manifestPath)) { throw 'Missing manifest in installed archive.' }
$manifest = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
if ($manifest.schema -ne 'mtrain-hd130/v1' -or $manifest.category_count -ne 13 -or $manifest.exercise_count -ne 130 -or @($manifest.exercises).Count -ne 130) {throw 'Invalid 13-category / 130-image manifest.'}
$i=0
foreach($ex in $manifest.exercises) {
  $relative = $ex.src -replace '^\./',''
  if ($relative -notmatch '^assets/mtrain-130/[a-z0-9-]+/[a-z0-9-]+\.webp$') {throw "Unsafe image path: $relative"}
  $imagePath = Join-Path $RepoPath ($relative -replace '/', [IO.Path]::DirectorySeparatorChar)
  if (-not (Test-Path -LiteralPath $imagePath)) {throw "Missing image: $relative"}
  $sum = (Get-FileHash -LiteralPath $imagePath -Algorithm SHA256).Hash.ToLowerInvariant()
  if ($sum -ne $ex.sha256) {throw "Checksum mismatch: $relative"}
  $i++
}
Write-Host "Verified $i original WebP images across 13 categories." -ForegroundColor Green
& git -C $RepoPath add -- assets/mtrain-130 assets/favicon-32.png assets/favicon-48.png assets/icon-192.png assets/icon-512.png assets/icon-maskable-512.png assets/apple-touch-icon.png README_HD130_UPLOAD.txt
if ($LASTEXITCODE -ne 0) {throw 'git add failed'}
& git -C $RepoPath diff --cached --quiet
if ($LASTEXITCODE -eq 0) { Write-Host 'All assets already match the branch. No changes to push.'; exit 0 }
& git -C $RepoPath commit -m 'assets(mtrain): add 130 original exercise WebPs and restore PWA icons'
if ($LASTEXITCODE -ne 0) {throw 'git commit failed. Configure Git user.name and user.email first.'}
& git -C $RepoPath push origin $Branch
if ($LASTEXITCODE -ne 0) {throw 'git push failed. Verify GitHub permissions and authentication.'}
Write-Host 'Uploaded all 130 assets to the HD130 feature branch. Review the Pull Request, then merge to deploy.' -ForegroundColor Green
