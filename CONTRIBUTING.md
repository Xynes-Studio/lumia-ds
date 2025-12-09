# Contributing to Lumia DS

Thank you for contributing to Lumia Design System!

## Development Setup

```bash
# Install dependencies
pnpm install

# Start Storybook for development
pnpm storybook

# Run tests
pnpm test

# Run linting
pnpm lint
```

## Versioning & Releases

We use [Changesets](https://github.com/changesets/changesets) to manage versioning and changelogs.

### Contributor Workflow

1.  **Make your changes** in the codebase.
2.  **Create a changeset**: Run `pnpm changeset`.
    - Select the packages you modified.
    - Choose the version bump type (major, minor, patch).
    - Write a summary of the changes.
3.  **Commit** the changeset file along with your code.
4.  **Open a Pull Request**. The changeset will be processed upon merge.

### For Maintainers

See [RELEASE.md](./RELEASE.md) for the complete release checklist including:
- Pre-flight checks (lint, type-check, tests, visual regression)
- Build artifacts (tokens, icons, packages)
- Changesets versioning and publishing
- Git tagging and GitHub release creation

## Code Quality

Before submitting a PR, ensure:
- [ ] `pnpm lint` passes
- [ ] `pnpm type-check` passes
- [ ] `pnpm test` passes with 75% minimum coverage
- [ ] Visual tests pass: `pnpm test:visual`

## Related Documentation

| Document | Purpose |
|----------|---------|
| [RELEASE.md](./RELEASE.md) | Release process for maintainers |
| [docs/qa-test-plan.md](./docs/qa-test-plan.md) | QA strategy and testing |
| [docs/qa-component-checklist.md](./docs/qa-component-checklist.md) | Component QA checklist |
