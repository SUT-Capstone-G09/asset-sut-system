# Embed permissions in JWT instead of checking the database per request

Permissions are fetched from the database at login and token refresh, embedded as a flat `[]string` of `module:action` pairs in the JWT access token claims, and verified in middleware by checking the cryptographically-signed claims — no database query per request.

The alternative was a DB lookup on every protected request (the `PermissionChecker` interface that was already wired up). We chose JWT embedding because the system is a university booking platform with low revocation urgency, and the per-request DB hit on every API call was unnecessary overhead.

## Consequences

Permission changes take effect within 15 minutes (access token TTL). Token refresh re-fetches permissions from the DB, so changes are picked up on the next refresh cycle. Instant revocation is not supported by design.
