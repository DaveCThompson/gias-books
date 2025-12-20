# Idea: Security Upgrade: Next.js 16

## Concept
Upgrade the entire monorepo (Studio & Viewer) to Next.js 16 to resolve persistent high-severity vulnerabilities (DoS/RCE) found in v15.1.0 that cannot be fixed by minor non-breaking patches.

## Implementation Details
-   **Dependencies**: Bump `next`, `eslint-config-next`, `@next/eslint-plugin-next` to `@latest` in `apps/studio` and `apps/viewer`.
-   **Verification**: Run full regression tests on the Builder and Viewer apps.
-   **Audit**: Verify `npm audit` returns 0 vulnerabilities after upgrade.

## Value Proposition
-   **Security**: Eliminates known CVEs (Denial of Service, Remote Code Execution).
-   **Stability**: Leverages latest stability improvements in Next.js 16.
-   **Compliance**: Ensures clean specific audit for production deployment.
