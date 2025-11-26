# Component/Block QA Checklist

Use this for every new component/block and for significant changes. Check items off in PR descriptions.

- [ ] Stories cover key states (default, hover/focus/active/disabled/error/loading) and edge cases; controls/args provided where helpful.
- [ ] Visual alignment matches design tokens (spacing, radius, typography, color). No stray scrollbars or clipping.
- [ ] Responsive: behaves at 375px width, mid-range tablet, and wide desktop; content wraps gracefully.
- [ ] Theming: works in light/dark (if supported); respects `ThemeProvider` defaults; no hardcoded colors.
- [ ] Accessibility: correct role/ARIA; labels associated; focus order correct; Esc closes dismissibles; tab/shift+tab works; screen reader name announced.
- [ ] Keyboard parity: all interactive actions available via keyboard; focus ring visible.
- [ ] Error/empty/loading states render without console errors; skeletons/spinners sized correctly.
- [ ] RTL (if applicable): mirrors layout and iconography properly.
- [ ] Integration: component composes correctly in blocks/runtime schemas; props/types exported and documented.
- [ ] Tests/validation: lint + type-check pass; unit/interaction tests added or confirmed not applicable; visual diffs updated (if tool available).
- [ ] Docs: README/props table updated; Storybook docs tab has usage and a11y notes; changelog entry if required.
