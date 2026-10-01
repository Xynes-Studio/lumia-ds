# @lumia-ui/cli

## Unreleased

- XYN-SEC-004: validate a bounded static SVG subset before replacing generated
  components. Reject active markup, interpolation and unsupported features; emit
  escaped JSX without raw HTML. Add security regressions, JavaScript type checks
  and an 80% coverage gate. See README for asset compatibility restrictions.

## 0.1.0

### Minor Changes

- Lumia DS v2.0.0 Release

  **Highlights:**
  - **New CLI**: Scaffolding and component generation tools.
  - **Unified Icons**: Sprite support and accessibility features.
  - **Enhanced Calendar**: Custom date-fns based implementation.
  - **Visual Testing**: Playwright integration.

  **Breaking Changes:**
  - Calendar component API changes.
  - Token path aliases updated.
  - Icon component API standardization.
