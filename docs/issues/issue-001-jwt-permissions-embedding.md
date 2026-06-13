# Issue 001 — Embed permissions in JWT at login and refresh

## What to build

Extend the JWT access token to carry the user's effective permissions as a flat `[]string` of `module:action` strings (e.g. `["location_mgmt:create", "booking:read"]`). The permissions are fetched from the database once — at login and at every token refresh — then embedded in the signed claims. `AuthMiddleware` sets the permission slice into the Gin context so downstream middleware can read it without a DB call.

This slice covers: `Claims` struct extension, `GenerateTokenPair` signature update, `AuthService.Login` and `AuthService.Refresh` permission fetch, `AuthMiddleware` context injection, and unit tests for JWT round-trip fidelity.

## Acceptance criteria

- [ ] `Claims` struct has a `Permissions []string` field that survives `GenerateTokenPair` → `ParseToken` round-trip intact
- [ ] `GenerateTokenPair` accepts a `permissions []string` parameter and embeds it in the access token
- [ ] `AuthService.Login` fetches the user's effective permissions (role-inherited + user-direct) and passes them to `GenerateTokenPair`
- [ ] `AuthService.Refresh` re-fetches permissions from DB and embeds them in the new access token
- [ ] `AuthMiddleware` calls `ctx.Set("permissions", claims.Permissions)` after successful token verification
- [ ] Unit test: a token generated with `["location_mgmt:create"]` parses back with `Permissions == ["location_mgmt:create"]`
- [ ] Unit test: a token generated with an empty slice parses without error and returns an empty slice

## Blocked by

None — can start immediately
