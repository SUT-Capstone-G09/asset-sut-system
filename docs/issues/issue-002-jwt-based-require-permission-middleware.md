# Issue 002 — Replace RequirePermission middleware with JWT-based check

## What to build

Replace the existing DB-backed `RequirePermission(checker PermissionChecker, module, action string)` with a new implementation that reads from the Gin context instead of querying the database. The `PermissionChecker` interface is removed. The new signature is `RequirePermission(module, action string) gin.HandlerFunc` — it reads `ctx.GetStringSlice("permissions")` and checks for the string `"module:action"`. Returns `401` if `user_id` is missing, `403` if the permission string is absent.

## Acceptance criteria

- [ ] `PermissionChecker` interface is removed
- [ ] `RequirePermission(module, action string)` reads permissions from `ctx.GetStringSlice("permissions")`
- [ ] Returns `403 Forbidden` when the `module:action` string is not present in the slice
- [ ] Returns `401 Unauthorized` when `user_id` is zero (unauthenticated)
- [ ] Calls `ctx.Next()` when the permission is present
- [ ] Unit test (Gin test mode, no DB): request with `"location_mgmt:create"` in context passes through to handler
- [ ] Unit test: request missing the permission gets `403`
- [ ] Unit test: request with zero `user_id` gets `401`

## Blocked by

- Issue 001 (permissions must be set in context by `AuthMiddleware` before this middleware can read them)
