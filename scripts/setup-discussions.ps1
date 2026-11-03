#Requires -Version 5.1
<#
.SYNOPSIS
  Enable GitHub Discussions, create categories, and post the pinned community nav.
  Prerequisites: gh auth login
#>
$ErrorActionPreference = 'Stop'
$Repo = 'liuyuliangbox/Gaming-Community'
$Gh = 'C:\Program Files\GitHub CLI\gh.exe'
if (-not (Test-Path $Gh)) { $Gh = 'gh' }

& $Gh auth status
if ($LASTEXITCODE -ne 0) {
  Write-Error 'Please run: gh auth login'
}

Write-Host 'Enabling Discussions...'
& $Gh api -X PATCH "repos/$Repo" -f has_discussions=true | Out-Null

$categories = @(
  @{ name = '开发进度';       emoji = ':rocket:';   description = '官方进度与征集反馈'; discussion_format = 'OPEN_ENDED' },
  @{ name = '玩法建议';       emoji = ':bulb:';    description = '设计讨论与投票'; discussion_format = 'OPEN_ENDED' },
  @{ name = 'Bug / 体验反馈'; emoji = ':bug:';     description = '缺陷与体验问题'; discussion_format = 'OPEN_ENDED' },
  @{ name = '美术与氛围';     emoji = ':art:';     description = '画面音乐气质'; discussion_format = 'OPEN_ENDED' },
  @{ name = '闲聊 / 招募测试'; emoji = ':speech_balloon:'; description = '闲聊与测试招募'; discussion_format = 'OPEN_ENDED' },
  @{ name = '评论';           emoji = ':speech_balloon:'; description = 'Giscus 文章评论'; discussion_format = 'OPEN_ENDED' }
)

$existing = & $Gh api "repos/$Repo/discussions/categories" 2>$null | ConvertFrom-Json
# GitHub REST for categories is GraphQL-only; create via GraphQL mutations where needed.
$query = @'
query($owner:String!, $name:String!) {
  repository(owner:$owner, name:$name) {
    id
    discussionCategories(first: 50) {
      nodes { id name }
    }
  }
}
'@
$repoInfo = & $Gh api graphql -f query=$query -f owner=liuyuliangbox -f name=Gaming-Community | ConvertFrom-Json
$repoId = $repoInfo.data.repository.id
$existingNames = @($repoInfo.data.repository.discussionCategories.nodes | ForEach-Object { $_.name })

$createMutation = @'
mutation($repositoryId:ID!, $name:String!, $description:String!, $emoji:String!) {
  createDiscussionCategory(input:{
    repositoryId:$repositoryId,
    name:$name,
    description:$description,
    emoji:$emoji,
    discussionFormat:OPEN_ENDED
  }) {
    category { id name }
  }
}
'@

foreach ($cat in $categories) {
  if ($existingNames -contains $cat.name) {
    Write-Host "Category exists: $($cat.name)"
    continue
  }
  Write-Host "Creating category: $($cat.name)"
  try {
    & $Gh api graphql -f query=$createMutation `
      -f repositoryId=$repoId `
      -f name=$cat.name `
      -f description=$cat.description `
      -f emoji=$cat.emoji | Out-Null
  } catch {
    Write-Warning "Could not create $($cat.name): $_"
  }
}

$navPath = Join-Path $PSScriptRoot '..\docs\discussions-pinned-nav.md'
$body = Get-Content -Raw -Path $navPath
# Strip the leading doc title block before the horizontal rule copy section
$parts = $body -split '(?m)^---\s*$', 3
$postBody = if ($parts.Count -ge 2) { $parts[-1].Trim() } else { $body }

$repoInfo2 = & $Gh api graphql -f query=$query -f owner=liuyuliangbox -f name=Gaming-Community | ConvertFrom-Json
$general = $repoInfo2.data.repository.discussionCategories.nodes |
  Where-Object { $_.name -eq '开发进度' -or $_.name -eq 'General' } |
  Select-Object -First 1

if (-not $general) {
  $general = $repoInfo2.data.repository.discussionCategories.nodes | Select-Object -First 1
}

$createDiscussion = @'
mutation($repositoryId:ID!, $categoryId:ID!, $title:String!, $body:String!) {
  createDiscussion(input:{
    repositoryId:$repositoryId,
    categoryId:$categoryId,
    title:$title,
    body:$body
  }) {
    discussion { url number }
  }
}
'@

Write-Host "Creating pinned navigation discussion under: $($general.name)"
$result = & $Gh api graphql -f query=$createDiscussion `
  -f repositoryId=$repoId `
  -f categoryId=$general.id `
  -f title='社区导航' `
  -f body=$postBody | ConvertFrom-Json

$url = $result.data.createDiscussion.discussion.url
Write-Host "Discussion created: $url"
Write-Host ''
Write-Host 'Next: open the discussion and pin it. Then configure Giscus at https://giscus.app/zh-CN'
Write-Host 'Fill repoId/categoryId into src/consts.ts GISCUS.'
