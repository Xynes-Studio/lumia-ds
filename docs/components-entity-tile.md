# EntityTile (@lumia-ui/components)

Modular tile primitive for dashboard entities, with App/User wrappers, grid/list layouts, typed quick actions, optional selection, and optional tile activation.

## Import
```ts
import {
  EntityTile,
  AppTile,
  UserTile,
  type EntityTileProps,
  type AppTileProps,
  type UserTileProps,
  type TileView,
  type TileActionItem,
  type TileActionContext,
  type TileSelectionContext,
  type TileActivateContext,
} from '@lumia-ui/components';
```

## Key Behaviors
- Grid/list variants via `view`.
- Quick actions:
  - Grid (`actionVisibility="auto"`): visible on hover/focus.
  - List (`actionVisibility="auto"`): always visible on right.
- Hover experience:
  - Grid actions slide up on reveal and slide down on hide.
  - Container shadow intensifies on hover/focus to reinforce interactivity.
  - Optional hover accent gradient via `hoverAccentColor`.
- Selection via `selectable`, `selected`, `onSelectedChange`.
- Tile activation via `onActivate` (or `href` fallback).
- Maximum 3 quick actions; additional actions are ignored.

## API Notes
- `TileActionItem<TItem>` callbacks receive rich context (`actionId`, `item`, `tileId`, `view`, `selected`).
- `onSelectedChange(next, context)` receives next checked state with tile/item context.
- `onActivate(context)` fires for tile click and keyboard Enter/Space.
- Checkbox and action buttons are isolated from tile activation.
- `hoverAccentColor` customizes hover gradient tint in both list and grid views.

## Accessibility
- Action buttons have `aria-label` from action labels.
- Focus-visible ring uses Lumia token classes.
- Tile activation supports keyboard parity (Enter/Space).
- Selection control uses the Lumia `Checkbox` primitive.

## Architecture And Segregation
- Base component:
  - `packages/components/src/entity-tile/entity-tile.tsx`
- Package-level exports:
  - `packages/components/src/entity-tile/index.ts`
  - `packages/components/src/index.ts`
- Test coverage:
  - `packages/components/src/entity-tile/entity-tile.test.tsx`
  - `packages/components/src/index.test.ts`
- Storybook states:
  - `packages/components/src/entity-tile/entity-tile.stories.tsx`

This keeps implementation, tests, stories, and exports colocated and predictable for contributor onboarding.

## React And Next.js Usage Notes
- `@lumia-ui/components` is consumed from React applications directly.
- In Next.js App Router, import these interactive tiles in client components (`'use client'`) because they depend on DOM events and interactive controls.
- Keep app-level data loading outside the tile and pass serializable props/callback handlers from feature layers.

## Examples

### App tile list
```tsx
<AppTile
  tileId="app-1"
  view="list"
  title="Xynes-CMS"
  avatarSrc="https://avatar.vercel.sh/xynes-cms"
  selectable
  actions={[
    { id: 'pin', label: 'Pin app', icon: 'check', onSelect: ({ tileId }) => console.log(tileId) },
    { id: 'settings', label: 'Configure app', icon: 'settings', onSelect: () => {} },
    { id: 'remove', label: 'Remove app', icon: 'delete', destructive: true, onSelect: () => {} },
  ]}
/>
```

### User tile grid
```tsx
<UserTile
  tileId="user-1"
  view="grid"
  name="User Name"
  designation="Designation"
  teamName="Team Name"
  avatarSrc="https://avatar.vercel.sh/user-name"
  selectable
  onActivate={({ tileId }) => console.log('activate', tileId)}
  hoverAccentColor="rgb(255 210 140 / 0.28)"
  actions={[
    { id: 'message', label: 'Message user', icon: 'chat-bubble', onSelect: () => {} },
    { id: 'settings', label: 'User settings', icon: 'settings', onSelect: () => {} },
  ]}
/>
```

## Verification Checklist
- Lint:
  - `pnpm --filter @lumia-ui/components lint`
- Targeted tests:
  - `pnpm --filter @lumia-ui/components test -- src/entity-tile/entity-tile.test.tsx`
- Full package tests and coverage:
  - `pnpm --filter @lumia-ui/components test`
- Storybook build:
  - `pnpm --filter @lumia-ui/components storybook:build`

## Current Quality Notes
- Coverage is above the ADR minimum (80% global target).
- Known semantic debt:
  - Current tile root is a native `button` and quick actions are also `button`s, which triggers nested-button warnings in React test logs.
  - Recommended follow-up: switch root interactive shell to a non-button container with `role="button"` + keyboard handling, while keeping current visual behavior.
