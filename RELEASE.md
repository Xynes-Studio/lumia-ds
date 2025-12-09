# Lumia DS v2 — Release Checklist

> **Purpose**: End-to-end guide for cutting a Lumia Design System release.  
> Another maintainer can follow this checklist and successfully release without tribal knowledge.

---

## Quick Reference

| Step | Command | Purpose |
|------|---------|---------|
| Lint | `pnpm lint` | ESLint code quality |
| Type Check | `pnpm type-check` | TypeScript validation |
| Unit Tests | `pnpm test` | All package tests with coverage |
| Visual Tests | `pnpm test:visual` | Playwright screenshot regression |
| Build All | `pnpm build` | Build all packages |
| Version | `pnpm version-packages` | Bump versions via Changesets |
| Publish | `pnpm release` | Publish to npm registry |

---

## 📋 Pre-Flight Checks

Before beginning a release, ensure all pipelines pass.

### 1.1 Code Quality
- [ ] **Run linting**
  ```bash
  pnpm lint
  ```
  Fix any ESLint errors before proceeding.

- [ ] **Run type checking**
  ```bash
  pnpm type-check
  ```
  Resolve TypeScript errors if any.

### 1.2 Test Suites
- [ ] **Run unit & interaction tests**
  ```bash
  pnpm test
  ```
  Ensure **75% minimum coverage** is maintained.

- [ ] **Run visual regression tests**
  ```bash
  # Build Storybook first (required for visual tests)
  pnpm storybook:build
  
  # Run visual tests
  pnpm test:visual
  ```
  
  > **CI Note**: Visual regression runs automatically on PRs via `.github/workflows/visual-regression.yml`

  If snapshots need updating due to intentional changes:
  ```bash
  pnpm test:visual:update
  ```

### 1.3 Dependencies Audit
- [ ] Check for pending changesets in `.changeset/` directory
- [ ] Verify no breaking dependency updates are pending

---

## 🔧 Build Artifacts

### 2.1 Build Tokens & Icons
- [ ] **Build design tokens**
  ```bash
  pnpm --filter @lumia/tokens build
  ```

- [ ] **Import and generate icons** (if icons were updated)
  ```bash
  pnpm icons:import
  pnpm --filter @lumia/icons build
  ```

### 2.2 Build All Packages
- [ ] **Build the entire monorepo**
  ```bash
  pnpm build
  ```
  This builds all packages in dependency order:
  - `@lumia/tokens` → `@lumia/theme` → `@lumia/core` → `@lumia/components` → etc.

### 2.3 Verify Storybook
- [ ] **Build static Storybook**
  ```bash
  pnpm storybook:build
  ```
  Verify the build completes without errors.

---

## 📦 Changesets Workflow

We use [Changesets](https://github.com/changesets/changesets) for versioning and changelog generation.

### 3.1 Verify Changesets Exist
- [ ] Check `.changeset/` for pending changesets:
  ```bash
  ls .changeset/*.md | grep -v README
  ```
  
  If no changesets exist for the intended release, contributors must add them:
  ```bash
  pnpm changeset
  ```

### 3.2 Version Packages
- [ ] **Apply version bumps and generate changelogs**
  ```bash
  pnpm version-packages
  ```
  
  This will:
  - Consume all pending changesets
  - Bump package versions based on changeset types
  - Update all `CHANGELOG.md` files
  - Update internal dependency versions

- [ ] **Review generated changes**
  - Check each package's `package.json` version
  - Review each package's `CHANGELOG.md`
  - Verify no unexpected breaking changes

- [ ] **Commit version changes**
  ```bash
  git add .
  git commit -m "chore: version packages for release"
  ```

### 3.3 Publish to npm
- [ ] **Ensure you're authenticated with npm**
  ```bash
  npm whoami
  ```

- [ ] **Publish all packages**
  ```bash
  pnpm release
  ```

  > **Note**: Our Changesets config uses `"access": "restricted"`. Update to `"public"` in `.changeset/config.json` for public npm packages.

---

## 🏷️ Git Tagging & GitHub Release

### 4.1 Create Git Tags
- [ ] **Tag the release**
  ```bash
  # Get the new version (from root or main package)
  VERSION=$(node -p "require('./packages/components/package.json').version")
  
  # Create annotated tag
  git tag -a "v${VERSION}" -m "Release v${VERSION}"
  ```

- [ ] **Push tags to remote**
  ```bash
  git push origin main --follow-tags
  ```

### 4.2 Create GitHub Release
- [ ] Go to [GitHub Releases](../../releases/new)
- [ ] Select the newly created tag
- [ ] Title: `v{VERSION}`
- [ ] Description: Copy highlights from the relevant `CHANGELOG.md` files
- [ ] Attach any release assets (Storybook build if applicable)
- [ ] Publish release

---

## 📚 Post-Release

### 5.1 Documentation
- [ ] Update Storybook deployment (if hosted separately)
- [ ] Update documentation site with new version notes
- [ ] Verify docs reflect any API changes

### 5.2 Communication
- [ ] Announce release in team channel (Slack/Teams)
- [ ] Update consuming applications of the new version
- [ ] Monitor for issues in the first 24-48 hours

### 5.3 Cleanup
- [ ] Delete merged release branch (if using release branches)
- [ ] Close related JIRA/GitHub issues
- [ ] Archive the release milestone

---

## 🔥 Troubleshooting

### Visual Tests Failing in CI
```bash
# Update snapshots locally
pnpm test:visual:update

# Verify updates
pnpm test:visual

# Commit new snapshots
git add e2e/**/*.png
git commit -m "test: update visual regression snapshots"
```

### Changeset Version Conflicts
```bash
# If version-packages fails due to conflicts
git checkout main
git pull origin main
pnpm version-packages
```

### Build Failures
```bash
# Clean and rebuild
rm -rf node_modules packages/*/node_modules
pnpm install
pnpm build
```

### npm Publish Auth Issues
```bash
# Re-authenticate
npm login

# Verify auth
npm whoami

# Check registry
npm config get registry
```

---

## 📁 Related Documentation

| Document | Path | Purpose |
|----------|------|---------|
| Contributing Guide | [CONTRIBUTING.md](./CONTRIBUTING.md) | Changeset workflow for contributors |
| QA Test Plan | [docs/qa-test-plan.md](./docs/qa-test-plan.md) | Full QA strategy and testing details |
| QA Checklist | [docs/qa-component-checklist.md](./docs/qa-component-checklist.md) | Per-component QA checklist |
| Changesets Config | [.changeset/config.json](./.changeset/config.json) | Changesets configuration |

---

## 📊 CI Pipelines Reference

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| CI | `.github/workflows/ci.yml` | Push/PR to main | Lint, type-check, build |
| Tests | `.github/workflows/test.yml` | Push/PR to main | Run all unit tests |
| Visual Regression | `.github/workflows/visual-regression.yml` | PR to main | Playwright visual tests |

---

## ✅ Release Sign-Off

Before finalizing the release, verify:

- [ ] All CI pipelines passed on `main`
- [ ] Visual regression tests passed (no unintended diffs)
- [ ] All changesets consumed and versions correct
- [ ] Packages published to npm successfully
- [ ] Git tags pushed and GitHub release created
- [ ] Documentation updated
- [ ] Team notified

**Release completed by**: ________________________  
**Date**: ________________________  
**Version**: ________________________
