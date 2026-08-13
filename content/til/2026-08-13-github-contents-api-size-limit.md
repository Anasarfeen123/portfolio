---
date: "2026-08-13"
tags: ["GitHub API"]
---
GitHub's simple Contents API (`PUT /repos/.../contents/:path`) has a practical ~1MB reliability ceiling for the base64-encoded content in a single request — not documented officially, but consistently reported. Bigger or binary files need the lower-level Git Data API instead: create a blob, then a tree (anchored to the current tree via `base_tree`, or it silently wipes every other file), then a commit, then move the branch ref forward. The one easy way to corrupt a binary upload: the blob's `encoding` field defaults to `utf-8` if you don't set it to `"base64"` explicitly.
