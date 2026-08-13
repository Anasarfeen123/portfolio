---
date: "2026-08-13"
tags: ["GitHub API"]
---
GitHub's GraphQL `contributionsCollection` field (what powers the green-squares contribution graph) needs a **classic** personal access token with the `read:user` scope. Fine-grained PATs — the kind you'd normally reach for now, scoped to one repo — don't map cleanly onto this field. Learned this building this site's homepage contribution graph, right after using a fine-grained PAT for everything else; had to create a second, differently-shaped token just for this one query.
