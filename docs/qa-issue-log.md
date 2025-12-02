# QA Issue Log & Run Tracker

Use this log to track QA runs and link findings. File issues in GitHub with the `qa` label and link them back here.

## How to Log Issues
1. File a GitHub issue per defect with label `qa` and component/package labels.
2. Reference the Storybook story ID (e.g., `components-tabs--default`) and Atlas session ID.
3. Add the issue link to the run table below.

### Issue template
```
Title: [Component/Block] brief defect summary

Scope: component/block/package
Environment: Storybook @ <url> | Atlas session <id> | browser(s)
Steps to reproduce:
1. ...
2. ...
Expected: ...
Actual: ...
Artifacts: screenshots/video/console logs
Severity: S1 blocker | S2 major | S3 minor | S4 polish
```

## Run log
| Session ID | Date | Scope | Browsers | Status | Notes / Issues |
| --- | --- | --- | --- | --- | --- |
| SB-DS702-001 | 2025-12-02 | Pagination story + lint/unit check | Unit (Vitest) | Passed | `pnpm --filter @lumia/components exec vitest run src/pagination.test.tsx src/index.test.ts`, `pnpm lint`; no issues found. |
| SB-DS701-001 | 2024-12-02 | Table wrapper story + lint/unit check | Unit (Vitest) | Passed | `pnpm --filter @lumia/components exec vitest run table.test.tsx`, `pnpm lint`; no issues found. |
| ATLAS-001 | Pending | Cross-browser exploratory per charter in `qa-test-plan.md` | Chrome, Firefox, Safari, Edge | Scheduled | Run when Atlas access available; log findings here |

Add new rows for each QA sweep (Storybook smoke, Atlas run, RC verification). Keep the most recent runs at the top once populated.
