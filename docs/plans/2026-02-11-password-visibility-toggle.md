# Password Visibility Toggle Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a password visibility toggle (eye icon) to Lumia DS password inputs without breaking existing behavior.

**Architecture:** Extend the existing `Input` component to optionally render a password-visibility toggle when `type="password"` is used, using Lumia DS icons and shared field styles. Preserve existing `Input` API, keep changes localized to the input component, and document any new props and behavior.

**Tech Stack:** React, TypeScript, Vitest, Lumia DS components

---

### Task 1: Implement password visibility toggle (requires eye icons)

**Pre-step: Add eye icons to the icons package**

- Create `packages/icons/svg/icon-eye.svg`
- Create `packages/icons/svg/icon-eye-off.svg`
- Run `pnpm build:icons` to regenerate the icon registry
- Confirm new icons are available via `<Icon name="eye" />` and `<Icon name="eye-off" />`

**Files:**
- Modify: `packages/components/src/input/input.tsx`
- Modify: `packages/components/src/input/input.test.tsx`

**Step 1: Write the failing test**

```tsx
test('renders a password visibility toggle for password inputs', async () => {
  // Render <Input type="password" /> and assert a toggle button exists.
  // Expect input type to switch between password and text when toggled.
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter @lumia-ui/components test packages/components/src/input/input.test.tsx`
Expected: FAIL with missing toggle button or unchanged input type.

**Step 3: Write minimal implementation**

```tsx
// Add a toggle button next to the input when type === 'password'.
// Use Lumia DS icon for visibility and aria-label.
```

**Step 4: Run test to verify it passes**

Run: `pnpm --filter @lumia-ui/components test packages/components/src/input/input.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/components/src/input/input.tsx packages/components/src/input/input.test.tsx
git commit -m "feat: add password visibility toggle"
```

### Task 2: Add accessibility + regression coverage

**Files:**
- Modify: `packages/components/src/input/input.test.tsx`
- Modify: `packages/components/src/input/input.tsx`

**Step 1: Write the failing test**

```tsx
test('password toggle is accessible and preserves aria-describedby', async () => {
  // Render with hint + aria-describedby, verify toggle has aria-label
  // and input aria-describedby still includes hint + existing ids.
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter @lumia-ui/components test packages/components/src/input/input.test.tsx`
Expected: FAIL with missing aria label or describedby regression.

**Step 3: Write minimal implementation**

```tsx
// Ensure toggle button has aria-label and does not break describedby.
```

**Step 4: Run test to verify it passes**

Run: `pnpm --filter @lumia-ui/components test packages/components/src/input/input.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/components/src/input/input.tsx packages/components/src/input/input.test.tsx
git commit -m "test: cover password toggle accessibility"
```

### Task 3: Update docs if needed

**Files:**
- Modify: `docs/components-input-group.md` (or relevant Input docs if present)

**Step 1: Write doc update**

```md
## Password inputs
Use `type="password"` to render a visibility toggle.
```

**Step 2: Verify docs format**

Run: `pnpm lint` (if docs linted)
Expected: PASS

**Step 3: Commit**

```bash
git add docs/components-input-group.md
git commit -m "docs: document password visibility toggle"
```
