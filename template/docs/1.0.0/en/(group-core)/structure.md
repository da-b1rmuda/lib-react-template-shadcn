---
title: Structure, versions and languages
order: 0
tags:
  - versions
  - languages
---

# Structure, versions and languages

Dock Rush builds the sidebar from the file paths:

- The first segment that looks like a version (`1.0.0`, `2.1`) becomes a **version node**.
- Folders named with language codes (`en`, `ru`, `de`, `fr`, etc.) become **language scopes**.
- Remaining folders and files become dropdowns, groups and pages.

To add another version of the docs, create a new top-level folder under `docs/`
with a different semver (for example `2.0.0`) and copy or adapt the content.


