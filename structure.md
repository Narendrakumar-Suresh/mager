framework/
├── packages/
│   ├── core/
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── index.js
│   │   │   ├── runtime/
│   │   │   │   ├── client.jsx
│   │   │   │   └── server.jsx
│   │   │   └── types.d.ts
│   │   └── exports/
│   │       └── trpc.js
│   ├── cli/
│   │   ├── package.json
│   │   ├── bin/
│   │   │   └── cli.js
│   │   └── src/
│   │       ├── commands/
│   │       │   ├── dev.js
│   │       │   ├── build.js
│   │       │   └── start.js
│   │       ├── plugins/
│   │       │   ├── vite-plugin.js
│   │       │   └── route-scanner.js
│   │       └── nitro-preset.js
│   └── router/
│       ├── package.json
│       └── src/
│           ├── index.js
│           └── route-matcher.js
├── examples/
│   └── basic/
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   └── blog/
│       │       └── page.tsx
│       ├── server/
│       │   ├── api/
│       │   └── rpc/
│       │       └── index.ts
│       └── package.json
├── package.json
└── pnpm-workspace.yaml
