#!/usr/bin/env bash
# Opens an issue (or comments on the open one) when a scheduled workflow run
# fails, so nobody has to watch Actions. Usage: notify-scheduled-failure.sh <workflow-name>
# Needs GH_TOKEN, GITHUB_REPOSITORY, GITHUB_SERVER_URL, GITHUB_RUN_ID and
# `issues: write`. Labels follow conventions §8 (a failing workflow is a p1 bug).
set -euo pipefail

workflow="${1:?workflow name required}"
title="Scheduled ${workflow} run is failing"
run_url="${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}"
body="The weekly \`${workflow}\` run failed: ${run_url}"

existing="$(gh issue list --repo "$GITHUB_REPOSITORY" --state open --label bug \
  --search "\"${title}\" in:title" --json number,title \
  --jq "[.[] | select(.title == \"${title}\")][0].number // empty")"

if [ -n "$existing" ]; then
  gh issue comment "$existing" --repo "$GITHUB_REPOSITORY" --body "Failed again: ${run_url}"
else
  gh issue create --repo "$GITHUB_REPOSITORY" --title "$title" --body "$body" \
    --label bug --label p1 --label status:ready
fi
