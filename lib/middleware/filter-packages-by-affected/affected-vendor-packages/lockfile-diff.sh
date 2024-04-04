#!/bin/bash

# Specify the branch to compare against (e.g., main)
base_sha=$1
head_sha=$2

# Retrieve the contents of bun.lockb from the specified branch and save the output
git show "$base_sha:bun.lockb" | bun > compare_lockb.txt

if [ -z "$head_sha" ]; then
    bun ./bun.lockb > current_lockb.txt
else
    git show "$head_sha:bun.lockb" | bun > current_lockb.txt
fi

# Diff the two files and extract the package names
diff current_lockb.txt compare_lockb.txt | sed -n 's/^[<>] "\([^"]*\)@.*/\1/p' | sort | uniq

# Cleanup: remove the temporary files
# rm current_lockb.txt compare_lockb.txt
