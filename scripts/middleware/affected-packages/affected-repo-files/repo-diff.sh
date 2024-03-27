#!/bin/bash

base_sha=$1
head_sha=$2

if [ -z "$head_sha" ]; then
  # If head_ref is empty, use 'HEAD' as the default
  modified_files=$(git diff --name-only --diff-filter=M --cached "$base_sha")
  deleted_files=$(git diff --name-only --diff-filter=D --cached "$base_sha")
  added_files=$(git diff --name-only --diff-filter=A --cached "$base_sha")
  renamed_files=$(git diff --name-only --diff-filter=R --cached "$base_sha")
  committed_files=$(git diff --name-only "$base_sha")
else
  modified_files=$(git diff --name-only --diff-filter=M "$base_sha".."$head_sha")
  deleted_files=$(git diff --name-only --diff-filter=D "$base_sha".."$head_sha")
  added_files=$(git diff --name-only --diff-filter=A "$base_sha".."$head_sha")
  renamed_files=$(git diff --name-only --diff-filter=R "$base_sha".."$head_sha")
  committed_files=$(git diff --name-only "$base_sha^".."$head_sha^")
fi

# Get untracked files
untracked_files=$(git ls-files --others --exclude-standard)

# Get not staged files
not_staged_files=$(git diff --name-only)

# Combine all file paths and remove duplicates
all_files=$(echo -e "$modified_files\n$deleted_files\n$added_files\n$renamed_files\n$untracked_files\n$not_staged_files\n$committed_files")

echo "$all_files"
