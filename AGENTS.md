<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## WWT frontend rules

- Follow the existing project architecture.
- Use Next.js Pages Router.
- Inspect existing files before creating new files.
- Reuse existing components, types, and enums.
- Frontend enums and types are aligned with backend contracts.
- Never invent backend fields, enums, GraphQL queries, mutations, DTO properties, relationships, or WebSocket events.
- If backend functionality is missing, state that a backend change is required.
- Do not use `any`.
- Use the existing MaterialTheme.
- Use SCSS for layout/page styling.
- Do not install new dependencies unless necessary.
- Do not modify unrelated files.
