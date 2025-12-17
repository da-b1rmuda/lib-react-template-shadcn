---
title: Installation
order: 0
tags:
  - installation
  - setup
---

# Installation

Dock Rush is published as a library and a ready-to-use Vite template.

## 1. Install the library

```bash
pnpm add dock-rush
```

Then wrap your app with the `Documentation` component:

```tsx
import { Documentation } from 'dock-rush'

export function App() {
  return <Documentation title="My docs" />
}
```

## 2. Configure docs folder

By default Dock Rush scans the `/docs` folder of your app. Each markdown file
becomes a page and the folder structure becomes the navigation tree.


