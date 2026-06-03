# RFC Process

Use RFCs for:

- breaking API or behavior changes
- contract updates
- major architecture shifts
- additions that affect public developer experience or migration paths

Do not require an RFC for:

- typo fixes
- small internal refactors
- routine dependency bumps

## Workflow

1. Copy `0000-template.md` to `NNNN-short-title.md`.
2. Fill all required sections.
3. Open PR with `[RFC]` in title.
4. Get at least one framework maintainer approval.
5. Mark status as `Accepted` before implementation merges.
6. Link implementation PRs and migration notes.

## Status Values

- `Draft`
- `Proposed`
- `Accepted`
- `Rejected`
- `Implemented`

## Required For Breaking Changes

Any breaking change must include:

- migration strategy
- compatibility risks
- contract version impact
