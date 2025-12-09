# Contributing to Lumia DS

## Versioning & Releases

We use [Changesets](https://github.com/changesets/changesets) to manage versioning and changelogs.

### Workflow

1.  **Make your changes** in the codebase.
2.  **Create a changeset**: Run `pnpm changeset`.
    - Select the packages you modified.
    - Choose the version bump type (major, minor, patch).
    - Write a summary of the changes.
3.  **Commit** the changeset file along with your code.
4.  **Open a Pull Request**. The changeset will be processed upon merge.

### Releasing

When changes reach the `main` branch, a "Version Packages" PR will be automatically created (once CI is configured). Merging that PR will publish the packages to NPM.

To manually version and publish (if authorized):
```bash
pnpm version-packages
pnpm release
```
